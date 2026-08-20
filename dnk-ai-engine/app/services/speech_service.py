import logging
from fastapi import HTTPException
from google import genai
from google.genai import types
from app.core.config import get_settings
from app.core.gemini import resolve_best_model

logger = logging.getLogger(__name__)
settings = get_settings()

ALLOWED_EXTENSIONS = {
    ".wav",
    ".mp3",
    ".m4a",
    ".ogg",
    ".flac",
    ".aac",
    ".webm",
    ".mpeg",
    ".opus",
}

_MIME_MAP = {
    "mp3": "audio/mp3",
    "mpeg": "audio/mpeg",
    "wav": "audio/wav",
    "ogg": "audio/ogg",
    "m4a": "audio/mp4",
    "flac": "audio/flac",
    "aac": "audio/aac",
    "webm": "audio/webm",
    "opus": "audio/opus",
}

class SpeechService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not configured.")

    async def transcribe_audio(
        self,
        file_bytes: bytes,
        filename: str,
    ) -> str:
        # 1. Guard against empty / very small audio payloads
        if not file_bytes or len(file_bytes) < 64:
            logger.info("Empty or near-empty audio bytes received (%d bytes); returning default.", len(file_bytes) if file_bytes else 0)
            return "Handcrafted Indian Artisan Product"

        # 2. Validate extension
        file_ext = (
            filename.rsplit(".", 1)[-1].lower()
            if "." in filename
            else "webm"
        )

        if f".{file_ext}" not in ALLOWED_EXTENSIONS:
            file_ext = "webm"

        # 3. Validate API key
        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not configured in the AI engine .env file.",
            )

        try:
            client = genai.Client(api_key=self.api_key)
        except Exception as exc:
            logger.exception("Failed to initialize Gemini client.")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Gemini client: {exc}",
            )

        # 4. Determine model and mime type
        primary_model = resolve_best_model(self.api_key)
        models_to_try = [primary_model]
        if "gemini-3.6-flash" not in models_to_try:
            models_to_try.append("gemini-3.6-flash")
        if "gemini-3.1-flash-lite" not in models_to_try:
            models_to_try.append("gemini-3.1-flash-lite")

        mime_type = _MIME_MAP.get(file_ext, "audio/webm")

        logger.info(
            "Starting Gemini transcription model=%s mime=%s filename=%s size=%d",
            primary_model,
            mime_type,
            filename,
            len(file_bytes),
        )

        # 5. Send audio to Gemini with model fallback
        last_error = None
        for model_name in models_to_try:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(
                            data=file_bytes,
                            mime_type=mime_type,
                        ),
                        (
                            "Transcribe this spoken product description into clear text. "
                            "Preserve any regional language, product names, materials, and artisan details. "
                            "If the audio is silent or background noise, return 'Handcrafted Indian Artisan Product'. "
                            "Return only the transcription text."
                        ),
                    ],
                )

                transcript = (
                    response.text.strip()
                    if response and response.text
                    else ""
                )

                if transcript:
                    logger.info(
                        "Gemini transcription successful model=%s length=%d",
                        model_name,
                        len(transcript),
                    )
                    return transcript

            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Transcription attempt with %s failed (%s), trying next model candidate...",
                    model_name,
                    exc,
                )

        # If transcription was inaudible/failed gracefully, return fallback text
        logger.warning("All audio transcription models exhausted; returning fallback. Last error: %s", last_error)
        return "Handcrafted Indian Artisan Product"
