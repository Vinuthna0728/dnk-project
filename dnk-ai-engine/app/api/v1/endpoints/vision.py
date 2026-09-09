from fastapi import APIRouter, HTTPException
from app.schemas.vision import VisualFeatureRequest, VisualFeatureResponse
from app.services.visual_feature_service import extract_visual_tags, generate_visual_embedding
import json

router = APIRouter()

@router.post("/extract-features", response_model=VisualFeatureResponse)
async def extract_features(request: VisualFeatureRequest):
    try:
        return VisualFeatureResponse(
            primary_craft="Wood Carving/Handicraft",
            visual_motif="Geometric",
            dominant_colors=["#4A2C11", "#8D5B28"],
            embedding_vector=[0.012, -0.045, 0.089]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to extract visual features.")
