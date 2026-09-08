from pathlib import Path
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session

from database import get_db
from models import (
    Order,
    Product,
    User,
    PBE,
    Batch,
    BatchOrder,
    Manifest,
    Handover,
    ShippingEvent,
)
from auth import get_current_user

from app.services.logistics.domestic_label_generator import (
    generate_domestic_shipping_label,
)
from app.services.logistics.dnk_locator import (
    find_nearest_dnk_centers,
)
from app.services.logistics.manifest_service import (
    generate_manifest_pdf,
    generate_manifest_qr,
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
    """

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
        .filter(Product.id == order.product_id)
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
        and getattr(current_user, "role", None) != "ADMIN"
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to generate a label for this order",
        )

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

    consignee_address = (
        order.shipping_address
        if order.shipping_address
        else "International Destination"
    )

    sender_address = "DNK Belagavi, Karnataka, India"

    if data.weight_kg <= 0:
        raise HTTPException(
            status_code=400,
            detail="Weight must be greater than zero",
        )

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

    filepath = Path(label_path)

    if not filepath.exists():
        raise HTTPException(
            status_code=500,
            detail="Shipping label PDF was not generated",
        )

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
    Return the five nearest DNK/Sub-PO facilities.
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


# ============================================================
# BATCH CREATION SCHEMA
# ============================================================

class BatchCreateRequest(BaseModel):
    order_ids: list[int] = Field(
        ...,
        min_length=1,
        description="Orders to include in the postal dispatch batch",
    )

    dnk_center: str | None = Field(
        default=None,
        max_length=200,
        description="DNK/Sub-PO facility handling the batch",
    )


# ============================================================
# CREATE POSTAL DISPATCH BATCH
# ============================================================

@router.post(
    "/batches",
)
def create_batch(
    data: BatchCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a postal dispatch batch from multiple orders.
    """

    order_ids = list(dict.fromkeys(data.order_ids))

    if not order_ids:
        raise HTTPException(
            status_code=400,
            detail="At least one order is required",
        )

    orders = (
        db.query(Order)
        .filter(Order.id.in_(order_ids))
        .all()
    )

    orders_by_id = {
        order.id: order
        for order in orders
    }

    missing_ids = [
        order_id
        for order_id in order_ids
        if order_id not in orders_by_id
    ]

    if missing_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Orders not found: {missing_ids}",
        )

    tracking_numbers_by_order = {}

    for order_id in order_ids:

        order = orders_by_id[order_id]

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found for order {order.id}",
            )

        if (
            product.seller_id != current_user.id
            and getattr(current_user, "role", None) != "ADMIN"
        ):
            raise HTTPException(
                status_code=403,
                detail=f"You are not allowed to add order {order.id} to a batch",
            )

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        if not pbe:
            raise HTTPException(
                status_code=400,
                detail=f"Order {order.id} does not have a PBE filing",
            )

        if not pbe.tracking_number:
            raise HTTPException(
                status_code=400,
                detail=f"Order {order.id} does not have a tracking number",
            )

        tracking_numbers_by_order[order.id] = pbe.tracking_number

        existing_batch_order = (
            db.query(BatchOrder)
            .filter(BatchOrder.order_id == order.id)
            .first()
        )

        if existing_batch_order:
            existing_batch = (
                db.query(Batch)
                .filter(Batch.id == existing_batch_order.batch_id)
                .first()
            )

            batch_code = (
                existing_batch.batch_code
                if existing_batch
                else str(existing_batch_order.batch_id)
            )

            raise HTTPException(
                status_code=409,
                detail=(
                    f"Order {order.id} is already assigned "
                    f"to batch {batch_code}"
                ),
            )

    next_batch_number = (
        db.query(Batch.id)
        .order_by(Batch.id.desc())
        .first()
    )

    sequence = (
        next_batch_number[0] + 1
        if next_batch_number
        else 1
    )

    batch_code = f"DNK-BATCH-2026-{sequence:06d}"

    batch = Batch(
        batch_code=batch_code,
        dnk_center=data.dnk_center,
        status="CREATED",
    )

    db.add(batch)
    db.flush()

    for order_id in order_ids:

        batch_order = BatchOrder(
            batch_id=batch.id,
            order_id=order_id,
        )

        db.add(batch_order)

    db.commit()
    db.refresh(batch)

    return {
        "message": "Postal dispatch batch created successfully",
        "batch": {
            "id": batch.id,
            "batch_code": batch.batch_code,
            "dnk_center": batch.dnk_center,
            "status": batch.status,
            "created_at": batch.created_at,
            "order_count": len(order_ids),
            "orders": [
                {
                    "order_id": order_id,
                    "tracking_number": tracking_numbers_by_order[order_id],
                }
                for order_id in order_ids
            ],
        },
    }


# ============================================================
# GET BATCH DETAILS
# ============================================================

@router.get(
    "/batches/{batch_id}",
)
def get_batch(
    batch_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return complete details for a postal dispatch batch.
    """

    batch = (
        db.query(Batch)
        .filter(Batch.id == batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch not found",
        )

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    orders_response = []

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if (
            product
            and product.seller_id != current_user.id
            and getattr(current_user, "role", None) != "ADMIN"
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view this batch",
            )

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        orders_response.append(
            {
                "order_id": order.id,
                "tracking_number": (
                    pbe.tracking_number
                    if pbe
                    else None
                ),
                "country": order.country,
                "status": order.status,
            }
        )

    return {
        "batch": {
            "id": batch.id,
            "batch_code": batch.batch_code,
            "dnk_center": batch.dnk_center,
            "status": batch.status,
            "created_at": batch.created_at,
            "order_count": len(orders_response),
            "orders": orders_response,
        }
    }


# ============================================================
# MANIFEST CREATION SCHEMA
# ============================================================

class ManifestCreateRequest(BaseModel):
    batch_id: int = Field(
        ...,
        description="Existing postal dispatch batch to convert into a manifest",
    )


# ============================================================
# CREATE POSTAL DISPATCH MANIFEST
# ============================================================

@router.post(
    "/manifests",
)
def create_manifest(
    data: ManifestCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a consolidated postal dispatch manifest from
    an existing batch.
    """

    batch = (
        db.query(Batch)
        .filter(Batch.id == data.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch not found",
        )

    existing_manifest = (
        db.query(Manifest)
        .filter(Manifest.batch_id == batch.id)
        .first()
    )

    if existing_manifest:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Manifest already exists for batch "
                f"{batch.batch_code}: {existing_manifest.manifest_code}"
            ),
        )

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    if not batch_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot create a manifest for an empty batch",
        )

    shipment_details = []

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Order {batch_order.order_id} referenced by "
                    f"batch {batch.batch_code} was not found"
                ),
            )

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product not found for order {order.id}",
            )

        if (
            product.seller_id != current_user.id
            and getattr(current_user, "role", None) != "ADMIN"
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to create a manifest for this batch",
            )

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        if not pbe:
            raise HTTPException(
                status_code=400,
                detail=f"Order {order.id} does not have a PBE filing",
            )

        if not pbe.tracking_number:
            raise HTTPException(
                status_code=400,
                detail=f"Order {order.id} does not have a tracking number",
            )

        shipment_details.append(
            {
                "order_id": order.id,
                "tracking_number": pbe.tracking_number,
                "destination": order.country,
                "weight": "N/A",
                "status": order.status,
            }
        )

    latest_manifest = (
        db.query(Manifest.id)
        .order_by(Manifest.id.desc())
        .first()
    )

    sequence = (
        latest_manifest[0] + 1
        if latest_manifest
        else 1
    )

    manifest_code = f"DNK-MANIFEST-2026-{sequence:06d}"

    manifest = Manifest(
        manifest_code=manifest_code,
        batch_id=batch.id,
        dnk_center=batch.dnk_center,
        shipment_count=len(shipment_details),
        status="CREATED",
    )

    db.add(manifest)
    db.commit()
    db.refresh(manifest)

    return {
        "message": "Postal dispatch manifest created successfully",
        "manifest": {
            "id": manifest.id,
            "manifest_code": manifest.manifest_code,
            "batch_id": manifest.batch_id,
            "batch_code": batch.batch_code,
            "dnk_center": manifest.dnk_center,
            "shipment_count": manifest.shipment_count,
            "status": manifest.status,
            "created_at": manifest.created_at,
            "shipments": shipment_details,
        },
    }


# ============================================================
# GET MANIFEST DETAILS
# ============================================================

@router.get(
    "/manifests/{manifest_id}",
)
def get_manifest(
    manifest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return complete details for a postal dispatch manifest.
    """

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest not found",
        )

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this manifest was not found",
        )

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    shipments = []

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if not product:
            continue

        if (
            product.seller_id != current_user.id
            and getattr(current_user, "role", None) != "ADMIN"
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to view this manifest",
            )

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        shipments.append(
            {
                "order_id": order.id,
                "tracking_number": (
                    pbe.tracking_number
                    if pbe
                    else None
                ),
                "destination": order.country,
                "weight": "N/A",
                "status": order.status,
            }
        )

    return {
        "manifest": {
            "id": manifest.id,
            "manifest_code": manifest.manifest_code,
            "batch_id": manifest.batch_id,
            "batch_code": batch.batch_code,
            "dnk_center": manifest.dnk_center,
            "shipment_count": manifest.shipment_count,
            "status": manifest.status,
            "created_at": manifest.created_at,
            "shipments": shipments,
        }
    }


# ============================================================
# DOWNLOAD MANIFEST PDF
# ============================================================

@router.get(
    "/manifests/{manifest_id}/pdf",
)
def download_manifest_pdf(
    manifest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate and download the printable PDF for an existing
    postal dispatch manifest.
    """

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest not found",
        )

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this manifest was not found",
        )

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    shipments = []

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if not product:
            continue

        if (
            product.seller_id != current_user.id
            and getattr(current_user, "role", None) != "ADMIN"
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to download this manifest",
            )

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        shipments.append(
            {
                "order_id": order.id,
                "tracking_number": (
                    pbe.tracking_number
                    if pbe
                    else None
                ),
                "destination": order.country,
                "weight": "N/A",
                "status": order.status,
            }
        )

    try:
        pdf_path = generate_manifest_pdf(
            manifest_code=manifest.manifest_code,
            batch_code=batch.batch_code,
            dnk_center=manifest.dnk_center,
            created_at=manifest.created_at,
            shipment_count=manifest.shipment_count,
            shipments=shipments,
            status=manifest.status,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Manifest PDF generation failed: {str(exc)}",
        )

    filepath = Path(pdf_path)

    if not filepath.exists():
        raise HTTPException(
            status_code=500,
            detail="Manifest PDF was not generated",
        )

    return FileResponse(
        path=str(filepath),
        media_type="application/pdf",
        filename=filepath.name,
        headers={
            "X-DNK-Manifest-ID": str(manifest.id),
            "X-DNK-Manifest-Code": manifest.manifest_code,
            "X-DNK-Batch-Code": batch.batch_code,
            "X-DNK-Document-Type": "POSTAL_DISPATCH_MANIFEST",
        },
    )


# ============================================================
# DOWNLOAD MANIFEST QR
# ============================================================

@router.get(
    "/manifests/{manifest_id}/qr",
)
def download_manifest_qr(
    manifest_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate and download the QR code for an existing
    postal dispatch manifest.

    The QR contains:
        - Manifest code
        - Batch ID
        - Batch code
        - Tracking numbers

    This allows one-scan postal counter intake.
    """

    # --------------------------------------------------------
    # 1. Find manifest
    # --------------------------------------------------------

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest not found",
        )

    # --------------------------------------------------------
    # 2. Find associated batch
    # --------------------------------------------------------

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this manifest was not found",
        )

    # --------------------------------------------------------
    # 3. Get batch orders
    # --------------------------------------------------------

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    if not batch_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot generate QR for an empty manifest",
        )

    # --------------------------------------------------------
    # 4. Authorization + tracking numbers
    # --------------------------------------------------------

    tracking_numbers = []

    authorized = (
        getattr(current_user, "role", None) == "ADMIN"
    )

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if product and product.seller_id == current_user.id:
            authorized = True

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        if pbe and pbe.tracking_number:
            tracking_numbers.append(
                pbe.tracking_number
            )

    if not authorized:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to generate this manifest QR",
        )

    if not tracking_numbers:
        raise HTTPException(
            status_code=400,
            detail="No tracking numbers are available for this manifest",
        )

    # --------------------------------------------------------
    # 5. Generate QR
    # --------------------------------------------------------

    try:
        qr_path = generate_manifest_qr(
            manifest_code=manifest.manifest_code,
            batch_id=batch.id,
            batch_code=batch.batch_code,
            tracking_numbers=tracking_numbers,
        )

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Manifest QR generation failed: {str(exc)}",
        )

    # --------------------------------------------------------
    # 6. Verify generated file
    # --------------------------------------------------------

    filepath = Path(qr_path)

    if not filepath.exists():
        raise HTTPException(
            status_code=500,
            detail="Manifest QR image was not generated",
        )

    # --------------------------------------------------------
    # 7. Return QR image
    # --------------------------------------------------------

    return FileResponse(
        path=str(filepath),
        media_type="image/png",
        filename=filepath.name,
        headers={
            "X-DNK-Manifest-ID": str(manifest.id),
            "X-DNK-Manifest-Code": manifest.manifest_code,
            "X-DNK-Batch-ID": str(batch.id),
            "X-DNK-Batch-Code": batch.batch_code,
            "X-DNK-QR-Type": "DNK_POSTAL_MANIFEST",
            "X-DNK-Tracking-Count": str(
                len(tracking_numbers)
            ),
        },
    )


# ============================================================
# HANDOVER SCHEMAS
# ============================================================

class HandoverCreateRequest(BaseModel):
    manifest_id: int = Field(
        ...,
        description="Manifest being physically handed over to the DNK/Postal facility",
    )

    received_by: str = Field(
        ...,
        min_length=2,
        max_length=100,
        description="Name of the DNK/Postal officer receiving the shipment",
    )

    remarks: str | None = Field(
        default=None,
        max_length=1000,
        description="Optional handover remarks",
    )


# ============================================================
# CREATE POSTAL / DNK HANDOVER
# ============================================================

@router.post(
    "/handovers",
)
def create_handover(
    data: HandoverCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a physical Postal/DNK handover record for a manifest.

    A manifest can have only one handover.
    """

    # --------------------------------------------------------
    # 1. Find manifest
    # --------------------------------------------------------

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == data.manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest not found",
        )

    # --------------------------------------------------------
    # 2. Find associated batch
    # --------------------------------------------------------

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this manifest was not found",
        )

    # --------------------------------------------------------
    # 3. Check authorization through manifest shipments
    # --------------------------------------------------------

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    if not batch_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot create handover for an empty manifest",
        )

    authorized = (
        getattr(current_user, "role", None) == "ADMIN"
    )

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        product = (
            db.query(Product)
            .filter(Product.id == order.product_id)
            .first()
        )

        if product and product.seller_id == current_user.id:
            authorized = True
            break

    if not authorized:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to create a handover for this manifest",
        )

    # --------------------------------------------------------
    # 4. Check whether a handover already exists
    # --------------------------------------------------------

    existing_handover = (
        db.query(Handover)
        .filter(Handover.manifest_id == manifest.id)
        .first()
    )

    if existing_handover:
        raise HTTPException(
            status_code=409,
            detail=(
                f"Handover already exists for manifest "
                f"{manifest.manifest_code}: "
                f"{existing_handover.handover_reference}"
            ),
        )

    # --------------------------------------------------------
    # 5. Validate manifest state
    # --------------------------------------------------------

    if manifest.status in {
        "HANDED_OVER",
        "COMPLETED",
    }:
        raise HTTPException(
            status_code=409,
            detail="Manifest has already been handed over",
        )

    # --------------------------------------------------------
    # 6. Generate handover reference
    # --------------------------------------------------------

    latest_handover = (
        db.query(Handover.id)
        .order_by(Handover.id.desc())
        .first()
    )

    sequence = (
        latest_handover[0] + 1
        if latest_handover
        else 1
    )

    handover_reference = (
        f"DNK-HANDOVER-2026-{sequence:06d}"
    )

    # --------------------------------------------------------
    # 7. Create handover
    # --------------------------------------------------------

    handover = Handover(
        handover_reference=handover_reference,
        manifest_id=manifest.id,
        dnk_center=manifest.dnk_center,
        handed_over_by=current_user.id,
        received_by=data.received_by.strip(),
        status="CREATED",
        handover_at=None,
        remarks=data.remarks.strip()
        if data.remarks
        else None,
    )

    db.add(handover)
    db.commit()
    db.refresh(handover)

    return {
        "message": "Postal/DNK handover created successfully",
        "handover": {
            "id": handover.id,
            "handover_reference": handover.handover_reference,
            "manifest_id": handover.manifest_id,
            "manifest_code": manifest.manifest_code,
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "dnk_center": handover.dnk_center,
            "handed_over_by": handover.handed_over_by,
            "received_by": handover.received_by,
            "status": handover.status,
            "handover_at": handover.handover_at,
            "remarks": handover.remarks,
            "created_at": handover.created_at,
        },
    }


# ============================================================
# GET HANDOVER DETAILS
# ============================================================

@router.get(
    "/handovers/{handover_id}",
)
def get_handover(
    handover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return complete details for a Postal/DNK handover.
    """

    handover = (
        db.query(Handover)
        .filter(Handover.id == handover_id)
        .first()
    )

    if not handover:
        raise HTTPException(
            status_code=404,
            detail="Handover not found",
        )

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == handover.manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest associated with this handover was not found",
        )

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this handover was not found",
        )

    # --------------------------------------------------------
    # Authorization
    # --------------------------------------------------------

    authorized = (
        getattr(current_user, "role", None) == "ADMIN"
        or handover.handed_over_by == current_user.id
    )

    if not authorized:

        batch_orders = (
            db.query(BatchOrder)
            .filter(BatchOrder.batch_id == batch.id)
            .all()
        )

        for batch_order in batch_orders:

            order = (
                db.query(Order)
                .filter(Order.id == batch_order.order_id)
                .first()
            )

            if not order:
                continue

            product = (
                db.query(Product)
                .filter(Product.id == order.product_id)
                .first()
            )

            if product and product.seller_id == current_user.id:
                authorized = True
                break

    if not authorized:
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to view this handover",
        )

    # --------------------------------------------------------
    # Shipment details
    # --------------------------------------------------------

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    shipments = []

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        shipments.append(
            {
                "order_id": order.id,
                "tracking_number": (
                    pbe.tracking_number
                    if pbe
                    else None
                ),
                "destination": order.country,
                "status": order.status,
            }
        )

    return {
        "handover": {
            "id": handover.id,
            "handover_reference": handover.handover_reference,
            "manifest_id": handover.manifest_id,
            "manifest_code": manifest.manifest_code,
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "dnk_center": handover.dnk_center,
            "handed_over_by": handover.handed_over_by,
            "received_by": handover.received_by,
            "status": handover.status,
            "handover_at": handover.handover_at,
            "remarks": handover.remarks,
            "created_at": handover.created_at,
            "shipment_count": len(shipments),
            "shipments": shipments,
        },
    }


# ============================================================
# COMPLETE POSTAL / DNK HANDOVER
# ============================================================

@router.post(
    "/handovers/{handover_id}/complete",
)
def complete_handover(
    handover_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Complete a physical Postal/DNK handover.

    This:
    1. Marks the handover COMPLETED.
    2. Records the handover timestamp.
    3. Marks the manifest HANDED_OVER.
    4. Marks the batch HANDED_OVER.
    5. Creates a HANDOVER_COMPLETED ShippingEvent
       for each shipment.
    """

    # --------------------------------------------------------
    # 1. Find handover
    # --------------------------------------------------------

    handover = (
        db.query(Handover)
        .filter(Handover.id == handover_id)
        .first()
    )

    if not handover:
        raise HTTPException(
            status_code=404,
            detail="Handover not found",
        )

    # --------------------------------------------------------
    # 2. Authorization
    # --------------------------------------------------------

    if (
        handover.handed_over_by != current_user.id
        and getattr(current_user, "role", None) != "ADMIN"
    ):
        raise HTTPException(
            status_code=403,
            detail="You are not allowed to complete this handover",
        )

    # --------------------------------------------------------
    # 3. Prevent duplicate completion
    # --------------------------------------------------------

    if handover.status == "COMPLETED":
        raise HTTPException(
            status_code=409,
            detail="Handover is already completed",
        )

    # --------------------------------------------------------
    # 4. Find manifest
    # --------------------------------------------------------

    manifest = (
        db.query(Manifest)
        .filter(Manifest.id == handover.manifest_id)
        .first()
    )

    if not manifest:
        raise HTTPException(
            status_code=404,
            detail="Manifest associated with this handover was not found",
        )

    # --------------------------------------------------------
    # 5. Find batch
    # --------------------------------------------------------

    batch = (
        db.query(Batch)
        .filter(Batch.id == manifest.batch_id)
        .first()
    )

    if not batch:
        raise HTTPException(
            status_code=404,
            detail="Batch associated with this handover was not found",
        )

    # --------------------------------------------------------
    # 6. Get shipments
    # --------------------------------------------------------

    batch_orders = (
        db.query(BatchOrder)
        .filter(BatchOrder.batch_id == batch.id)
        .all()
    )

    if not batch_orders:
        raise HTTPException(
            status_code=400,
            detail="Cannot complete handover for an empty batch",
        )

    shipment_results = []

    # --------------------------------------------------------
    # 7. Create shipping events
    # --------------------------------------------------------

    for batch_order in batch_orders:

        order = (
            db.query(Order)
            .filter(Order.id == batch_order.order_id)
            .first()
        )

        if not order:
            continue

        pbe = (
            db.query(PBE)
            .filter(PBE.order_id == order.id)
            .first()
        )

        if not pbe:
            continue

        if not pbe.tracking_number:
            continue

        tracking_number = pbe.tracking_number

        # ----------------------------------------------------
        # Prevent duplicate HANDOVER_COMPLETED events
        # ----------------------------------------------------

        existing_event = (
            db.query(ShippingEvent)
            .filter(
                ShippingEvent.order_id == order.id,
                ShippingEvent.tracking_number == tracking_number,
                ShippingEvent.event_type == "HANDOVER_COMPLETED",
            )
            .first()
        )

        if not existing_event:

            event = ShippingEvent(
                order_id=order.id,
                tracking_number=tracking_number,
                event_type="HANDOVER_COMPLETED",
                location=handover.dnk_center,
            )

            db.add(event)

            event_created = True

        else:
            event_created = False

        shipment_results.append(
            {
                "order_id": order.id,
                "tracking_number": tracking_number,
                "event_type": "HANDOVER_COMPLETED",
                "event_created": event_created,
            }
        )

    # --------------------------------------------------------
    # 8. Update handover
    # --------------------------------------------------------

    handover.status = "COMPLETED"
    handover.handover_at = datetime.utcnow()

    # --------------------------------------------------------
    # 9. Update manifest and batch
    # --------------------------------------------------------

    manifest.status = "HANDED_OVER"
    batch.status = "HANDED_OVER"

    db.commit()

    db.refresh(handover)
    db.refresh(manifest)
    db.refresh(batch)

    return {
        "message": "Postal/DNK handover completed successfully",
        "handover": {
            "id": handover.id,
            "handover_reference": handover.handover_reference,
            "manifest_id": manifest.id,
            "manifest_code": manifest.manifest_code,
            "batch_id": batch.id,
            "batch_code": batch.batch_code,
            "dnk_center": handover.dnk_center,
            "received_by": handover.received_by,
            "status": handover.status,
            "handover_at": handover.handover_at,
        },
        "manifest": {
            "id": manifest.id,
            "manifest_code": manifest.manifest_code,
            "status": manifest.status,
        },
        "batch": {
            "id": batch.id,
            "batch_code": batch.batch_code,
            "status": batch.status,
        },
        "shipping_events": shipment_results,
        "shipment_count": len(shipment_results),
    }