from qdrant_client import AsyncQdrantClient
from qdrant_client.http.models import Distance, VectorParams
from app.core.config import get_settings

settings = get_settings()

class QdrantManager:
    client: AsyncQdrantClient | None = None

    @classmethod
    async def connect(cls) -> None:
        """Initialize async connection to Qdrant Vector Engine with graceful fallback."""
        try:
            cls.client = AsyncQdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                api_key=settings.QDRANT_API_KEY or None,
                https=settings.QDRANT_HTTPS,
                timeout=3.0,
            )
            await cls._init_collections()
            print("Connected to Qdrant Vector Engine on port", settings.QDRANT_PORT)
        except Exception as exc:
            print(f"Warning: Qdrant standalone vector database is offline ({exc}). AI Engine running with local fallback.")
            cls.client = None

    @classmethod
    async def close(cls) -> None:
        """Close connection gracefully on app shutdown."""
        if cls.client:
            await cls.client.close()

    @classmethod
    async def _init_collections(cls) -> None:
        """Ensure required collections exist on startup."""
        if cls.client is None:
            raise RuntimeError("Qdrant client is not initialized.")
            
        collections = await cls.client.get_collections()
        existing_names = [c.name for c in collections.collections]
        
        if settings.HS_CODE_COLLECTION_NAME not in existing_names:
            await cls.client.create_collection(
                collection_name=settings.HS_CODE_COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=settings.VECTOR_DIMENSION,
                    distance=Distance.COSINE
                )
            )

def get_qdrant():
    """Dependency for injecting Qdrant client into route handlers."""
    return QdrantManager.client

# Alias for backward compatibility
get_qdrant_client = get_qdrant

async def ping_qdrant() -> bool:
    """Check if Qdrant service is reachable."""
    try:
        if QdrantManager.client is None:
            await QdrantManager.connect()
        client = get_qdrant()
        if client:
            await client.get_collections()
            return True
        return False
    except Exception:
        return False