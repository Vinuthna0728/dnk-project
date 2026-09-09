from fastapi import APIRouter
from app.api.v1.endpoints import health, hscode, catalog, speech, studio, compliance, vision

api_router = APIRouter()

# Dev 4 Endpoints
api_router.include_router(health.router, prefix="/health", tags=["Health"])
api_router.include_router(hscode.router, prefix="/hscode", tags=["HS Code Search"])
api_router.include_router(catalog.router, prefix="/catalog", tags=["Catalog Synthesis"])
api_router.include_router(speech.router, prefix="/speech", tags=["Speech Engine"])

# Dev 3 Endpoints
api_router.include_router(studio.router, prefix="/studio", tags=["Studio Intelligence"])
api_router.include_router(compliance.router, prefix="/compliance", tags=["Regulatory Compliance"])
api_router.include_router(vision.router, prefix="/vision", tags=["Visual Extraction"])
