from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from qdrant_client import AsyncQdrantClient

from app.core.qdrant import get_qdrant
from app.services.hscode_service import HSCodeService

router = APIRouter()

# hscode.py
@router.get("/search")
async def search_hs_codes_endpoint(
    q: str, 
    limit: int = 10, 
    qdrant = Depends(get_qdrant)
):
    return await HSCodeService.search_hs_codes(q=q, limit=limit, qdrant_client=qdrant)