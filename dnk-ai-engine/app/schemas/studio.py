from pydantic import BaseModel, Field
from typing import List

class ImageMetadata(BaseModel):
    width: int = Field(default=1024, description="Output width in pixels")
    height: int = Field(default=1024, description="Output height in pixels")
    format: str = Field(default="WEBP", description="Output image format")
    aspect_ratio: str = Field(default="1:1", description="Output aspect ratio")

class VisualCues(BaseModel):
    primary_craft: str | None = None
    material_guess: str | None = None
    dominant_colors: List[str] = Field(default_factory=list)
    is_blurry: bool = False

class StudioEnhanceResponse(BaseModel):
    status: str = Field(default="SUCCESS")
    processing_time_ms: int
    raw_image_url: str
    enhanced_image_url: str
    image_metadata: ImageMetadata
    detected_visual_cues: VisualCues | None = None
    quality_score: float = Field(ge=0.0, le=1.0)
