from pydantic import BaseModel, Field
from typing import List

class ComplianceCheckRequest(BaseModel):
    product_title: str
    category: str
    material_declared: str
    dye_type: str
    destination_countries: List[str]

class FlaggedMaterial(BaseModel):
    substance: str
    prohibited_in: List[str]
    governing_body: str
    reason_en: str
    reason_hi: str

class AllowedChannels(BaseModel):
    d2c_inland: bool
    b2b_inland: bool
    export_dnk: bool

class ComplianceCheckResponse(BaseModel):
    is_export_viable: bool
    risk_level: str
    compliance_score: float = Field(ge=0.0, le=1.0)
    flagged_materials: List[FlaggedMaterial]
    allowed_channels: AllowedChannels
    suggested_artisan_action: str
