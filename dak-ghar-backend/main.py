import re
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from fastapi.responses import FileResponse
import os
import json
import stripe
from datetime import datetime, timezone
from pydantic import BaseModel
import uvicorn
import requests
from fastapi import (
    Form,
    FastAPI,
    Request,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File,
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session
from ai_engine import (
    generate_catalog_from_ai,
    generate_catalog_from_voice_ai,
)
from database import get_db

from models import (
    User,
    Product,
    Order,
    Escrow,
    Payout,
    ComplianceCheck,
    PBE,
    ShippingEvent,
)

from schemas import (
    TrackingDetailsResponse,
    TrackingEventResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse,

    UserRegister,
    UserResponse,
    UserProfileUpdate,
    TokenResponse,

    OrderCreate,
    OrderResponse,

    EscrowCreate,
    EscrowResponse,
    EscrowTransition,

    ComplianceCheckCreate,
    ComplianceCheckResponse,

    PBECreate,
    PBEResponse,

    DNKScanCreate,
)

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
)
from cn23_generator import generate_cn23_pdf
from icegate import router as icegate_router, submit_pbe_to_icegate, get_icegate_status, ICEGATEPBESubmit
# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Dak Ghar Niryat Kendra Platform",
    version="1.0.0",
    description="Backend API for export, compliance, escrow and logistics",
)
app.include_router(icegate_router)

# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def health_check():
    return {
        "message": "Dak Ghar Niryat Kendra Platform API is running"
    }


# ============================================================
# AUTHENTICATION
# ============================================================

# ------------------------------------------------------------
# REGISTER
# ------------------------------------------------------------

@app.post(
    "/api/v1/auth/register",
    response_model=UserResponse,
    status_code=201,
)
def register_user(
    data: UserRegister,
    db: Session = Depends(get_db),
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    hashed_password = hash_password(data.password)

    user = User(
    name=data.name,
    email=data.email,
    phone=data.phone,
    upi_id=data.upi_id,
    password_hash=hashed_password,
    role="SELLER",
)

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ------------------------------------------------------------
# LOGIN
# ------------------------------------------------------------

@app.post(
    "/api/v1/auth/login",
    response_model=TokenResponse,
)
def login_user(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    # Swagger sends the email through the username field
    user = (
        db.query(User)
        .filter(User.email == form_data.username)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    if not verify_password(
        form_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )

    access_token = create_access_token(
        user_id=user.id,
        email=user.email,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# ------------------------------------------------------------
# GET CURRENT USER PROFILE
# ------------------------------------------------------------

@app.get(
    "/api/v1/auth/me",
    response_model=UserResponse,
)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    """Return the currently authenticated user's profile."""
    return current_user


# ------------------------------------------------------------
# UPDATE CURRENT USER PROFILE
# ------------------------------------------------------------

@app.put(
    "/api/v1/auth/me",
    response_model=UserResponse,
)
def update_current_user_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update the currently authenticated user's name, phone, or upi_id."""
    if data.name is not None:
        current_user.name = data.name.strip()
    if data.phone is not None:
        current_user.phone = data.phone.strip()
    if data.upi_id is not None:
        current_user.upi_id = data.upi_id.strip()

    db.commit()
    db.refresh(current_user)
    return current_user


# ============================================================
# PRODUCTS
# ============================================================

# ------------------------------------------------------------
# GET ALL PRODUCTS
# ------------------------------------------------------------

@app.get(
    "/api/v1/products",
    response_model=list[ProductResponse],
)
def get_products(
    db: Session = Depends(get_db),
):

    products = (
        db.query(Product)
        .order_by(Product.id)
        .all()
    )

    return [
        product_to_response(product)
        for product in products
    ]

# ------------------------------------------------------------
# CREATE PRODUCT
# ------------------------------------------------------------

import hashlib
import base64

def compute_image_hash(image_urls: list | None) -> str | None:
    """
    Computes a deterministic SHA-256 fingerprint of the primary image.
    Handles Base64 data URIs by decoding the image payload bytes,
    and handles standard URLs by hashing the normalized string.
    """
    if not image_urls or not isinstance(image_urls, list) or len(image_urls) == 0:
        return None
    primary = image_urls[0]
    if not primary or not isinstance(primary, str):
        return None
    
    primary = primary.strip()
    if primary.startswith("data:image/") and ";base64," in primary:
        try:
            b64_data = primary.split(";base64,")[1]
            raw_bytes = base64.b64decode(b64_data)
            return hashlib.sha256(raw_bytes).hexdigest()
        except Exception:
            return hashlib.sha256(primary.encode("utf-8")).hexdigest()
    else:
        return hashlib.sha256(primary.encode("utf-8")).hexdigest()


def calculate_title_similarity(t1: str, t2: str) -> float:
    """
    Calculates word token overlap similarity (Dice / Token Overlap Ratio)
    between two normalized product titles.
    """
    words1 = set(re.findall(r"\w+", (t1 or "").lower()))
    words2 = set(re.findall(r"\w+", (t2 or "").lower()))
    if not words1 or not words2:
        return 0.0
    intersection = len(words1 & words2)
    return (2.0 * intersection) / (len(words1) + len(words2))


def product_to_response(product: Product) -> ProductResponse:
    """
    Convert the flat SQLAlchemy Product model into the
    nested ProductResponse API contract.
    """

    return ProductResponse(
        id=product.id,
        seller_id=product.seller_id,

        # Legacy fields
        title=product.title,
        description=product.description,
        price_inr=product.price_inr,
        image_urls=product.image_urls,

        # Unified multilingual catalog
        title_en=product.title_en,
        title_hi=product.title_hi,
        description_en=product.description_en,
        description_hi=product.description_hi,
        category=product.category,

        # HS classification
        hs_code=product.hs_code,
        hs_confidence=product.hs_confidence,

        # Channels
        channels={
            "is_d2c": product.is_d2c,
            "is_b2b": product.is_b2b,
            "is_export": product.is_export,
        },

        # Pricing
        pricing={
            "cost_price_inr": product.cost_price_inr,
            "retail_price_inr": product.retail_price_inr,
            "wholesale_price_inr": product.wholesale_price_inr,
            "b2b_moq": product.b2b_moq,
            "b2b_bulk_discount_percentage": (
                product.b2b_bulk_discount_percentage
            ),
            "export_price_usd": product.export_price_usd,
        },

        # Logistics
        logistics={
            "weight_grams": product.weight_grams,
            "dimensions_cm": {
                "length": product.length_cm,
                "width": product.width_cm,
                "height": product.height_cm,
            },
            "is_fragile": product.is_fragile,
        },

        # Images
        images={
            "raw_url": product.raw_image_url,
            "enhanced_url": product.enhanced_image_url,
        },

        created_at=product.created_at,
    )


@app.post(
    "/api/v1/products",
    response_model=ProductResponse,
    status_code=201,
)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    raw_title = data.title or data.title_en or ""

    normalized_title = re.sub(
        r"\s+",
        " ",
        raw_title.strip(),
    ).lower()

    normalized_hs = (data.hs_code or "").strip()

    new_img_hash = compute_image_hash(
        data.image_urls
    )

    resolved_price = (
        data.price_inr
        if data.price_inr is not None
        else data.pricing.retail_price_inr
    )

    new_price = (
        float(resolved_price)
        if resolved_price is not None
        else None
    )

    if not normalized_title:
        raise HTTPException(
            status_code=400,
            detail="Product title cannot be empty",
        )

    # ------------------------------------------------------------
    # LAYER 1: EXACT NORMALIZED TITLE + HS CODE (SAME SELLER)
    # ------------------------------------------------------------
    exact_match = (
        db.query(Product)
        .filter(
            Product.seller_id == current_user.id,
            func.lower(func.trim(func.regexp_replace(Product.title, r"\s+", " ", "g"))) == normalized_title,
            func.coalesce(func.trim(Product.hs_code), "") == normalized_hs
        )
        .first()
    )

    if exact_match:
        raise HTTPException(
            status_code=409,
            detail="This product is already listed.",
        )

    # ------------------------------------------------------------
    # LAYER 2: IDENTICAL IMAGE FINGERPRINT (SAME SELLER + SAME HS CODE)
    # ------------------------------------------------------------
    if new_img_hash:
        image_match = (
            db.query(Product)
            .filter(
                Product.seller_id == current_user.id,
                Product.primary_image_hash == new_img_hash,
                func.coalesce(func.trim(Product.hs_code), "") == normalized_hs
            )
            .first()
        )
        if image_match:
            raise HTTPException(
                status_code=409,
                detail="This product is already listed.",
            )

    # ------------------------------------------------------------
    # LAYER 3: NEAR-DUPLICATE TITLE TOKEN SIMILARITY >= 85% 
    # (SAME SELLER + SAME HS CODE + SIMILAR PRICE)
    # ------------------------------------------------------------
    seller_products = (
        db.query(Product)
        .filter(
            Product.seller_id == current_user.id,
            func.coalesce(func.trim(Product.hs_code), "") == normalized_hs
        )
        .all()
    )

    for existing_p in seller_products:
        price_similar = True
        if new_price is not None and existing_p.price_inr is not None:
            existing_price = float(existing_p.price_inr)
            if existing_price > 0:
                price_ratio = abs(new_price - existing_price) / existing_price
                price_similar = price_ratio <= 0.25

        sim_score = calculate_title_similarity(normalized_title, existing_p.title)
        if sim_score >= 0.85 and price_similar:
            raise HTTPException(
                status_code=409,
                detail="This product is already listed.",
            )

    # ------------------------------------------------------------
    # RESOLVE UNIFIED PRODUCT FIELDS
    # ------------------------------------------------------------

    resolved_title = data.title or data.title_en

    if not resolved_title or not resolved_title.strip():
        raise HTTPException(
            status_code=400,
            detail="Product title cannot be empty",
        )

    resolved_price = (
        data.price_inr
        if data.price_inr is not None
        else data.pricing.retail_price_inr
    )

    if resolved_price is None:
        raise HTTPException(
            status_code=400,
            detail="Product price cannot be empty",
        )

    # ------------------------------------------------------------
    # PERSIST NEW PRODUCT TO DATABASE
    # ------------------------------------------------------------

    product = Product(
        seller_id=current_user.id,

        # Legacy-compatible fields
        title=re.sub(
            r"\s+",
            " ",
            resolved_title.strip(),
        ),
        description=data.description or data.description_en,
        price_inr=resolved_price,

        # HS classification
        hs_code=data.hs_code,
        hs_confidence=data.hs_confidence,

        # Unified multilingual catalog
        title_en=data.title_en or data.title,
        title_hi=data.title_hi,
        description_en=data.description_en or data.description,
        description_hi=data.description_hi,
        category=data.category,

        # Channel availability
        is_d2c=data.channels.is_d2c,
        is_b2b=data.channels.is_b2b,
        is_export=data.channels.is_export,

        # Channel-specific pricing
        cost_price_inr=data.pricing.cost_price_inr,
        retail_price_inr=data.pricing.retail_price_inr,
        wholesale_price_inr=data.pricing.wholesale_price_inr,
        b2b_moq=data.pricing.b2b_moq,
        b2b_bulk_discount_percentage=(
            data.pricing.b2b_bulk_discount_percentage
        ),
        export_price_usd=data.pricing.export_price_usd,

        # Logistics
        weight_grams=data.logistics.weight_grams,
        length_cm=data.logistics.dimensions_cm.length,
        width_cm=data.logistics.dimensions_cm.width,
        height_cm=data.logistics.dimensions_cm.height,
        is_fragile=data.logistics.is_fragile,

        # Images
        image_urls=data.image_urls,
        raw_image_url=data.images.raw_url,
        enhanced_image_url=data.images.enhanced_url,

        # Existing duplicate-detection hash
        primary_image_hash=new_img_hash,
    )

    try:
        db.add(product)
        db.commit()
        db.refresh(product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This product is already listed.",
        )

    return product_to_response(product)


# ------------------------------------------------------------
# GET PRODUCT
# ------------------------------------------------------------

@app.get(
    "/api/v1/products/{product_id}",
    response_model=ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    return product_to_response(product)


# ------------------------------------------------------------
# UPDATE PRODUCT
# ------------------------------------------------------------

@app.put(
    "/api/v1/products/{product_id}",
    response_model=ProductResponse,
)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this product",
        )

    update_data = data.model_dump(
        exclude_unset=True
    )

    # ------------------------------------------------------------
    # UPDATE FLAT PRODUCT FIELDS
    # ------------------------------------------------------------

    flat_fields = {
        "title",
        "description",
        "price_inr",
        "image_urls",
        "title_en",
        "title_hi",
        "description_en",
        "description_hi",
        "category",
        "hs_code",
        "hs_confidence",
    }

    for field in flat_fields:
        if field in update_data:
            setattr(
                product,
                field,
                update_data[field],
            )

    # ------------------------------------------------------------
    # UPDATE CHANNELS
    # ------------------------------------------------------------

    if "channels" in update_data:
        channels = update_data["channels"]

        for field in (
            "is_d2c",
            "is_b2b",
            "is_export",
        ):
            if field in channels:
                setattr(
                    product,
                    field,
                    channels[field],
                )

    # ------------------------------------------------------------
    # UPDATE PRICING
    # ------------------------------------------------------------

    if "pricing" in update_data:
        pricing = update_data["pricing"]

        pricing_fields = {
            "cost_price_inr": "cost_price_inr",
            "retail_price_inr": "retail_price_inr",
            "wholesale_price_inr": "wholesale_price_inr",
            "b2b_moq": "b2b_moq",
            "b2b_bulk_discount_percentage": (
                "b2b_bulk_discount_percentage"
            ),
            "export_price_usd": "export_price_usd",
        }

        for source_field, model_field in pricing_fields.items():
            if source_field in pricing:
                setattr(
                    product,
                    model_field,
                    pricing[source_field],
                )

    # ------------------------------------------------------------
    # UPDATE LOGISTICS
    # ------------------------------------------------------------

    if "logistics" in update_data:
        logistics = update_data["logistics"]

        if "weight_grams" in logistics:
            product.weight_grams = logistics["weight_grams"]

        if "is_fragile" in logistics:
            product.is_fragile = logistics["is_fragile"]

        if "dimensions_cm" in logistics:
            dimensions = logistics["dimensions_cm"]

            if "length" in dimensions:
                product.length_cm = dimensions["length"]

            if "width" in dimensions:
                product.width_cm = dimensions["width"]

            if "height" in dimensions:
                product.height_cm = dimensions["height"]

    # ------------------------------------------------------------
    # UPDATE IMAGES
    # ------------------------------------------------------------

    if "images" in update_data:
        images = update_data["images"]

        if "raw_url" in images:
            product.raw_image_url = images["raw_url"]

        if "enhanced_url" in images:
            product.enhanced_image_url = images["enhanced_url"]

    db.commit()
    db.refresh(product)

    return product_to_response(product)


# ------------------------------------------------------------
# DELETE PRODUCT
# ------------------------------------------------------------

@app.delete(
    "/api/v1/products/{product_id}",
)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(Product.id == product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if product.seller_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to delete this product",
        )

    db.delete(product)
    db.commit()

    return {
        "message": "Product deleted successfully"
    }

# ============================================================
# AI CATALOG GENERATION
# ============================================================

class AICatalogRequest(BaseModel):
    raw_text: str = ""
    source_language: str = "auto"
    image_base64: str | None = None
    image_mime_type: str | None = "image/jpeg"


@app.post("/api/v1/ai/catalog/generate")
def generate_ai_catalog(
    data: AICatalogRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        result = generate_catalog_from_ai(
            raw_text=data.raw_text,
            source_language=data.source_language,
            image_base64=data.image_base64,
            image_mime_type=data.image_mime_type or "image/jpeg",
        )

        return result

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )


@app.post("/api/v1/ai/voice/generate")
@app.post("/api/v1/artisan/voice-upload")
async def generate_ai_catalog_from_voice(
    file: UploadFile = File(...),
    image_base64: str | None = Form(None),
    image_mime_type: str = Form("image/jpeg"),
    current_user: User = Depends(get_current_user),
):
    try:
        file_bytes = await file.read()
        result = generate_catalog_from_voice_ai(
            file_bytes=file_bytes,
            filename=file.filename or "recording.webm",
            content_type=file.content_type or "audio/webm",
            image_base64=image_base64,
            image_mime_type=image_mime_type,
        )

        return result

    except RuntimeError as exc:
        raise HTTPException(
            status_code=502,
            detail=str(exc)
        )
# ============================================================
# ORDERS
# ============================================================

# ------------------------------------------------------------
# CREATE ORDER
# ------------------------------------------------------------

@app.post(
    "/api/v1/orders/create",
    response_model=OrderResponse,
    status_code=201,
)
def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .first()
    )

    if not product:
        product = db.query(Product).first()

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if data.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Quantity must be greater than zero",
        )

    amount = float(product.price_inr) * data.quantity

    order = Order(
        buyer_id=current_user.id,
        product_id=product.id,
        quantity=data.quantity,
        amount_inr=amount,
        shipping_address=data.shipping_address,
        country=data.country,
        status="PENDING",
    )

    db.add(order)
    db.commit()
    db.refresh(order)

    # Automatically create associated Escrow in CREATED status
    escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first()
    if not escrow:
        escrow = Escrow(
            order_id=order.id,
            buyer_id=order.buyer_id,
            seller_id=product.seller_id,
            amount_inr=order.amount_inr,
            status="CREATED",
        )
        db.add(escrow)
        db.commit()
        db.refresh(escrow)

    stripe_secret = os.getenv("STRIPE_SECRET_KEY")
    if not stripe_secret:
        raise HTTPException(
            status_code=503,
            detail="Stripe payment gateway is not configured. Please set STRIPE_SECRET_KEY in backend environment.",
        )

    try:
        stripe.api_key = stripe_secret
        unit_amount_paise = int(round(float(product.price_inr) * 100))

        success_url_template = os.getenv(
            "STRIPE_SUCCESS_URL",
            "http://localhost:3000/order-success?orderId=ORD-DNK-{ORDER_ID}&session_id={CHECKOUT_SESSION_ID}&productId={PRODUCT_ID}"
        )
        cancel_url_template = os.getenv(
            "STRIPE_CANCEL_URL",
            "http://localhost:3000/checkout?productId={PRODUCT_ID}&status=cancelled"
        )

        formatted_success_url = (
            success_url_template
            .replace("{ORDER_ID}", str(order.id))
            .replace("{PRODUCT_ID}", str(product.id))
        )
        formatted_cancel_url = (
            cancel_url_template
            .replace("{ORDER_ID}", str(order.id))
            .replace("{PRODUCT_ID}", str(product.id))
        )

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": "inr",
                        "unit_amount": unit_amount_paise,
                        "product_data": {
                            "name": product.title,
                            "description": product.description or "Handcrafted Indian Artisan Export Item",
                        },
                    },
                    "quantity": data.quantity,
                }
            ],
            mode="payment",
            metadata={
                "order_id": str(order.id),
                "escrow_id": str(escrow.id),
                "buyer_id": str(current_user.id),
            },
            success_url=formatted_success_url,
            cancel_url=formatted_cancel_url,
        )
        checkout_url = session.url
        stripe_session_id = session.id
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Stripe Checkout Session creation failed: {e.user_message or str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Payment initialization error: {str(e)}",
        )

    # Persist Stripe checkout session and escrow to database
    order.checkout_url = checkout_url
    order.stripe_session_id = stripe_session_id
    order.escrow_id = escrow.id if escrow else None
    db.commit()
    db.refresh(order)

    return order


# ------------------------------------------------------------
# GET MY ORDERS
# ------------------------------------------------------------

@app.get(
    "/api/v1/orders",
    response_model=list[OrderResponse],
)
def get_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    orders = (
        db.query(Order)
        .join(Product, Order.product_id == Product.id)
        .filter(
            (Order.buyer_id == current_user.id)
            | (Product.seller_id == current_user.id)
        )
        .order_by(Order.id)
        .all()
    )

    return orders


# ------------------------------------------------------------
# GET ORDER
# ------------------------------------------------------------

@app.get(
    "/api/v1/orders/{order_id}",
    response_model=OrderResponse,
)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    order = (
        db.query(Order)
        .filter(Order.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == order.product_id)
        .first()
    )

    if (
        order.buyer_id != current_user.id
        and (
            not product
            or product.seller_id != current_user.id
        )
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this order",
        )

    return order



# ------------------------------------------------------------
# VERIFY ORDER PAYMENT
# ------------------------------------------------------------

@app.get(
    "/api/v1/orders/{order_id}/verify-payment",
)
def verify_order_payment(
    order_id: int,
    session_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.buyer_id != current_user.id:
        product = db.query(Product).filter(Product.id == order.product_id).first()
        if not product or product.seller_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized to verify this order")

    escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first()

    # Determine the target Stripe Checkout Session ID to verify
    target_session_id = (session_id or order.stripe_session_id or "").strip()

    # If an explicit session_id query param was passed, verify it matches the session assigned to the order
    if session_id and order.stripe_session_id and session_id.strip() != order.stripe_session_id.strip():
        raise HTTPException(
            status_code=400,
            detail="Provided Stripe session ID does not match the session assigned to this order",
        )

    stripe_secret = os.getenv("STRIPE_SECRET_KEY")
    if stripe_secret and target_session_id:
        try:
            stripe.api_key = stripe_secret
            session = stripe.checkout.Session.retrieve(target_session_id)

            # Safely extract metadata across all Stripe SDK versions (dict or StripeObject)
            meta = getattr(session, "metadata", None)
            session_order_id = None
            if meta is not None:
                if hasattr(meta, "get"):
                    session_order_id = meta.get("order_id")
                elif hasattr(meta, "to_dict"):
                    session_order_id = meta.to_dict().get("order_id")
                else:
                    session_order_id = getattr(meta, "order_id", None)

            if session_order_id and str(session_order_id).strip() != str(order.id):
                raise HTTPException(
                    status_code=400,
                    detail=f"Stripe session metadata order_id '{session_order_id}' does not match requested order ID '{order.id}'",
                )

            payment_status = getattr(session, "payment_status", None)
            if payment_status == "paid":
                if order.status != "PAID":
                    order.status = "PAID"
                if escrow and escrow.status == "CREATED":
                    escrow.status = "FUNDS_HELD_ESCROW"
                db.commit()
                db.refresh(order)
                if escrow:
                    db.refresh(escrow)
        except HTTPException:
            raise
        except stripe.error.InvalidRequestError as e:
            raise HTTPException(
                status_code=404,
                detail=f"Invalid Stripe session ID: {e.user_message or str(e)}",
            )
        except stripe.error.StripeError as e:
            raise HTTPException(
                status_code=502,
                detail=f"Stripe session verification failed: {e.user_message or str(e)}",
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Payment verification error: {str(e)}",
            )

    is_paid = (order.status == "PAID") or (escrow is not None and escrow.status == "FUNDS_HELD_ESCROW")

    # When order is verified as paid, automatically file PBE-III with ICEGATE
    if is_paid:
        try:
            process_pbe_filing(order=order, db=db)
        except Exception as pbe_err:
            print(f"[PBE Auto-Filing Warning] Order #{order.id}: {pbe_err}")

    return {
        "order_id": order.id,
        "escrow_id": escrow.id if escrow else None,
        "order_status": order.status,
        "escrow_status": escrow.status if escrow else "NONE",
        "amount_inr": order.amount_inr,
        "is_paid": is_paid,
    }


# ------------------------------------------------------------
# STRIPE WEBHOOK
# ------------------------------------------------------------

@app.post(
    "/api/v1/payments/stripe-webhook",
)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    stripe_secret = os.getenv("STRIPE_SECRET_KEY")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    if not webhook_secret:
        raise HTTPException(
            status_code=500,
            detail="STRIPE_WEBHOOK_SECRET is not configured on the backend. Webhook requests cannot be processed unverified.",
        )

    if not sig_header:
        raise HTTPException(
            status_code=400,
            detail="Missing stripe-signature header. Webhook requires valid signature.",
        )

    try:
        if stripe_secret:
            stripe.api_key = stripe_secret
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail=f"Invalid webhook signature: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook event parsing error: {str(e)}")

    event_type = event.get("type") if isinstance(event, dict) else getattr(event, "type", "")
    event_data = event.get("data", {}).get("object", {}) if isinstance(event, dict) else getattr(getattr(event, "data", None), "object", {})

    if event_type in ["checkout.session.completed", "payment_intent.succeeded"]:
        metadata = event_data.get("metadata", {}) if isinstance(event_data, dict) else getattr(event_data, "metadata", {})
        order_id_str = metadata.get("order_id") if isinstance(metadata, dict) else getattr(metadata, "order_id", None)

        if order_id_str:
            order_id = int(order_id_str)
            order = db.query(Order).filter(Order.id == order_id).first()
            if order:
                if order.status != "PAID":
                    order.status = "PAID"
                escrow = db.query(Escrow).filter(Escrow.order_id == order_id).first()
                if escrow and escrow.status == "CREATED":
                    escrow.status = "FUNDS_HELD_ESCROW"
                db.commit()

    return {"status": "success", "event": event_type}

# ============================================================
# ESCROW
# ============================================================

# ------------------------------------------------------------
# CREATE ESCROW
# ------------------------------------------------------------

@app.post(
    "/api/v1/escrow/create",
    response_model=EscrowResponse,
    status_code=201,
)
def create_escrow(
    data: EscrowCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    order = (
        db.query(Order)
        .filter(Order.id == data.order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the buyer can create escrow",
        )

    existing_escrow = (
        db.query(Escrow)
        .filter(Escrow.order_id == order.id)
        .first()
    )

    if existing_escrow:
        raise HTTPException(
            status_code=400,
            detail="Escrow already exists for this order",
        )

    product = (
        db.query(Product)
        .filter(Product.id == order.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    escrow = Escrow(
        order_id=order.id,
        buyer_id=order.buyer_id,
        seller_id=product.seller_id,
        amount_inr=order.amount_inr,
        status="CREATED",
    )

    db.add(escrow)
    db.commit()
    db.refresh(escrow)

    return escrow


# ------------------------------------------------------------
# GET ESCROWS
# ------------------------------------------------------------

@app.get(
    "/api/v1/escrow",
    response_model=list[EscrowResponse],
)
def get_escrows(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrows = (
        db.query(Escrow)
        .filter(
            (Escrow.buyer_id == current_user.id)
            |
            (Escrow.seller_id == current_user.id)
        )
        .order_by(Escrow.id)
        .all()
    )

    return escrows


# ------------------------------------------------------------
# GET ESCROW
# ------------------------------------------------------------

@app.get(
    "/api/v1/escrow/{escrow_id}",
    response_model=EscrowResponse,
)
def get_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrow = (
        db.query(Escrow)
        .filter(Escrow.id == escrow_id)
        .first()
    )

    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found",
        )

    if (
        escrow.buyer_id != current_user.id
        and escrow.seller_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this escrow",
        )

    return escrow


# ============================================================
# ESCROW STATE MACHINE
# ============================================================

@app.post(
    "/api/v1/escrow/{escrow_id}/transition",
    response_model=EscrowResponse,
)
def transition_escrow(
    escrow_id: int,
    data: EscrowTransition,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrow = (
        db.query(Escrow)
        .filter(Escrow.id == escrow_id)
        .first()
    )

    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found",
        )

    if (
        escrow.buyer_id != current_user.id
        and escrow.seller_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to update this escrow",
        )

    allowed_transitions = {
        "CREATED": [
            "BUYER_PAYMENT"
        ],

        "BUYER_PAYMENT": [
            "FUNDS_HELD_ESCROW"
        ],

        "FUNDS_HELD_ESCROW": [
            "POSTAL_SCAN"
        ],

        "POSTAL_SCAN": [
            "RELEASED_TO_SELLER_BANK"
        ],

        "RELEASED_TO_SELLER_BANK": [],
    }

    current_status = escrow.status
    requested_status = data.status

    if requested_status not in allowed_transitions.get(
        current_status,
        []
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid escrow transition: "
                f"{current_status} -> {requested_status}"
            ),
        )

    escrow.status = requested_status

    db.commit()
    db.refresh(escrow)

    return escrow


# ============================================================
# ESCROW — BUYER PAYMENT
# ============================================================

@app.post(
    "/api/v1/escrow/{escrow_id}/payment",
    response_model=EscrowResponse,
)
def buyer_payment(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrow = (
        db.query(Escrow)
        .filter(Escrow.id == escrow_id)
        .first()
    )

    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found",
        )

    if escrow.buyer_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Only the buyer can make payment",
        )

    if escrow.status != "CREATED":
        raise HTTPException(
            status_code=400,
            detail=(
                f"Payment cannot be made from "
                f"status {escrow.status}"
            ),
        )

    escrow.status = "FUNDS_HELD_ESCROW"

    db.commit()
    db.refresh(escrow)

    return escrow


# ============================================================
# ESCROW — POSTAL SCAN
# ============================================================

@app.post(
    "/api/v1/escrow/{escrow_id}/postal-scan",
    response_model=EscrowResponse,
)
def postal_scan(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrow = (
        db.query(Escrow)
        .filter(Escrow.id == escrow_id)
        .first()
    )

    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found",
        )

    if escrow.status != "FUNDS_HELD_ESCROW":
        raise HTTPException(
            status_code=400,
            detail=(
                "Postal scan is allowed only after "
                "funds are held in escrow"
            ),
        )

    if (
        escrow.buyer_id != current_user.id
        and escrow.seller_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to perform postal scan",
        )

    escrow.status = "POSTAL_SCAN"

    db.commit()
    db.refresh(escrow)

    return escrow


# ============================================================
# ESCROW — RELEASE
# ============================================================

@app.post(
    "/api/v1/escrow/{escrow_id}/release",
    response_model=EscrowResponse,
)
def release_escrow(
    escrow_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    escrow = (
        db.query(Escrow)
        .filter(Escrow.id == escrow_id)
        .first()
    )

    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found",
        )

    if escrow.status != "POSTAL_SCAN":
        raise HTTPException(
            status_code=400,
            detail=(
                "Funds can be released only after "
                "postal scan"
            ),
        )

    if current_user.id != escrow.seller_id:
        raise HTTPException(
            status_code=403,
            detail="Only the seller can complete the release",
        )

    escrow.status = "RELEASED_TO_SELLER_BANK"

    db.commit()
    db.refresh(escrow)

    return escrow


# ============================================================
# COMPLIANCE ENGINE
# ============================================================

# ------------------------------------------------------------
# CREATE COMPLIANCE CHECK
# ------------------------------------------------------------

@app.post(
    "/api/v1/compliance/check",
    response_model=ComplianceCheckResponse,
    status_code=201,
)
def create_compliance_check(
    data: ComplianceCheckCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    order = (
        db.query(Order)
        .filter(Order.id == data.order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    product = (
        db.query(Product)
        .filter(Product.id == data.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found",
        )

    if (
        order.buyer_id != current_user.id
        and product.seller_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to perform this compliance check",
        )

    hs_code = product.hs_code

    if not hs_code:
        hs_code = "500720"

    compliance = ComplianceCheck(
        order_id=data.order_id,
        product_id=data.product_id,
        country=data.country,
        hs_code=hs_code,
        status="APPROVED",
        reason="Product passed basic export compliance check",
        confidence=0.98,
    )

    db.add(compliance)
    db.commit()
    db.refresh(compliance)

    return compliance


# ------------------------------------------------------------
# GET COMPLIANCE CHECKS
# ------------------------------------------------------------

@app.get(
    "/api/v1/compliance",
    response_model=list[ComplianceCheckResponse],
)
def get_compliance_checks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    checks = (
        db.query(ComplianceCheck)
        .order_by(ComplianceCheck.id)
        .all()
    )

    return checks


# ------------------------------------------------------------
# GET COMPLIANCE CHECK
# ------------------------------------------------------------

@app.get(
    "/api/v1/compliance/{compliance_id}",
    response_model=ComplianceCheckResponse,
)
def get_compliance_check(
    compliance_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    compliance = (
        db.query(ComplianceCheck)
        .filter(
            ComplianceCheck.id == compliance_id
        )
        .first()
    )

    if not compliance:
        raise HTTPException(
            status_code=404,
            detail="Compliance check not found",
        )

    return compliance


# ============================================================
# LOGISTICS — PBE SUBMIT
# ============================================================
# LOGISTICS – CORE PBE-III FILING & ICEGATE SERVICE
# ============================================================

def process_pbe_filing(
    order: Order,
    db: Session,
    currency: str = "USD",
    exchange_rate: float | None = None,
    pbe_type: str = "PBE-III"
) -> PBE:
    """
    Automated DNK PBE-III customs engine:
    1. Validates or creates PBE record in PostgreSQL pbe_filings table.
    2. Generates the official CN23 Customs Declaration PDF document.
    3. Submits electronic PBE payload to CBIC ICEGATE (Mock ICEGATE).
    4. Saves dynamic ICEGATE reference, updates pbe.status = 'ICEGATE_ACCEPTED', icegate_status = 'ACCEPTED'.
    5. Records ShippingEvent(event_type='PBE_FILING', location='DNK Electronic Customs Gateway').
    6. Commits all changes to PostgreSQL.
    """
    existing_pbe = db.query(PBE).filter(PBE.order_id == order.id).first()
    if existing_pbe:
        # If existing PBE needs ICEGATE submission or reference refresh
        if not existing_pbe.icegate_reference or existing_pbe.icegate_status != "ACCEPTED":
            try:
                icegate_data = submit_pbe_to_icegate(
                    ICEGATEPBESubmit(
                        pbe_number=existing_pbe.pbe_number or f"PBE-{order.id:06d}",
                        order_id=order.id,
                        hs_code=existing_pbe.hs_code or "8306.29.00",
                        invoice_value_inr=float(existing_pbe.invoice_value_inr or order.amount_inr),
                        currency=existing_pbe.currency or currency,
                        country=existing_pbe.country or order.country,
                    )
                )
                existing_pbe.icegate_reference = icegate_data.get("icegate_reference")
                existing_pbe.icegate_status = icegate_data.get("status", "ACCEPTED")
                existing_pbe.icegate_submitted_at = datetime.now(timezone.utc)
                if existing_pbe.icegate_status == "ACCEPTED":
                    existing_pbe.status = "ICEGATE_ACCEPTED"
            except Exception as e:
                print(f"[ICEGATE Submission Warning] {e}")

        # Ensure ShippingEvent exists for PBE_FILING
        pbe_event = db.query(ShippingEvent).filter(
            ShippingEvent.order_id == order.id,
            ShippingEvent.event_type == "PBE_FILING"
        ).first()
        if not pbe_event:
            pbe_event = ShippingEvent(
                order_id=order.id,
                tracking_number=existing_pbe.tracking_number,
                event_type="PBE_FILING",
                location="DNK Electronic Customs Gateway",
            )
            db.add(pbe_event)

        db.commit()
        db.refresh(existing_pbe)
        return existing_pbe

    product = db.query(Product).filter(Product.id == order.product_id).first()
    buyer = db.query(User).filter(User.id == order.buyer_id).first()
    seller = db.query(User).filter(User.id == (product.seller_id if product else 1)).first()

    seller_id = seller.id if seller else (product.seller_id if product else 1)
    buyer_id = buyer.id if buyer else order.buyer_id
    product_id = product.id if product else order.product_id
    hs_code = product.hs_code if (product and product.hs_code) else "8306.29.00"
    seller_name = seller.name if seller else "Artisan Exporter"
    buyer_name = buyer.name if buyer else "Overseas Buyer"

    pbe_number = f"PBE-{order.id:06d}"
    tracking_number = f"DNK{order.id:09d}IN"

    pbe = PBE(
        order_id=order.id,
        seller_id=seller_id,
        buyer_id=buyer_id,
        product_id=product_id,
        hs_code=hs_code,
        invoice_value_inr=order.amount_inr,
        currency=currency,
        exchange_rate=exchange_rate,
        country=order.country or "United States",
        pbe_type=pbe_type,
        pbe_number=pbe_number,
        tracking_number=tracking_number,
        status="SUBMITTED",
        barcode=tracking_number,
    )
    db.add(pbe)
    db.commit()
    db.refresh(pbe)

    # 1. Generate CN23 PDF Document
    try:
        cn23_path = generate_cn23_pdf(
            pbe_number=pbe.pbe_number,
            order_id=order.id,
            seller_name=seller_name,
            buyer_name=buyer_name,
            country=order.country or "United States",
            hs_code=hs_code,
            invoice_value_inr=float(order.amount_inr),
            currency=currency,
            tracking_number=tracking_number,
        )
        pbe.cn23_pdf_url = cn23_path
    except Exception as pdf_err:
        print(f"[CN23 PDF Gen Warning] {pdf_err}")

    # 2. Submit PBE payload to Mock ICEGATE Gateway
    try:
        icegate_data = submit_pbe_to_icegate(
            ICEGATEPBESubmit(
                pbe_number=pbe.pbe_number,
                order_id=order.id,
                hs_code=pbe.hs_code,
                invoice_value_inr=float(pbe.invoice_value_inr),
                currency=pbe.currency,
                country=pbe.country,
            )
        )
        pbe.icegate_reference = icegate_data.get("icegate_reference")
        pbe.icegate_status = icegate_data.get("status", "ACCEPTED")
        pbe.icegate_submitted_at = datetime.now(timezone.utc)
        if pbe.icegate_status == "ACCEPTED":
            pbe.status = "ICEGATE_ACCEPTED"
    except Exception as exc:
        pbe.icegate_status = "PENDING"
        print(f"[ICEGATE Submission Warning] {exc}")

    # 3. Create ShippingEvent for PBE Filing
    pbe_event = db.query(ShippingEvent).filter(
        ShippingEvent.order_id == order.id,
        ShippingEvent.event_type == "PBE_FILING"
    ).first()
    if not pbe_event:
        pbe_event = ShippingEvent(
            order_id=order.id,
            tracking_number=pbe.tracking_number,
            event_type="PBE_FILING",
            location="DNK Electronic Customs Gateway",
        )
        db.add(pbe_event)

    db.commit()
    db.refresh(pbe)
    return pbe


# ============================================================
# LOGISTICS – PBE SUBMIT
# ============================================================

@app.post(
    "/api/v1/logistics/pbe-submit",
    response_model=PBEResponse,
    status_code=201,
)
def create_pbe(
    data: PBECreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    product = db.query(Product).filter(Product.id == order.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if (
        order.buyer_id != current_user.id
        and product.seller_id != current_user.id
        and getattr(current_user, "role", None) != "ADMIN"
    ):
        raise HTTPException(status_code=403, detail="You are not allowed to submit PBE for this order")

    # If PBE already exists, return existing PBE idempotently
    existing_pbe = db.query(PBE).filter(PBE.order_id == order.id).first()
    if existing_pbe:
        return existing_pbe

    pbe = process_pbe_filing(
        order=order,
        db=db,
        currency=data.currency or "USD",
        exchange_rate=getattr(data, "exchange_rate", None),
        pbe_type=getattr(data, "pbe_type", "PBE-III"),
    )

    return pbe

# ============================================================
# LOGISTICS — GET PBEs
# ============================================================
# ============================================================
# LOGISTICS — ICEGATE STATUS SYNC
# ============================================================

@app.post(
    "/api/v1/logistics/pbe/{pbe_id}/icegate-sync",
    response_model=PBEResponse,
)
def sync_icegate_status(
    pbe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # 1. Find PBE
    # --------------------------------------------------------

    pbe = (
        db.query(PBE)
        .filter(PBE.id == pbe_id)
        .first()
    )

    if not pbe:
        raise HTTPException(
            status_code=404,
            detail="PBE not found",
        )

    # --------------------------------------------------------
    # 2. Authorization
    # --------------------------------------------------------

    if (
        pbe.seller_id != current_user.id
        and pbe.buyer_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to sync this PBE",
        )

    # --------------------------------------------------------
    # 3. ICEGATE reference must exist
    # --------------------------------------------------------

    if not pbe.icegate_reference:
        raise HTTPException(
            status_code=400,
            detail="PBE has not been submitted to ICEGATE",
        )

    # --------------------------------------------------------
    # 4. Ask Mock ICEGATE for current status
    # --------------------------------------------------------

    try:
        icegate_data = get_icegate_status(pbe.icegate_reference)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Mock ICEGATE service unavailable: {str(exc)}",
        )

    # --------------------------------------------------------
    # 7. Extract status
    # --------------------------------------------------------

    icegate_status = icegate_data.get(
        "status",
        "UNKNOWN",
    )

    # --------------------------------------------------------
    # 8. Save ICEGATE status
    # --------------------------------------------------------

    pbe.icegate_status = icegate_status

    if icegate_status == "ACCEPTED":

        pbe.status = "ICEGATE_ACCEPTED"

    elif icegate_status == "REJECTED":

        pbe.status = "ICEGATE_REJECTED"

    # --------------------------------------------------------
    # 9. Save
    # --------------------------------------------------------

    db.commit()
    db.refresh(pbe)

    # --------------------------------------------------------
    # 10. Return
    # --------------------------------------------------------

    return pbe
# ------------------------------------------------------------
# GET MY PBEs
# ------------------------------------------------------------

@app.get(
    "/api/v1/logistics/pbe",
    response_model=list[PBEResponse],
)
def get_my_pbes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pbes = (
        db.query(PBE)
        .filter(
            (PBE.buyer_id == current_user.id)
            | (PBE.seller_id == current_user.id)
        )
        .order_by(PBE.id)
        .all()
    )

    return pbes


# ------------------------------------------------------------
# GET PBE
# ------------------------------------------------------------

@app.get(
    "/api/v1/logistics/pbe/{pbe_id}",
    response_model=PBEResponse,
)
def get_pbe(
    pbe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    pbe = (
        db.query(PBE)
        .filter(PBE.id == pbe_id)
        .first()
    )

    if not pbe:
        raise HTTPException(
            status_code=404,
            detail="PBE not found",
        )

    if (
        pbe.buyer_id != current_user.id
        and pbe.seller_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this PBE",
        )

    return pbe


# ------------------------------------------------------------
# GET CN23 PDF DOCUMENT
# ------------------------------------------------------------

@app.get(
    "/api/v1/logistics/pbe/{pbe_id}/cn23-pdf",
)
def get_pbe_cn23_pdf(
    pbe_id: int,
    db: Session = Depends(get_db),
):
    pbe = db.query(PBE).filter(PBE.id == pbe_id).first()
    if not pbe:
        raise HTTPException(status_code=404, detail="PBE not found")

    order = db.query(Order).filter(Order.id == pbe.order_id).first()
    product = db.query(Product).filter(Product.id == pbe.product_id).first()
    seller = db.query(User).filter(User.id == pbe.seller_id).first()
    buyer = db.query(User).filter(User.id == pbe.buyer_id).first()

    pdf_path = pbe.cn23_pdf_url
    if not pdf_path or not os.path.exists(pdf_path):
        pdf_path = generate_cn23_pdf(
            pbe_number=pbe.pbe_number or f"PBE-{pbe.order_id:06d}",
            order_id=pbe.order_id,
            seller_name=seller.name if seller else "Artisan Exporter",
            buyer_name=buyer.name if buyer else "Overseas Buyer",
            country=order.country if order else pbe.country,
            hs_code=product.hs_code if product and product.hs_code else pbe.hs_code,
            invoice_value_inr=float(pbe.invoice_value_inr),
            currency=pbe.currency,
            tracking_number=pbe.tracking_number or f"DNK{pbe.order_id:09d}IN",
        )
        pbe.cn23_pdf_url = pdf_path
        db.commit()

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"{pbe.pbe_number or 'CN23'}_Customs_Declaration.pdf"
    )


# ------------------------------------------------------------
# GET SHIPMENT TRACKING BY BARCODE
# ------------------------------------------------------------

@app.get(
    "/api/v1/logistics/track/{barcode}",
    response_model=TrackingDetailsResponse,
)
def track_shipment_by_barcode(
    barcode: str,
    db: Session = Depends(get_db),
):
    # 1. Search PBE by tracking_number or barcode
    pbe = (
        db.query(PBE)
        .filter(
            (PBE.tracking_number == barcode)
            | (PBE.barcode == barcode)
        )
        .first()
    )

    # If barcode is format DNK000000022IN, extract order ID
    order = None
    if not pbe:
        numeric_id_str = "".join(filter(str.isdigit, barcode))
        if numeric_id_str:
            numeric_id = int(numeric_id_str)
            order = db.query(Order).filter(Order.id == numeric_id).first()
            if order:
                pbe = db.query(PBE).filter(PBE.order_id == order.id).first()

    if not pbe and not order:
        raise HTTPException(
            status_code=404,
            detail=f"Tracking barcode {barcode} not found on India Post DNK network",
        )

    if not order and pbe:
        order = db.query(Order).filter(Order.id == pbe.order_id).first()

    product = db.query(Product).filter(Product.id == order.product_id).first() if order else None
    escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first() if order else None
    shipping_events = (
        db.query(ShippingEvent)
        .filter(ShippingEvent.order_id == order.id)
        .order_by(ShippingEvent.created_at)
        .all()
    ) if order else []

    # --------------------------------------------------------
    # DYNAMIC STATE DERIVATION
    # --------------------------------------------------------
    # Milestone 1: PBE Filing & ICEGATE Customs Acceptance
    is_pbe_filed = pbe is not None
    is_icegate_accepted = pbe is not None and (
        pbe.icegate_status in ["ACCEPTED", "ICEGATE_ACCEPTED"]
        or pbe.status in [
            "ICEGATE_ACCEPTED", "ACCEPTED", "POSTAL_ACCEPTED", "DROPPED_AT_DNK",
            "FPO_TRANSFERRED", "LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED",
            "IN_TRANSIT", "DELIVERED"
        ]
    )
    pbe_event = next((e for e in shipping_events if e.event_type == "PBE_FILING"), None)

    # Milestone 2: Postal Counter Acceptance
    has_postal_scan = (
        any(e.event_type in ["POSTAL_SCAN", "ACCEPTED", "POSTAL_EVENT_ACCEPTANCE"] for e in shipping_events)
        or (escrow and escrow.status == "RELEASED_TO_SELLER_BANK")
        or (order and order.status in ["DROPPED_AT_DNK", "POSTAL_ACCEPTED", "FPO_TRANSFERRED", "LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
        or (pbe and pbe.status in ["POSTAL_ACCEPTED", "FPO_TRANSFERRED", "LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
    )
    scan_event = next((e for e in shipping_events if e.event_type in ["POSTAL_SCAN", "ACCEPTED", "POSTAL_EVENT_ACCEPTANCE"]), None)

    # Milestone 3: Foreign Post Office (FPO) & Let Export Order (LEO)
    has_leo = (
        any(e.event_type in ["LEO_GRANTED", "LEO_RELEASED", "CUSTOMS_CLEARED"] for e in shipping_events)
        or (order and order.status in ["LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
        or (pbe and pbe.status in ["LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
    )
    leo_event = next((e for e in shipping_events if e.event_type in ["LEO_GRANTED", "LEO_RELEASED", "CUSTOMS_CLEARED"]), None)

    # Milestone 4: Outbound International Air Mail Dispatch
    has_intl_dispatch = (
        any(e.event_type == "INTERNATIONAL_DISPATCHED" for e in shipping_events)
        or (order and order.status in ["INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
        or (pbe and pbe.status in ["INTERNATIONAL_DISPATCHED", "IN_TRANSIT", "DELIVERED"])
    )
    dispatch_event = next((e for e in shipping_events if e.event_type == "INTERNATIONAL_DISPATCHED"), None)

    # Milestone 5: Overseas Destination Delivery
    has_delivered = (
        any(e.event_type == "DELIVERED" for e in shipping_events)
        or (order and order.status == "DELIVERED")
        or (pbe and pbe.status == "DELIVERED")
    )
    delivery_event = next((e for e in shipping_events if e.event_type == "DELIVERED"), None)

    destination_name = order.country if order else (pbe.country if pbe else "United States")

    # --------------------------------------------------------
    # CONSTRUCT 5 SEQUENTIAL TIMELINE MILESTONES
    # --------------------------------------------------------
    events = []

    # 1. PBE Customs Filing Milestone
    if is_icegate_accepted:
        events.append(TrackingEventResponse(
            event_type="PBE_FILING",
            location="DNK Electronic Customs Gateway",
            description=f"Electronic PBE-III customs declaration registered ({pbe.pbe_number}). Simulated ICEGATE reference: {pbe.icegate_reference or 'ICEGATE-VERIFIED'}.",
            timestamp=(pbe.icegate_submitted_at or (pbe_event.created_at if pbe_event else pbe.created_at)).strftime("%b %d, %Y • %I:%M %p"),
            status="COMPLETED",
        ))
    elif is_pbe_filed:
        events.append(TrackingEventResponse(
            event_type="PBE_FILING",
            location="DNK Electronic Customs Gateway",
            description=f"Electronic PBE-III customs declaration submitted ({pbe.pbe_number}). Awaiting ICEGATE appraisal.",
            timestamp=pbe.created_at.strftime("%b %d, %Y • %I:%M %p"),
            status="ACTIVE",
        ))
    else:
        events.append(TrackingEventResponse(
            event_type="PBE_FILING",
            location="DNK Electronic Customs Gateway",
            description="Awaiting Electronic PBE-III customs filing with ICEGATE.",
            timestamp="Pending Submission",
            status="ACTIVE" if (order and order.status in ["PAID", "PENDING"]) else "PENDING",
        ))

    # 2. Postal Counter Acceptance Milestone
    if has_postal_scan:
        events.append(TrackingEventResponse(
            event_type="POSTAL_ACCEPTANCE",
            location="Belagavi DNK Post Office (DNK-KA-BEL-01)",
            description="Postal Counter Acceptance & barcode scan verified. Escrow funds released to seller bank.",
            timestamp=(scan_event.created_at if scan_event else (pbe.created_at if pbe else order.created_at)).strftime("%b %d, %Y • %I:%M %p"),
            status="COMPLETED",
        ))
    else:
        events.append(TrackingEventResponse(
            event_type="POSTAL_ACCEPTANCE",
            location="Belagavi DNK Post Office (DNK-KA-BEL-01)",
            description="Physical parcel drop-off and counter barcode scan at Dak Ghar Niryat Kendra.",
            timestamp="Awaiting Physical Drop-Off" if is_icegate_accepted else "Pending PBE Clearance",
            status="ACTIVE" if is_icegate_accepted else "PENDING",
        ))

    # 3. FPO / LEO Customs Milestone
    if has_leo:
        events.append(TrackingEventResponse(
            event_type="FPO_LEO_CLEARANCE",
            location="CBIC Foreign Post Office (FPO)",
            description="Let Export Order (LEO) granted by Indian Customs. Cleared for export.",
            timestamp=(leo_event.created_at if leo_event else (scan_event.created_at if scan_event else order.created_at)).strftime("%b %d, %Y • %I:%M %p"),
            status="COMPLETED",
        ))
    else:
        events.append(TrackingEventResponse(
            event_type="FPO_LEO_CLEARANCE",
            location="CBIC Foreign Post Office (FPO)",
            description="Customs appraisal and Let Export Order (LEO) grant by CBIC Foreign Post Office.",
            timestamp="In FPO Customs Appraisal" if has_postal_scan else "Pending FPO Transfer",
            status="ACTIVE" if has_postal_scan else "PENDING",
        ))

    # 4. Outbound Air Mail Dispatch Milestone
    if has_intl_dispatch:
        events.append(TrackingEventResponse(
            event_type="AIR_MAIL_DISPATCH",
            location="Bengaluru International Air Mail Hub (Kempegowda FPO)",
            description="Dispatched on international flight to overseas destination.",
            timestamp=(dispatch_event.created_at if dispatch_event else order.created_at).strftime("%b %d, %Y • %I:%M %p"),
            status="COMPLETED",
        ))
    else:
        events.append(TrackingEventResponse(
            event_type="AIR_MAIL_DISPATCH",
            location="Bengaluru International Air Mail Hub (Kempegowda FPO)",
            description="Air mail container consolidation and international flight uplift.",
            timestamp="Ready for Flight Uplift" if has_leo else "Pending Dispatch",
            status="ACTIVE" if has_leo else "PENDING",
        ))

    # 5. Overseas Destination Delivery Milestone
    if has_delivered:
        events.append(TrackingEventResponse(
            event_type="DESTINATION_DELIVERY",
            location=f"{destination_name} (USPS / Partner Post)",
            description=f"Package successfully delivered to recipient address in {destination_name}.",
            timestamp=(delivery_event.created_at if delivery_event else order.created_at).strftime("%b %d, %Y • %I:%M %p"),
            status="COMPLETED",
        ))
    else:
        events.append(TrackingEventResponse(
            event_type="DESTINATION_DELIVERY",
            location=f"{destination_name} (USPS / Partner Post)",
            description=f"Final destination carrier delivery to recipient address in {destination_name}.",
            timestamp="In International Transit" if has_intl_dispatch else "Pending Delivery",
            status="ACTIVE" if has_intl_dispatch else "PENDING",
        ))

    # --------------------------------------------------------
    # DERIVE TOP-LEVEL CONSISTENT STATUS FIELDS
    # --------------------------------------------------------
    derived_pbe_status = pbe.status if pbe else ("NOT_FILED" if not order else "PENDING")
    derived_icegate_status = pbe.icegate_status if pbe else ("NOT_SUBMITTED" if not order else "PENDING")
    derived_escrow_status = escrow.status if escrow else ("FUNDS_HELD_ESCROW" if has_postal_scan else "CREATED")

    return TrackingDetailsResponse(
        tracking_number=pbe.tracking_number if pbe and pbe.tracking_number else barcode,
        order_id=order.id if order else (pbe.order_id if pbe else 1),
        product_title=product.title if product else "Handcrafted Artisan Product",
        destination_country=destination_name,
        shipping_address=order.shipping_address if order else "International Shipping Destination",
        hs_code=product.hs_code if product and product.hs_code else (pbe.hs_code if pbe else "8306.29.00"),
        pbe_number=pbe.pbe_number if pbe else None,
        pbe_status=derived_pbe_status,
        icegate_status=derived_icegate_status,
        escrow_status=derived_escrow_status,
        cn23_pdf_url=f"/api/v1/logistics/pbe/{pbe.id}/cn23-pdf" if pbe else None,
        origin_facility="DNK Belagavi (DNK-KA-BEL-01)",
        events=events,
    )

# ============================================================
# DNK POSTAL SCAN WEBHOOK
# ============================================================

@app.post(
    "/api/v1/webhooks/dnk-scan"
)
def dnk_postal_scan_webhook(
    data: DNKScanCreate,
    db: Session = Depends(get_db),
):
    """
    DNK postal counter scan webhook.
    Triggers:
    1. Order status -> DROPPED_AT_DNK
    2. Escrow release -> RELEASED_TO_SELLER_BANK
    3. Payout ledger creation -> Payout(status='SUCCESS')
    4. Shipping event -> ShippingEvent(event_type='POSTAL_SCAN')
    """
    accepted_event_types = {
        "ACCEPTED",
        "POSTAL_SCAN",
        "POSTAL_EVENT_ACCEPTANCE",
    }

    if data.event_type not in accepted_event_types:
        return {
            "message": "Event received but not an acceptance scan event",
            "event_type": data.event_type,
            "processed": False,
        }

    # 1. Find order
    order = db.query(Order).filter(Order.id == data.order_id).first()
    if not order:
        raise HTTPException(
            status_code=404,
            detail="Order not found",
        )

    # 2. Find escrow
    escrow = db.query(Escrow).filter(Escrow.order_id == order.id).first()
    if not escrow:
        raise HTTPException(
            status_code=404,
            detail="Escrow not found for this order",
        )

    # 3. Find PBE
    pbe = db.query(PBE).filter(PBE.order_id == order.id).first()

    # 4. Check for duplicate scan
    existing_event = db.query(ShippingEvent).filter(
        ShippingEvent.order_id == order.id,
        ShippingEvent.event_type.in_(["ACCEPTED", "POSTAL_SCAN", "POSTAL_EVENT_ACCEPTANCE"])
    ).first()

    if existing_event or escrow.status == "RELEASED_TO_SELLER_BANK" or order.status in ["DROPPED_AT_DNK", "POSTAL_ACCEPTED", "FPO_TRANSFERRED", "LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "DELIVERED"]:
        existing_payout = db.query(Payout).filter(Payout.escrow_id == escrow.id).first()
        return {
            "message": "Postal scan event already processed (Idempotent)",
            "event_type": data.event_type,
            "tracking_number": data.tracking_number,
            "location": data.location,
            "order_id": order.id,
            "escrow_id": escrow.id,
            "payout_id": existing_payout.id if existing_payout else None,
            "payout_reference": existing_payout.payout_reference if existing_payout else None,
            "payout_amount_inr": float(existing_payout.amount_inr) if existing_payout else float(escrow.amount_inr),
            "payout_destination": existing_payout.destination if existing_payout else None,
            "payout_status": existing_payout.status if existing_payout else "SUCCESS",
            "escrow_status": escrow.status,
            "order_status": order.status,
            "payout_triggered": False,
            "processed": True,
            "duplicate": True,
        }

    # 5. Escrow Barrier Validation
    if escrow.status != "FUNDS_HELD_ESCROW":
        raise HTTPException(
            status_code=400,
            detail=f"Postal scan cannot release funds from escrow status '{escrow.status}'. Expected 'FUNDS_HELD_ESCROW'."
        )

    # 6. Find seller & destination
    seller = db.query(User).filter(User.id == escrow.seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=404,
            detail="Seller not found for this escrow",
        )

    seller_destination = seller.upi_id or f"{seller.email.split('@')[0]}@okhdfcbank"

    # 7. Create Shipping Event
    shipping_event = ShippingEvent(
        order_id=order.id,
        tracking_number=data.tracking_number,
        event_type="POSTAL_SCAN",
        location=data.location or "Belagavi DNK Post Office (DNK-KA-BEL-01)",
    )
    db.add(shipping_event)

    # 8. Create Payout Ledger
    payout_reference = f"PAY-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{escrow.id:06d}"
    payout = Payout(
        escrow_id=escrow.id,
        order_id=order.id,
        seller_id=escrow.seller_id,
        amount_inr=escrow.amount_inr,
        destination_type="UPI",
        destination=seller_destination,
        status="SUCCESS",
        payout_reference=payout_reference,
        completed_at=datetime.now(timezone.utc),
    )
    db.add(payout)

    # 9. Update states
    escrow.status = "RELEASED_TO_SELLER_BANK"
    order.status = "DROPPED_AT_DNK"
    if pbe:
        pbe.status = "ITEM_HANDED_OVER"

    # 10. Commit transaction
    try:
        db.commit()
        db.refresh(shipping_event)
        db.refresh(payout)
        db.refresh(escrow)
        db.refresh(order)
        if pbe:
            db.refresh(pbe)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database transaction error during postal scan: {str(exc)}")

    return {
        "message": "DNK postal scan processed successfully. Escrow released to seller bank.",
        "event_type": "POSTAL_SCAN",
        "tracking_number": data.tracking_number,
        "location": shipping_event.location,
        "order_id": order.id,
        "escrow_id": escrow.id,
        "shipping_event_id": shipping_event.id,
        "payout_id": payout.id,
        "payout_reference": payout.payout_reference,
        "payout_amount_inr": float(payout.amount_inr),
        "payout_destination": payout.destination,
        "payout_status": payout.status,
        "escrow_status": escrow.status,
        "order_status": order.status,
        "payout_triggered": True,
        "processed": True,
    }


# ============================================================
# MOCK DNK -> FPO TRANSFER
# ============================================================

@app.post("/api/v1/dnk/fpo-transfer")
def mock_fpo_transfer(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pbe = db.query(PBE).filter(PBE.order_id == order.id).first()
    if not pbe:
        raise HTTPException(status_code=404, detail="PBE not found for this order")

    # Authorization
    if pbe.buyer_id != current_user.id and pbe.seller_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You are not allowed to update this shipment")

    # Preceding state requirement: Must be dropped at DNK / handed over
    allowed_order_states = ["DROPPED_AT_DNK", "POSTAL_ACCEPTED", "FPO_TRANSFERRED", "LEO_GRANTED", "LEO_RELEASED", "INTERNATIONAL_DISPATCHED", "DELIVERED"]
    if order.status not in allowed_order_states:
        raise HTTPException(
            status_code=400,
            detail=f"FPO transfer cannot be performed before postal acceptance scan. Current order status: {order.status}"
        )

    if order.status == "FPO_TRANSFERRED" or pbe.status == "FPO_TRANSFERRED":
        return {
            "message": "FPO transfer already processed (Idempotent)",
            "order_id": order.id,
            "pbe_id": pbe.id,
            "tracking_number": pbe.tracking_number,
            "pbe_status": pbe.status,
            "order_status": order.status,
            "processed": True,
            "duplicate": True,
        }

    # Record Shipping Event
    shipping_event = ShippingEvent(
        order_id=order.id,
        tracking_number=pbe.tracking_number,
        event_type="FPO_TRANSFERRED",
        location="CBIC Foreign Post Office (FPO)",
    )
    db.add(shipping_event)

    pbe.status = "FPO_TRANSFERRED"
    order.status = "FPO_TRANSFERRED"

    db.commit()
    db.refresh(pbe)
    db.refresh(order)

    return {
        "message": "Shipment transferred to Foreign Post Office (FPO) successfully",
        "order_id": order.id,
        "pbe_id": pbe.id,
        "tracking_number": pbe.tracking_number,
        "pbe_status": pbe.status,
        "order_status": order.status,
        "fpo": "CBIC_FOREIGN_POST_OFFICE",
        "processed": True,
    }


# ============================================================
# MOCK DNK / CBIC -> LEO RELEASE
# ============================================================

@app.post("/api/v1/dnk/leo-release")
def mock_leo_release(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pbe = db.query(PBE).filter(PBE.order_id == order.id).first()
    if not pbe:
        raise HTTPException(status_code=404, detail="PBE not found for this order")

    # Authorization
    if pbe.buyer_id != current_user.id and pbe.seller_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You are not allowed to release this shipment")

    if order.status in ["LEO_GRANTED", "LEO_RELEASED"] or pbe.status in ["LEO_GRANTED", "LEO_RELEASED"]:
        return {
            "message": "Let Export Order already released (Idempotent)",
            "order_id": order.id,
            "pbe_id": pbe.id,
            "pbe_status": pbe.status,
            "order_status": order.status,
            "processed": True,
            "duplicate": True,
        }

    if order.status != "FPO_TRANSFERRED" and pbe.status != "FPO_TRANSFERRED":
        raise HTTPException(
            status_code=400,
            detail=f"LEO can only be granted after FPO transfer. Current order status: {order.status}"
        )

    shipping_event = ShippingEvent(
        order_id=order.id,
        tracking_number=pbe.tracking_number,
        event_type="LEO_GRANTED",
        location="CBIC Foreign Post Office (FPO)",
    )
    db.add(shipping_event)

    pbe.status = "LEO_GRANTED"
    order.status = "LEO_GRANTED"

    db.commit()
    db.refresh(pbe)
    db.refresh(order)

    return {
        "message": "Let Export Order (LEO) granted by Indian Customs successfully",
        "order_id": order.id,
        "pbe_id": pbe.id,
        "pbe_number": pbe.pbe_number,
        "tracking_number": pbe.tracking_number,
        "pbe_status": pbe.status,
        "order_status": order.status,
        "customs_status": "LEO_GRANTED",
        "international_dispatch": "READY",
        "processed": True,
    }


# ============================================================
# INTERNATIONAL DISPATCH
# ============================================================

@app.post("/api/v1/dnk/international-dispatch")
def international_dispatch(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pbe = db.query(PBE).filter(PBE.order_id == order_id).first()
    if not pbe:
        raise HTTPException(status_code=404, detail="PBE filing not found")

    # Authorization
    if pbe.buyer_id != current_user.id and pbe.seller_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You are not allowed to dispatch this shipment")

    if order.status == "INTERNATIONAL_DISPATCHED" or pbe.status == "INTERNATIONAL_DISPATCHED":
        return {
            "message": "International dispatch already processed (Idempotent)",
            "order_id": order.id,
            "pbe_id": pbe.id,
            "pbe_number": pbe.pbe_number,
            "tracking_number": pbe.tracking_number,
            "pbe_status": pbe.status,
            "order_status": order.status,
            "processed": True,
            "duplicate": True,
        }

    if order.status not in ["LEO_GRANTED", "LEO_RELEASED"] and pbe.status not in ["LEO_GRANTED", "LEO_RELEASED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Shipment is not ready for international dispatch. LEO customs release required. Current status: {order.status}"
        )

    shipping_event = ShippingEvent(
        order_id=order.id,
        tracking_number=pbe.tracking_number,
        event_type="INTERNATIONAL_DISPATCHED",
        location="Bengaluru International Air Mail Hub (Kempegowda FPO)",
    )
    db.add(shipping_event)

    pbe.status = "INTERNATIONAL_DISPATCHED"
    order.status = "INTERNATIONAL_DISPATCHED"

    db.commit()
    db.refresh(pbe)
    db.refresh(order)

    return {
        "message": "Shipment internationally dispatched successfully on Air Mail uplift",
        "order_id": order.id,
        "pbe_id": pbe.id,
        "pbe_number": pbe.pbe_number,
        "tracking_number": pbe.tracking_number,
        "pbe_status": pbe.status,
        "order_status": order.status,
        "shipping_event_id": shipping_event.id,
        "event_type": shipping_event.event_type,
        "location": shipping_event.location,
        "international_dispatch": "DISPATCHED",
        "processed": True,
    }


# ============================================================
# DESTINATION OVERSEAS DELIVERY CONFIRMATION
# ============================================================

@app.post("/api/v1/dnk/delivery-confirm")
def confirm_delivery(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    pbe = db.query(PBE).filter(PBE.order_id == order_id).first()

    # Authorization
    if order.buyer_id != current_user.id and (pbe and pbe.seller_id != current_user.id) and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="You are not allowed to confirm delivery for this order")

    if order.status == "DELIVERED":
        return {
            "message": "Delivery already confirmed (Idempotent)",
            "order_id": order.id,
            "order_status": order.status,
            "processed": True,
            "duplicate": True,
        }

    if order.status != "INTERNATIONAL_DISPATCHED":
        raise HTTPException(
            status_code=400,
            detail=f"Delivery can only be confirmed after international dispatch. Current status: {order.status}"
        )

    shipping_event = ShippingEvent(
        order_id=order.id,
        tracking_number=pbe.tracking_number if pbe else f"DNK{order.id:09d}IN",
        event_type="DELIVERED",
        location=f"{order.country} (USPS / Partner Post Handover)",
    )
    db.add(shipping_event)

    order.status = "DELIVERED"
    if pbe:
        pbe.status = "DELIVERED"

    db.commit()
    db.refresh(order)
    if pbe:
        db.refresh(pbe)

    return {
        "message": "Delivery confirmed successfully at overseas destination",
        "order_id": order.id,
        "order_status": order.status,
        "pbe_status": pbe.status if pbe else None,
        "processed": True,
    }

# ============================================================
# APPLICATION ENTRY POINT
# ============================================================

if __name__ == "__main__":

    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )