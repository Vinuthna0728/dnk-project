import logging
from pathlib import Path

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
    ".mp3": "audio/mpeg",
    ".mpeg": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".flac": "audio/flac",
    ".aac": "audio/aac",
    ".webm": "audio/webm",
    ".opus": "audio/opus",
}

# This exact string is returned when transcription genuinely could not be
# performed (all models failed/rate-limited, or the audio was empty).
# catalog_service.py checks for this exact string and MUST treat it as
# "no real product info available" — never dress it up as a real listing.
FALLBACK_TRANSCRIPT = "Handcrafted Indian Artisan Product"

# Any of these (case-insensitive) coming back from the model means
# "nothing usable was said" -> fall back, don't feed it to the catalog LLM.
_UNUSABLE_TRANSCRIPTS = {
    "[unclear]",
    "unclear",
    "",
}


class SpeechService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY

        if not self.api_key:
            logger.error("GEMINI_API_KEY is not configured.")

    async def transcribe_audio(
        self,
        file_bytes: bytes,
        filename: str,
    ) -> str:
        if not file_bytes or len(file_bytes) < 64:
            logger.warning("Audio file is empty or too small.")
            return FALLBACK_TRANSCRIPT

        if len(file_bytes) > 25 * 1024 * 1024:
            raise HTTPException(
                status_code=413,
                detail="Audio file is too large. Maximum allowed size is 25 MB.",
            )

        extension = Path(filename or "").suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Unsupported audio format. Allowed formats: "
                    + ", ".join(sorted(ALLOWED_EXTENSIONS))
                ),
            )

        if not self.api_key:
            raise HTTPException(
                status_code=500,
                detail="GEMINI_API_KEY is not configured in the AI engine .env file.",
            )

        mime_type = _MIME_MAP[extension]

        try:
            client = genai.Client(api_key=self.api_key)
            primary_model = resolve_best_model(self.api_key)
        except Exception as exc:
            logger.exception("Failed to initialize Gemini client or model.")
            raise HTTPException(
                status_code=500,
                detail="AI engine could not initialize the Gemini client.",
            ) from exc

        models_to_try = []

        # NOTE: gemini-2.5-flash and gemini-2.0-flash are RETIRED (404 Not
        # Found as of this account). Fallback list now matches the models
        # that actually respond for this API key/project — the same ones
        # catalog_service.py's fallback list already uses successfully.
        for model_name in (
            primary_model,
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-3.7-flash",
        ):
            if model_name and model_name not in models_to_try:
                models_to_try.append(model_name)

        prompt = """
You are a strict speech-to-text transcription engine.

Transcribe only the words that are actually spoken in the audio.

Rules:
1. Do not infer, guess, complete, or improve the sentence.
2. Preserve product names, materials, craft techniques, quantities,
   prices, locations, and artisan details that are CLEARLY spoken.
3. Preserve the speaker's original language and wording. The speaker
   may use Telugu, Hindi, Tamil, Kannada, Malayalam, English, or a
   regional Indian dialect.
4. Do not add product names, materials, colours, prices, weights,
   jewellery terms, or craft details that are not clearly spoken.
5. If a word is unclear, write [unclear] instead of guessing.
6. Do not use any accompanying image to guess what the speaker said.
7. Return only the transcription. No explanations, labels, quotation
   marks, or markdown.
8. If the audio is entirely silent, unintelligible, or only
   background noise, return exactly: [unclear]
""".strip()

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
                        prompt,
                    ],
                    config=types.GenerateContentConfig(
                        temperature=0.0,
                        top_p=1.0,
                        top_k=1,
                    ),
                )

                transcript = (
                    response.text.strip()
                    if response and response.text
                    else ""
                )

                logger.info("RAW transcript from model %s: %r", model_name, transcript)

                normalized = transcript.strip().lower()

                if transcript and normalized not in _UNUSABLE_TRANSCRIPTS:
                    logger.info(
                        "Transcription successful: model=%s, length=%d",
                        model_name,
                        len(transcript),
                    )
                    return transcript

                # Model responded but said "nothing usable" -> try next model
                # instead of immediately falling back, audio might just need
                # a different model to pick it up.
                logger.warning(
                    "Model %s returned an unusable transcript (%r); trying next model.",
                    model_name,
                    transcript,
                )

            except Exception as exc:
                last_error = exc
                logger.warning(
                    "Transcription failed with model %s: %s",
                    model_name,
                    exc,
                )

        logger.error(
            "All transcription models failed or returned unusable transcripts. Last error: %s",
            last_error,
        )

        return FALLBACK_TRANSCRIPT