from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
)

# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductChannels(BaseModel):
    is_d2c: bool = False
    is_b2b: bool = False
    is_export: bool = False


class ProductPricing(BaseModel):
    cost_price_inr: Decimal | None = None
    retail_price_inr: Decimal | None = None
    wholesale_price_inr: Decimal | None = None
    b2b_moq: int = 10
    b2b_bulk_discount_percentage: float | None = None
    export_price_usd: Decimal | None = None


class ProductDimensions(BaseModel):
    length: float | None = None
    width: float | None = None
    height: float | None = None


class ProductLogistics(BaseModel):
    weight_grams: float | None = None
    dimensions_cm: ProductDimensions = ProductDimensions()
    is_fragile: bool = False


class ProductImages(BaseModel):
    raw_url: str | None = None
    enhanced_url: str | None = None


class ProductCreate(BaseModel):
    # --------------------------------------------------------
    # Legacy fields
    # --------------------------------------------------------
    # Kept for compatibility with the existing integrated API.

    title: str | None = None
    description: str | None = None
    price_inr: Decimal | None = None
    image_urls: list[str] | None = None

    # --------------------------------------------------------
    # Unified multilingual catalog
    # --------------------------------------------------------

    title_en: str | None = None
    title_hi: str | None = None
    description_en: str | None = None
    description_hi: str | None = None
    category: str | None = None

    # --------------------------------------------------------
    # HS classification
    # --------------------------------------------------------

    hs_code: str | None = None
    hs_confidence: float | None = None

    # --------------------------------------------------------
    # Unified channel data
    # --------------------------------------------------------

    channels: ProductChannels = ProductChannels()
    pricing: ProductPricing = ProductPricing()
    logistics: ProductLogistics = ProductLogistics()
    images: ProductImages = ProductImages()


class ProductUpdate(BaseModel):
    # --------------------------------------------------------
    # Legacy fields
    # --------------------------------------------------------

    title: str | None = None
    description: str | None = None
    price_inr: Decimal | None = None
    image_urls: list[str] | None = None

    # --------------------------------------------------------
    # Unified multilingual catalog
    # --------------------------------------------------------

    title_en: str | None = None
    title_hi: str | None = None
    description_en: str | None = None
    description_hi: str | None = None
    category: str | None = None

    # --------------------------------------------------------
    # HS classification
    # --------------------------------------------------------

    hs_code: str | None = None
    hs_confidence: float | None = None

    # --------------------------------------------------------
    # Unified channel data
    # --------------------------------------------------------

    channels: ProductChannels | None = None
    pricing: ProductPricing | None = None
    logistics: ProductLogistics | None = None
    images: ProductImages | None = None


class ProductResponse(BaseModel):
    id: int
    seller_id: int

    # --------------------------------------------------------
    # Legacy fields
    # --------------------------------------------------------

    title: str
    description: str | None
    price_inr: Decimal
    image_urls: list[str] | None

    # --------------------------------------------------------
    # Unified multilingual catalog
    # --------------------------------------------------------

    title_en: str | None
    title_hi: str | None
    description_en: str | None
    description_hi: str | None
    category: str | None

    # --------------------------------------------------------
    # HS classification
    # --------------------------------------------------------

    hs_code: str | None
    hs_confidence: float | None

    # --------------------------------------------------------
    # Unified channel data
    # --------------------------------------------------------

    channels: ProductChannels
    pricing: ProductPricing
    logistics: ProductLogistics
    images: ProductImages

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )

# ============================================================
# USER SCHEMAS
# ============================================================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    upi_id: str | None = None
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: str | None
    upi_id: str | None
    role: str

    model_config = ConfigDict(
        from_attributes=True
    )


class UserProfileUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    upi_id: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# ============================================================
# ORDER SCHEMAS
# ============================================================

class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1
    shipping_address: str
    country: str


class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    product_id: int
    quantity: int
    amount_inr: float
    shipping_address: str
    country: str
    status: str
    created_at: datetime
    checkout_url: str | None = None
    stripe_session_id: str | None = None
    escrow_id: int | None = None

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# ESCROW SCHEMAS
# ============================================================

class EscrowCreate(BaseModel):
    order_id: int


class EscrowResponse(BaseModel):
    id: int
    order_id: int
    buyer_id: int
    seller_id: int
    amount_inr: float
    status: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class EscrowTransition(BaseModel):
    status: Literal[
        "BUYER_PAYMENT",
        "FUNDS_HELD_ESCROW",
        "POSTAL_SCAN",
        "RELEASED_TO_SELLER_BANK",
    ]
# ============================================================
# PAYOUT SCHEMAS
# ============================================================

class PayoutResponse(BaseModel):
    id: int
    escrow_id: int
    order_id: int
    seller_id: int
    amount_inr: float
    destination_type: str
    destination: str
    status: str
    payout_reference: str | None
    created_at: datetime
    completed_at: datetime | None

    model_config = ConfigDict(
        from_attributes=True
    )

# ============================================================
# COMPLIANCE SCHEMAS
# ============================================================

class ComplianceCheckCreate(BaseModel):
    order_id: int
    product_id: int
    country: str


class ComplianceCheckResponse(BaseModel):
    id: int
    order_id: int
    product_id: int
    country: str
    hs_code: str | None
    status: str
    reason: str | None
    confidence: float | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# PBE - POSTAL BILL OF EXPORT
# ============================================================

class PBECreate(BaseModel):
    order_id: int
    currency: str = "USD"
    exchange_rate: float | None = None
    pbe_type: str = "PBE-III"


class PBEResponse(BaseModel):
    id: int
    order_id: int

    seller_id: int
    buyer_id: int
    product_id: int

    # --------------------------------------------------------
    # Export / Product Details
    # --------------------------------------------------------

    hs_code: str
    invoice_value_inr: float

    currency: str
    exchange_rate: float | None

    country: str
    pbe_type: str

    # --------------------------------------------------------
    # PBE Identification
    # --------------------------------------------------------

    pbe_number: str | None
    status: str

    # --------------------------------------------------------
    # DNK / Postal Logistics
    # --------------------------------------------------------

    tracking_number: str | None = None
    cn23_pdf_url: str | None = None
    barcode: str | None = None

    # --------------------------------------------------------
    # MOCK ICEGATE
    # --------------------------------------------------------

    icegate_reference: str | None = None
    icegate_status: str | None = None
    icegate_submitted_at: datetime | None = None

    # --------------------------------------------------------
    # Created
    # --------------------------------------------------------

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


# ============================================================
# DNK POSTAL SCAN WEBHOOK
# ============================================================

class DNKScanCreate(BaseModel):
    order_id: int
    tracking_number: str
    event_type: str
    location: str | None = None


# ============================================================
# SHIPPING EVENT RESPONSE
# ============================================================

class ShippingEventResponse(BaseModel):
    id: int
    order_id: int
    tracking_number: str
    event_type: str
    location: str | None
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )
# ============================================================
# TRACKING SCHEMAS
# ============================================================

class TrackingEventResponse(BaseModel):
    event_type: str
    location: str
    description: str
    timestamp: str
    status: str  # "COMPLETED" | "ACTIVE" | "PENDING"


class TrackingDetailsResponse(BaseModel):
    tracking_number: str
    order_id: int
    product_title: str
    destination_country: str
    shipping_address: str
    hs_code: str
    pbe_number: str | None = None
    pbe_status: str | None = None
    icegate_status: str | None = None
    escrow_status: str
    cn23_pdf_url: str | None = None
    origin_facility: str = "DNK Belagavi (DNK-KA-BEL-01)"
    events: list[TrackingEventResponse] = []
