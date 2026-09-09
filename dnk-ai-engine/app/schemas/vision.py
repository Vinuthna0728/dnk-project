from pydantic import BaseModel, Field
from typing import List

class VisualFeatureRequest(BaseModel):
    image_path: str = Field(..., description="Local path or URL to the processed studio image")

class VisualFeatureResponse(BaseModel):
    primary_craft: str = Field(description="e.g., Handloom Weaving, Terracotta Pottery")
    visual_motif: str = Field(description="e.g., Bandhani, Ikat, Geometric")
    dominant_colors: List[str] = Field(description="Hex codes of dominant colors")
    embedding_vector: List[float] = Field(description="512-dimensional CLIP/ViT embedding vector")
