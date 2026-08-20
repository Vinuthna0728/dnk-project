from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.core.qdrant import QdrantManager
from app.api.v1.router import api_router
import os

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup phase: Connect to Vector Database
    await QdrantManager.connect()
    yield
    # Shutdown phase: Clean connections
    await QdrantManager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def root_health():
    return {"status": "ok", "service": "dnk-ai-engine", "version": settings.VERSION}

app.include_router(api_router, prefix=settings.API_V1_STR)
