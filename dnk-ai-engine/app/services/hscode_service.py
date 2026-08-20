from fastapi import responses
from fastapi import responses
import logging
from typing import List, Any, Optional

from sentence_transformers import SentenceTransformer

from app.core.qdrant import get_qdrant
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

import json
from pathlib import Path
import numpy as np

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "itc_hs_codes.json"
_cached_data = []
_cached_embeddings = None

def _load_hs_data():
    global _cached_data, _cached_embeddings
    if not _cached_data and DATA_PATH.exists():
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _cached_data = json.load(f)
            texts = [f"{item.get('description', '')} {item.get('chapter_title', '')}" for item in _cached_data]
            _cached_embeddings = _encoder.encode(texts, convert_to_numpy=True)
            logger.info("Loaded %d ITC HS codes with pre-computed vector embeddings", len(_cached_data))
        except Exception as e:
            logger.warning("Failed to load local HS dataset: %s", e)


# Load the same embedding model used during ingestion (384-dim).
# Loaded once at module level so it's shared across all requests.
_encoder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")


class HSCodeService:
    @staticmethod
    async def search_hs_codes(
        q: str,
        limit: int = 10,
        qdrant_client: Optional[Any] = None,
    ) -> List[Any]:
        """Semantic vector search over the HS-codes Qdrant collection."""

        # Guard against empty / whitespace-only queries
        if not q or not q.strip():
            logger.warning("search_hs_codes called with empty query")
            return []

        # Generate the query embedding (same model & dim as ingestion: 384-dim)
        query_embedding: List[float] = _encoder.encode(q).tolist()

        # Fallback to fetching the client if it wasn't passed directly
        if qdrant_client is None:
            qdrant_client = get_qdrant()

        if qdrant_client is None:
            _load_hs_data()
            if _cached_data and _cached_embeddings is not None:
                query_vec = np.array(query_embedding)
                # Compute 384-dim cosine similarities
                dot_products = np.dot(_cached_embeddings, query_vec)
                norms = np.linalg.norm(_cached_embeddings, axis=1) * np.linalg.norm(query_vec)
                sims = dot_products / (norms + 1e-9)
                top_indices = np.argsort(-sims)[:limit]
                
                class MockPoint:
                    def __init__(self, score, payload):
                        self.score = float(score)
                        self.payload = payload

                results = [
                    MockPoint(score=sims[i], payload=_cached_data[i])
                    for i in top_indices if sims[i] > 0.1
                ]
                logger.info(f"Vector search returned {len(results)} matches from embedded HS vector engine.")
                return results
            return []

        try:
            # Perform the actual vector search
            response = await qdrant_client.query_points(
                collection_name=settings.HS_CODE_COLLECTION_NAME,
                query=query_embedding,
                limit=limit,
            )
            return response.points
        except Exception as exc:
            logger.warning(f"Qdrant query failed ({exc}), returning empty vector matches.")
            return []
    