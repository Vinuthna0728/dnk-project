from fastapi import APIRouter, Depends
from qdrant_client import AsyncQdrantClient

from app.core.qdrant import get_qdrant_client, ping_qdrant
from app.schemas.health import HealthResponse, VectorDBStatus

router = APIRouter()


@router.get(
    "/",
    response_model=HealthResponse,
    summary="Application health check",
)
async def health_check() -> HealthResponse:
    """Returns the overall application health status."""
    return HealthResponse(status="ok")


@router.get(
    "/vector-db",
    response_model=VectorDBStatus,
    summary="Vector DB (Qdrant) ping",
)
async def vector_db_ping(
    client: AsyncQdrantClient = Depends(get_qdrant_client),
) -> VectorDBStatus:
    """Pings Qdrant and returns its reachability status."""
    reachable = await ping_qdrant()
    return VectorDBStatus(
        reachable=reachable,
        status="ok" if reachable else "unreachable",
    )
