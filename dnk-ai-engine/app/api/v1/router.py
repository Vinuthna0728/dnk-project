from fastapi import APIRouter
from app.api.v1.endpoints import health, hscode, catalog, speech

api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(hscode.router, prefix="/hscode", tags=["HS Code Search"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["Catalog Synthesis"])
api_router.include_router(speech.router, prefix="/speech", tags=["Speech Engine"])