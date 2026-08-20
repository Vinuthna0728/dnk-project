import asyncio
import json
import logging
import uuid
from pathlib import Path
from typing import Any, Dict, List, Tuple

from qdrant_client import AsyncQdrantClient
from qdrant_client.http import models
from sentence_transformers import SentenceTransformer

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Config Configuration
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333
COLLECTION_NAME = "itc_hs_codes"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"  # Produces 384-dimensional vectors
VECTOR_SIZE = 384
BATCH_SIZE = 64
DATA_FILE_PATH = Path("data/itc_hs_codes.json")

class HSCodeIngestionPipeline:
    def __init__(self):
        logger.info(f"Loading Embedding Model: {EMBEDDING_MODEL_NAME}...")
        self.encoder = SentenceTransformer(EMBEDDING_MODEL_NAME)
        self.client = AsyncQdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

    async def create_collection_with_indexes(self) -> None:
        """Helper to create collection and payload indexes."""
        logger.info(f"Creating collection '{COLLECTION_NAME}' with vector size {VECTOR_SIZE}...")
        await self.client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=VECTOR_SIZE,
                distance=models.Distance.COSINE
            )
        )
        
        # Create Payload Indexes for fast filtered lookups
        await self.client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="chapter",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        await self.client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="hs_code",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        logger.info("Collection and Payload Indexes created successfully.")

    async def ensure_collection(self) -> None:
        """Create or recreate collection if vector size mismatched."""
        collections = await self.client.get_collections()
        existing = [c.name for c in collections.collections]

        if COLLECTION_NAME in existing:
            collection_info = await self.client.get_collection(COLLECTION_NAME)
            current_dim = collection_info.config.params.vectors.size

            if current_dim != VECTOR_SIZE:
                logger.warning(
                    f"Collection dimension mismatch! Existing: {current_dim}, Required: {VECTOR_SIZE}. "
                    f"Recreating collection '{COLLECTION_NAME}'..."
                )
                await self.client.delete_collection(COLLECTION_NAME)
                await self.create_collection_with_indexes()
            else:
                logger.info(f"Collection '{COLLECTION_NAME}' exists with matching vector dimension ({VECTOR_SIZE}).")
        else:
            await self.create_collection_with_indexes()

    def sanitize_payload(self, raw_item: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Formulate rich semantic text for embedding and clean metadata payload.
        """
        hs_code = str(raw_item.get("hs_code", "")).strip()
        description = str(raw_item.get("description", "")).strip()
        chapter_title = str(raw_item.get("chapter_title", "")).strip()
        
        # Enriched context string yields much higher retrieval accuracy
        text_for_embedding = f"HS Code {hs_code}: {description}. Category: {chapter_title}"
        
        payload = {
            "hs_code": hs_code,
            "description": description,
            "chapter": str(raw_item.get("chapter", "")).strip(),
            "chapter_title": chapter_title,
            "duty_rate": str(raw_item.get("duty_rate", "N/A")),
        }
        
        return text_for_embedding, payload

    async def run(self) -> None:
        """Main execution workflow."""
        if not DATA_FILE_PATH.exists():
            logger.error(f"Data file not found at: {DATA_FILE_PATH.resolve()}")
            return

        await self.ensure_collection()

        logger.info(f"Reading dataset from {DATA_FILE_PATH}...")
        with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        logger.info(f"Total items to ingest: {len(raw_data)}")

        # Process in batches
        for i in range(0, len(raw_data), BATCH_SIZE):
            batch_raw = raw_data[i : i + BATCH_SIZE]
            
            texts_to_embed: List[str] = []
            points: List[Tuple[str, Dict[str, Any]]] = []

            for item in batch_raw:
                text_to_embed, payload = self.sanitize_payload(item)
                texts_to_embed.append(text_to_embed)
                
                # Generate deterministic UUID based on HS Code for idempotency
                point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, payload["hs_code"]))
                
                points.append((point_id, payload))

            # Generate Embeddings for current batch
            logger.info(f"Generating embeddings for batch {i // BATCH_SIZE + 1}...")
            embeddings = self.encoder.encode(texts_to_embed, show_progress_bar=False)

            # Construct Qdrant PointStructs
            qdrant_points = [
                models.PointStruct(
                    id=point_id,
                    vector=vector.tolist(),
                    payload=payload
                )
                for (point_id, payload), vector in zip(points, embeddings)
            ]

            # Upsert into Qdrant
            await self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=qdrant_points
            )
            logger.info(f"Successfully upserted {len(qdrant_points)} records into Qdrant.")

        await self.client.close()
        logger.info("Ingestion Pipeline completed successfully.")


if __name__ == "__main__":
    pipeline = HSCodeIngestionPipeline()
    asyncio.run(pipeline.run())