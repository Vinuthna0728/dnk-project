import logging

from google import genai

from app.core.config import get_settings

logger = logging.getLogger(__name__)


# ============================================================
# GEMINI MODEL RESOLVER
# ============================================================

def resolve_best_model(api_key: str | None = None) -> str:
    """
    Return the configured Gemini model.

    The model is configured through:

        GEMINI_MODEL=gemini-3.6-flash

    Gemini 3.6 Flash is currently a stable Gemini model
    supporting multimodal input including audio.
    """

    settings = get_settings()

    model_name = settings.GEMINI_MODEL.strip()

    if not model_name:
        model_name = "gemini-3.6-flash"

    logger.info(
        "Using Gemini model: %s",
        model_name,
    )

    return model_name