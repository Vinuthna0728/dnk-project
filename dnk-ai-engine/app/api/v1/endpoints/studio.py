import time
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.schemas.studio import StudioEnhanceResponse, ImageMetadata, VisualCues
from app.services.storage_service import save_raw_image
from app.services.studio_service import process_studio_image
import aiofiles
import os

router = APIRouter()

@router.post("/enhance", response_model=StudioEnhanceResponse)
async def enhance_artisan_image(
    file: UploadFile = File(..., description="Image file: JPEG/PNG/WebP, <= 15MB"),
    artisan_id: str = Form(...),
    apply_shadow: bool = Form(default=True),
    canvas_bg: str = Form(default="#FFFFFF")
):
    start_time = time.time()
    raw_file_path = await save_raw_image(file, artisan_id)

    async with aiofiles.open(raw_file_path, 'rb') as f:
        input_bytes = await f.read()

    try:
        enhanced_bytes = process_studio_image(
            input_image_bytes=input_bytes,
            apply_shadow=apply_shadow,
            bg_color=canvas_bg
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Image processing pipeline failed.")

    enhanced_filename = raw_file_path.replace("raw", "studio").replace(".jpg", ".webp").replace(".png", ".webp")
    os.makedirs(os.path.dirname(enhanced_filename), exist_ok=True)

    async with aiofiles.open(enhanced_filename, 'wb') as f:
        await f.write(enhanced_bytes)

    processing_time = int((time.time() - start_time) * 1000)

    raw_url_path = raw_file_path.replace("\\", "/")
    enhanced_url_path = enhanced_filename.replace("\\", "/")

    return StudioEnhanceResponse(
        status="SUCCESS",
        processing_time_ms=processing_time,
        raw_image_url=f"http://127.0.0.1:8001/{raw_url_path}",
        enhanced_image_url=f"http://127.0.0.1:8001/{enhanced_url_path}",
        image_metadata=ImageMetadata(width=1024, height=1024, format="WEBP", aspect_ratio="1:1"),
        detected_visual_cues=VisualCues(is_blurry=False),
        quality_score=0.95
    )
