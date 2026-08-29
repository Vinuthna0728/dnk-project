from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    Numeric,
    String,
    Text,
)

from sqlalchemy.orm import (
    DeclarativeBase,
    Mapped,
    mapped_column,
)


# ============================================================
# BASE
# ============================================================

class Base(DeclarativeBase):
    pass


# ============================================================
# USER
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    email: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        index=True,
        nullable=False
    )

    phone: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )
    upi_id: Mapped[str | None] = mapped_column(
    String(100),
    unique=True,
    nullable=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        String(30),
        default="SELLER",
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================
# PRODUCT
# ============================================================

class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    # --------------------------------------------------------
    # Legacy catalog fields
    # --------------------------------------------------------
    # Kept for compatibility with the existing integrated
    # frontend/backend.

    title: Mapped[str] = mapped_column(
        String(200),
        nullable=False
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    price_inr: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    # --------------------------------------------------------
    # Unified multilingual catalog
    # --------------------------------------------------------

    title_en: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    title_hi: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    description_en: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    description_hi: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    category: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # --------------------------------------------------------
    # HS classification
    # --------------------------------------------------------

    hs_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    hs_confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    # --------------------------------------------------------
    # Channel availability
    # --------------------------------------------------------

    is_d2c: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    is_b2b: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    is_export: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    # --------------------------------------------------------
    # Channel-specific pricing
    # --------------------------------------------------------

    cost_price_inr: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    retail_price_inr: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    wholesale_price_inr: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    b2b_moq: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=10
    )

    b2b_bulk_discount_percentage: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    export_price_usd: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    # --------------------------------------------------------
    # Logistics
    # --------------------------------------------------------

    weight_grams: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    length_cm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    width_cm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    height_cm: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    is_fragile: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    # --------------------------------------------------------
    # Images
    # --------------------------------------------------------

    image_urls: Mapped[list | None] = mapped_column(
        JSON,
        nullable=True
    )

    raw_image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    enhanced_image_url: Mapped[str | None] = mapped_column(
        String(1000),
        nullable=True
    )

    primary_image_hash: Mapped[str | None] = mapped_column(
        String(64),
        index=True,
        nullable=True
    )

    # --------------------------------------------------------
    # Timestamp
    # --------------------------------------------------------

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # --------------------------------------------------------
    # Relationship
    # --------------------------------------------------------

    seller: Mapped["User"] = relationship(
        back_populates="products"
    )

# ============================================================
# ORDER
# ============================================================

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    quantity: Mapped[int] = mapped_column(
        nullable=False,
        default=1
    )

    amount_inr: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    shipping_address: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="PENDING",
        nullable=False
    )

    checkout_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    stripe_session_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True
    )

    escrow_id: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================
# ESCROW
# ============================================================

class Escrow(Base):
    __tablename__ = "escrows"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        unique=True,
        nullable=False
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    amount_inr: Mapped[float] = mapped_column(
        Float,
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="CREATED"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

# ============================================================
# PAYOUT
# ============================================================

class Payout(Base):
    __tablename__ = "payouts"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    escrow_id: Mapped[int] = mapped_column(
        ForeignKey("escrows.id"),
        unique=True,
        nullable=False,
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        unique=True,
        nullable=False,
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    amount_inr: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    destination_type: Mapped[str] = mapped_column(
        String(20),
        default="UPI",
        nullable=False,
    )

    destination: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        default="PENDING",
        nullable=False,
    )

    payout_reference: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )
# ============================================================
# COMPLIANCE / PBE
# ============================================================

class ComplianceCheck(Base):
    __tablename__ = "compliance_checks"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    hs_code: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDING"
    )

    reason: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    confidence: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================
# PBE - POSTAL BILL OF EXPORT
# ============================================================

class PBE(Base):
    __tablename__ = "pbe_filings"

    id: Mapped[int] = mapped_column(
        primary_key=True
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False,
        unique=True
    )

    seller_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    buyer_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False
    )

    product_id: Mapped[int] = mapped_column(
        ForeignKey("products.id"),
        nullable=False
    )

    # ========================================================
    # EXPORT / PRODUCT DETAILS
    # ========================================================

    hs_code: Mapped[str] = mapped_column(
        String(20),
        nullable=False
    )

    invoice_value_inr: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False
    )

    currency: Mapped[str] = mapped_column(
        String(10),
        default="INR",
        nullable=False
    )

    exchange_rate: Mapped[float | None] = mapped_column(
        Float,
        nullable=True
    )

    country: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    pbe_type: Mapped[str] = mapped_column(
        String(20),
        default="PBE-III",
        nullable=False
    )

    # ========================================================
    # PBE IDENTIFICATION
    # ========================================================

    pbe_number: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="DRAFT",
        nullable=False
    )

    # ========================================================
    # DNK / POSTAL LOGISTICS
    # ========================================================

    tracking_number: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True
    )

    cn23_pdf_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    barcode: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True
    )

    # ========================================================
    # MOCK ICEGATE
    # ========================================================

    icegate_reference: Mapped[str | None] = mapped_column(
        String(100),
        unique=True,
        nullable=True
    )

    icegate_status: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True
    )

    icegate_submitted_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True
    )

    # ========================================================
    # CREATED AT
    # ========================================================

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )


# ============================================================
# SHIPPING EVENTS - DNK POSTAL SCAN
# ============================================================

class ShippingEvent(Base):
    __tablename__ = "shipping_events"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        nullable=False
    )

    tracking_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    location: Mapped[str | None] = mapped_column(
        String(200),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )
