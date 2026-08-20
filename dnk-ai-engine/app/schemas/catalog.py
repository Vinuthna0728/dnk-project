from typing import List, Optional
from pydantic import BaseModel, Field


class CatalogGenerateRequest(BaseModel):
    raw_text: Optional[str] = Field(
        default="",
        description="Seller product text in regional language or English",
        examples=["हाथ से बनी सुती कुर्ती महिलाओं के लिए, लाल रंग, साइज़ M L XL"]
    )
    source_language: Optional[str] = Field(
        default="auto",
        description="Source language ISO code (e.g., hi, kn, ta, en) or 'auto'"
    )
    image_base64: Optional[str] = Field(
        default=None,
        description="Optional base64-encoded image string of the artisan craft"
    )
    image_mime_type: Optional[str] = Field(
        default="image/jpeg",
        description="MIME type of the uploaded image (e.g. image/jpeg, image/png, image/webp)"
    )


class ExportCatalogResponse(BaseModel):
    product_title_en: str = Field(..., description="Professional English product title")
    product_description_en: str = Field(..., description="Detailed description formatted for global marketplaces")
    translated_title_local: str = Field(..., description="Clean translated title in local language")
    hs_code: str = Field(..., description="Primary 8-digit ITC-HS Code matched")
    hs_code_confidence: float = Field(..., description="Vector similarity score for the matched HS code")
    category: str = Field(..., description="Export product category")
    key_features: List[str] = Field(..., description="Bullet point features extracted")
    suggested_tags: List[str] = Field(..., description="SEO tags for international e-commerce platforms")
    estimated_price_inr: Optional[int] = Field(default=None, description="Estimated fair artisan price in INR")
    estimated_weight: Optional[str] = Field(default=None, description="Estimated shipping weight with units")