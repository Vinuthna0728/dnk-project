import os
import requests
from dotenv import load_dotenv

load_dotenv()

AI_ENGINE_URL = os.getenv(
    "AI_ENGINE_URL",
    "http://127.0.0.1:8001"
)


def check_ai_engine_health() -> bool:
    """Check if the AI Engine is reachable and healthy."""
    try:
        res = requests.get(f"{AI_ENGINE_URL}/health", timeout=3)
        return res.status_code == 200
    except Exception:
        try:
            res = requests.get(f"{AI_ENGINE_URL}/api/v1/health", timeout=3)
            return res.status_code == 200
        except Exception:
            return False


def generate_catalog_from_ai(
    raw_text: str = "",
    source_language: str = "auto",
    image_base64: str | None = None,
    image_mime_type: str = "image/jpeg"
):
    """
    Send seller product text and/or image to the DNK AI Engine.

    AI Engine performs:
    1. Multimodal image analysis (Gemini Vision)
    2. HS-code vector matching using Qdrant
    3. Gemini-based export catalog generation
    """
    url = f"{AI_ENGINE_URL}/api/v1/catalog/generate"

    payload = {
        "raw_text": raw_text or "",
        "source_language": source_language or "auto",
        "image_base64": image_base64,
        "image_mime_type": image_mime_type or "image/jpeg"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            timeout=120
        )
    except requests.RequestException as exc:
        raise RuntimeError(
            f"AI Engine is unavailable at {AI_ENGINE_URL}. Please ensure the AI Engine is running. ({exc})"
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"AI Engine returned HTTP {response.status_code}: {response.text}"
        )

    return response.json()


def generate_catalog_from_voice_ai(
    file_bytes: bytes,
    filename: str = "recording.webm",
    content_type: str = "audio/webm",
    image_base64: str | None = None,
    image_mime_type: str = "image/jpeg"
):
    """
    Send seller voice recording bytes and optional product image to the DNK AI Engine.

    AI Engine performs:
    1. STT transcription (Gemini multimodal)
    2. Multimodal Image Analysis
    3. Trade keyword extraction & HS-code vector matching using Qdrant
    4. Gemini-based export catalog synthesis
    """
    url = f"{AI_ENGINE_URL}/api/v1/speech/audio-to-all"

    files = {
        "file": (filename, file_bytes, content_type)
    }

    data = {}
    if image_base64:
        data["image_base64"] = image_base64
        data["image_mime_type"] = image_mime_type or "image/jpeg"

    try:
        response = requests.post(
            url,
            files=files,
            data=data if data else None,
            timeout=120
        )
    except requests.RequestException as exc:
        raise RuntimeError(
            f"AI Engine is unavailable at {AI_ENGINE_URL}. Please ensure the AI Engine is running. ({exc})"
        )

    if response.status_code != 200:
        raise RuntimeError(
            f"AI Engine returned HTTP {response.status_code}: {response.text}"
        )

    return response.json()
