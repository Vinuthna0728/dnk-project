import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import get_settings
from app.core.qdrant import QdrantManager
from app.core.onnx_session import onnx_worker
from app.core.gemini_client import gemini_worker
from app.api.v1.router import api_router

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
settings = get_settings()

os.makedirs("static/raw", exist_ok=True)
os.makedirs("static/studio", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await QdrantManager.connect()
    except Exception as e:
        print(f"Warning: Qdrant DB connection deferred: {e}")

    try:
        onnx_worker.initialize()
    except Exception as e:
        print(f"Warning: ONNX worker initialization deferred: {e}")

    try:
        gemini_worker.initialize()
    except Exception as e:
        print(f"Warning: Gemini client initialization deferred: {e}")

    yield

    try:
        await QdrantManager.close()
    except Exception:
        pass

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

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health")
def root_health():
    return {"status": "ok", "service": "dnk-ai-engine", "version": settings.VERSION}

app.include_router(api_router, prefix=settings.API_V1_STR)
