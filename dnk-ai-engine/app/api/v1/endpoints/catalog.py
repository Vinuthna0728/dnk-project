import logging

from fastapi import APIRouter, Depends
from qdrant_client import AsyncQdrantClient

from app.core.qdrant import get_qdrant
from app.schemas.catalog import CatalogGenerateRequest, ExportCatalogResponse
from app.services.catalog_service import CatalogService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/generate",
    response_model=ExportCatalogResponse,
    summary="Generate export-ready product catalog",
)
async def generate_catalog(
    payload: CatalogGenerateRequest,
    qdrant: AsyncQdrantClient = Depends(get_qdrant),
) -> ExportCatalogResponse:
    """
    Accepts raw seller product text (any language) and/or base64-encoded image,
    performs multimodal analysis & HS code vector matching via Qdrant,
    then uses Gemini to synthesize a structured, export-ready catalog entry.
    """
    has_image = bool(payload.image_base64)
    logger.info(
        "generate_catalog: raw_text='%s' source_language=%s has_image=%s",
        (payload.raw_text or "")[:120],
        payload.source_language,
        has_image,
    )

    return await CatalogService.generate_catalog(
        raw_text=payload.raw_text or "",
        qdrant=qdrant,
        image_base64=payload.image_base64,
        image_mime_type=payload.image_mime_type or "image/jpeg",
    )