from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import get_db
from models import Order, Product, User, PBE
from auth import get_current_user

from app.services.logistics.domestic_label_generator import (
    generate_domestic_shipping_label,
)
from app.services.logistics.dnk_locator import (
    find_nearest_dnk_centers,
)


router = APIRouter(
    prefix="/logistics",
    tags=["Logistics"],
)


# ============================================================
# DOMESTIC SHIPPING LABEL SCHEMA
# ============================================================

class DomesticShippingLabelRequest(BaseModel):
    order_id: int
    weight_kg: float = 1.25
    origin_pin: str = "590001"
    destination_pin: str = "10001"


# ============================================================
# GENERATE DOMESTIC 4x6 SHIPPING LABEL
# ============================================================

@router.post(
    "/labels/domestic",
)
def generate_domestic_label(
    data: DomesticShippingLabelRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate an India Post-style export shipping label
    for an existing DNK order.

    The endpoint:
    1. Validates the order.
    2. Validates the current user's access.
    3. Finds the product, buyer and seller.
    4. Gets the PBE/tracking number.
    5. Generates the printable shipping-label PDF.
    6. Returns the PDF as a downloadable response.
    """

    # --------------------------------------------------------
    # 1. Find order
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # 2. Find product
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # 3. Authorization
    # --------------------------------------------------------

    if (
        order.buyer_id != current_user.id
        and product.seller_id != current_user.id
        and getattr(current_user, "role", None) != "ADMIN"
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to generate a label for this order",
        )

    # --------------------------------------------------------
    # 4. Find PBE / tracking number
    # --------------------------------------------------------

    pbe = (
        db.query(PBE)
        .filter(PBE.order_id == order.id)
        .first()
    )

    if not pbe:
        raise HTTPException(
            status_code=404,
            detail="PBE filing not found for this order. Create the PBE first.",
        )

    if not pbe.tracking_number:
        raise HTTPException(
            status_code=400,
            detail="Tracking number is not available for this PBE",
        )

    tracking_number = pbe.tracking_number

    # --------------------------------------------------------
    # 5. Find buyer / seller
    # --------------------------------------------------------

    buyer = (
        db.query(User)
        .filter(User.id == order.buyer_id)
        .first()
    )

    seller = (
        db.query(User)
        .filter(User.id == product.seller_id)
        .first()
    )

    consignee_name = (
        buyer.name
        if buyer and buyer.name
        else "International Buyer"
    )

    sender_name = (
        seller.name
        if seller and seller.name
        else "Dak Ghar Seller"
    )

    # --------------------------------------------------------
    # 6. Addresses
    # --------------------------------------------------------

    consignee_address = (
        order.shipping_address
        if order.shipping_address
        else "International Destination"
    )

    sender_address = (
        "DNK Belagavi, Karnataka, India"
    )

    # --------------------------------------------------------
    # 7. Validate weight
    # --------------------------------------------------------

    if data.weight_kg <= 0:
        raise HTTPException(
            status_code=400,
            detail="Weight must be greater than zero",
        )

    # --------------------------------------------------------
    # 8. Generate shipping label PDF
    # --------------------------------------------------------

    try:
        label_path = generate_domestic_shipping_label(
            tracking_number=tracking_number,
            order_id=order.id,
            consignee_name=consignee_name,
            consignee_address=consignee_address,
            destination_pin=data.destination_pin,
            sender_name=sender_name,
            sender_address=sender_address,
            weight_kg=data.weight_kg,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Shipping label generation failed: {str(exc)}",
        )

    # --------------------------------------------------------
    # 9. Verify generated file
    # --------------------------------------------------------

    filepath = Path(label_path)

    if not filepath.exists():
        raise HTTPException(
            status_code=500,
            detail="Shipping label PDF was not generated",
        )

    # --------------------------------------------------------
    # 10. Return PDF
    # --------------------------------------------------------

    return FileResponse(
        path=str(filepath),
        media_type="application/pdf",
        filename=filepath.name,
        headers={
            "X-DNK-Tracking-Number": tracking_number,
            "X-DNK-Order-ID": str(order.id),
            "X-DNK-Label-Type": "PDF_4X6",
        },
    )


# ============================================================
# DNK / SUB-PO LOCATOR
# ============================================================

@router.get(
    "/dnk-centers",
)
def get_nearest_dnk_centers(
    lat: float = Query(
        ...,
        ge=-90,
        le=90,
        description="Search latitude",
    ),
    lng: float = Query(
        ...,
        ge=-180,
        le=180,
        description="Search longitude",
    ),
):
    """
    Return the five nearest DNK/Sub-PO facilities for the
    supplied latitude and longitude.

    Distance is calculated using the Haversine formula.
    """

    try:
        centers = find_nearest_dnk_centers(
            latitude=lat,
            longitude=lng,
            limit=5,
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    except ValueError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )

    return {
        "search_coordinates": {
            "lat": lat,
            "lng": lng,
        },
        "count": len(centers),
        "centers": centers,
    }
