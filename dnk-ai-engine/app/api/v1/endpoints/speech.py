import logging
import time

from fastapi import APIRouter, File, UploadFile, Form, Depends
from qdrant_client import AsyncQdrantClient

from app.core.qdrant import get_qdrant
from app.schemas.speech import TranscriptionResponse
from app.schemas.catalog import ExportCatalogResponse
from app.services.speech_service import SpeechService
from app.services.catalog_service import CatalogService

logger = logging.getLogger(__name__)
router = APIRouter()

_speech_service = SpeechService()


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_speech(
    file: UploadFile = File(..., description="Audio file containing spoken product details"),
):
    start = time.perf_counter()
    file_bytes = await file.read()

    transcript = await _speech_service.transcribe_audio(
        file_bytes=file_bytes,
        filename=file.filename or "recording.webm",
    )

    elapsed = round(time.perf_counter() - start, 3)

    return TranscriptionResponse(
        filename=file.filename or "recording.webm",
        transcript=transcript,
        detected_language=None,
        processing_time_seconds=elapsed,
    )


@router.post("/audio-to-catalog", response_model=ExportCatalogResponse)
async def voice_to_catalog(
    file: UploadFile = File(..., description="Audio file containing spoken product details"),
    image_base64: str | None = Form(None),
    image_mime_type: str = Form("image/jpeg"),
    qdrant: AsyncQdrantClient = Depends(get_qdrant),
):
    file_bytes = await file.read()
    filename = file.filename or "recording.webm"

    transcript = await _speech_service.transcribe_audio(
        file_bytes=file_bytes,
        filename=filename,
    )

    catalog_response = await CatalogService.generate_catalog(
        raw_text=transcript,
        qdrant=qdrant,
        image_base64=image_base64,
        image_mime_type=image_mime_type,
    )

    return catalog_response


@router.post(
    "/audio-to-all",
    response_model=ExportCatalogResponse,
    summary="Unified voice + image multimodal pipeline called by core backend",
)
async def audio_to_all(
    file: UploadFile = File(..., description="Audio file from artisan"),
    image_base64: str | None = Form(None),
    image_mime_type: str = Form("image/jpeg"),
    qdrant: AsyncQdrantClient = Depends(get_qdrant),
):
    file_bytes = await file.read()
    filename = file.filename or "recording.webm"

    logger.info(
        "audio_to_all: received audio file='%s' size=%d bytes, has_image=%s",
        filename,
        len(file_bytes),
        image_base64 is not None,
    )

    # 1. Transcribe speech
    transcript = await _speech_service.transcribe_audio(
        file_bytes=file_bytes,
        filename=filename,
    )

    logger.info("audio_to_all: transcript='%s'", transcript[:120])

    # 2. Synthesize complete export catalog using BOTH image and transcript
    catalog_response = await CatalogService.generate_catalog(
        raw_text=transcript,
        qdrant=qdrant,
        image_base64=image_base64,
        image_mime_type=image_mime_type,
    )

    return catalog_response
