import logging
from typing import List, Any, Optional
from pathlib import Path
import json

from sentence_transformers import SentenceTransformer
from app.core.qdrant import get_qdrant
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "itc_hs_codes.json"
_cached_data = []

def _load_hs_data():
    global _cached_data
    if not _cached_data and DATA_PATH.exists():
        try:
            with open(DATA_PATH, "r", encoding="utf-8") as f:
                _cached_data = json.load(f)
            logger.info("Loaded %d ITC HS codes", len(_cached_data))
        except Exception as e:
            logger.warning("Failed to load local HS dataset: %s", e)

_encoder = None

def _get_encoder():
    global _encoder
    if _encoder is None:
        _encoder = SentenceTransformer("all-MiniLM-L6-v2", device="cpu")
    return _encoder

class HSCodeService:
    @staticmethod
    async def search_hs_codes(
        q: str,
        limit: int = 10,
        qdrant_client: Optional[Any] = None,
    ) -> List[Any]:
        """Semantic vector search over the HS-codes Qdrant collection with fast local fallback."""
        if not q or not q.strip():
            logger.warning("search_hs_codes called with empty query")
            return []

        if qdrant_client is None:
            qdrant_client = get_qdrant()

        if qdrant_client is None:
            _load_hs_data()
            if _cached_data:
                q_lower = q.lower().strip()

                class MockPoint:
                    def __init__(self, score, payload):
                        self.score = float(score)
                        self.payload = payload

                exact_matches = []
                partial_matches = []
                for item in _cached_data:
                    desc = item.get('description', '').lower()
                    ch = item.get('chapter_title', '').lower()
                    if q_lower in desc or q_lower in ch:
                        exact_matches.append(MockPoint(score=0.92, payload=item))
                    elif any(w in desc for w in q_lower.split() if len(w) > 2):
                        partial_matches.append(MockPoint(score=0.65, payload=item))

                results = exact_matches + partial_matches
                if results:
                    return results[:limit]
                return [MockPoint(score=0.5, payload=item) for item in _cached_data[:limit]]
            return []

        try:
            query_embedding: List[float] = _get_encoder().encode(q).tolist()
            response = await qdrant_client.query_points(
                collection_name=settings.HS_CODE_COLLECTION_NAME,
                query=query_embedding,
                limit=limit,
            )
            return response.points
        except Exception as exc:
            logger.warning(f"Qdrant query failed ({exc}), falling back to local dataset matching.")
            _load_hs_data()
            if _cached_data:
                q_lower = q.lower()
                class MockPoint:
                    def __init__(self, score, payload):
                        self.score = float(score)
                        self.payload = payload
                matched = [MockPoint(score=0.8, payload=i) for i in _cached_data if q_lower in i.get('description','').lower()]
                return matched[:limit] if matched else [MockPoint(score=0.5, payload=i) for i in _cached_data[:limit]]
            return []
