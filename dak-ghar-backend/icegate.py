from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(
    prefix="/api/v1/mock/icegate",
    tags=["Mock ICEGATE"],
)


# ============================================================
# REQUEST SCHEMA
# ============================================================

class ICEGATEPBESubmit(BaseModel):
    pbe_number: str
    order_id: int
    hs_code: str
    invoice_value_inr: float
    currency: str
    country: str


# ============================================================
# MOCK ICEGATE PBE SUBMISSION
# ============================================================

@router.post("/pbe-submit")
def submit_pbe_to_icegate(data: ICEGATEPBESubmit):

    # --------------------------------------------------------
    # 1. Basic validation
    # --------------------------------------------------------

    if not data.pbe_number:
        return {
            "success": False,
            "status": "REJECTED",
            "message": "PBE number is required",
            "icegate_reference": None,
        }

    if not data.hs_code:
        return {
            "success": False,
            "status": "REJECTED",
            "message": "HS code is required",
            "icegate_reference": None,
        }

    if data.invoice_value_inr <= 0:
        return {
            "success": False,
            "status": "REJECTED",
            "message": "Invoice value must be greater than zero",
            "icegate_reference": None,
        }

    if not data.country:
        return {
            "success": False,
            "status": "REJECTED",
            "message": "Destination country is required",
            "icegate_reference": None,
        }

    # --------------------------------------------------------
    # 2. Generate Mock ICEGATE reference
    # --------------------------------------------------------

    icegate_reference = (
        f"ICEGATE-{datetime.utcnow().strftime('%Y%m%d')}-"
        f"{uuid4().hex[:8].upper()}"
    )

    # --------------------------------------------------------
    # 3. Mock successful submission
    # --------------------------------------------------------

    return {
        "success": True,
        "status": "ACCEPTED",
        "message": "PBE accepted by Mock ICEGATE",
        "icegate_reference": icegate_reference,
        "pbe_number": data.pbe_number,
        "order_id": data.order_id,
        "hs_code": data.hs_code,
        "invoice_value_inr": data.invoice_value_inr,
        "currency": data.currency,
        "country": data.country,
        "received_at": datetime.utcnow(),
    }


# ============================================================
# MOCK ICEGATE STATUS
# ============================================================

@router.get("/status/{icegate_reference}")
def get_icegate_status(icegate_reference: str):

    # --------------------------------------------------------
    # Basic validation
    # --------------------------------------------------------

    if not icegate_reference:
        return {
            "success": False,
            "status": "NOT_FOUND",
            "message": "ICEGATE reference is required",
            "icegate_reference": None,
        }

    # --------------------------------------------------------
    # Mock status response
    # --------------------------------------------------------

    return {
        "success": True,
        "icegate_reference": icegate_reference,
        "status": "ACCEPTED",
        "message": "PBE is accepted by Mock ICEGATE",
        "checked_at": datetime.utcnow(),
    }