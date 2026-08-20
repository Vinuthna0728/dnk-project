from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str

    model_config = {"json_schema_extra": {"example": {"status": "ok"}}}


class VectorDBStatus(BaseModel):
    reachable: bool
    status: str

    model_config = {
        "json_schema_extra": {
            "example": {"reachable": True, "status": "ok"}
        }
    }
