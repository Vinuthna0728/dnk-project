from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "DNK AI Engine"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"
    
    # Gemini Configurations
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    
    # Qdrant Configurations
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str | None = None
    QDRANT_HTTPS: bool = False  # <--- ADD THIS LINE
    
    HS_CODE_COLLECTION_NAME: str = "itc_hs_codes"
    VECTOR_DIMENSION: int = 384
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache()
def get_settings() -> Settings:
    return Settings()