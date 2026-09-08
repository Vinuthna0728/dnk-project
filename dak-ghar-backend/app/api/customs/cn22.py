from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from app.services.customs.cn22_generator import generate_cn22_pdf


router = APIRouter(
    prefix="/cn22",
    tags=["CN22 Customs Declaration"],
)


class CN22CreateRequest(BaseModel):
    order_id: int
    seller_name: str = Field(min_length=1)
    buyer_name: str = Field(min_length=1)
    country: str = Field(min_length=1)
    product_title: str = Field(min_length=1)
    quantity: int = Field(default=1, ge=1)
    hs_code: str = Field(min_length=1)
    invoice_value_inr: float = Field(gt=0)
    currency: str = Field(default="USD", min_length=1)
    tracking_number: str = Field(min_length=1)


@router.post("/generate", response_class=FileResponse)
def generate_cn22(data: CN22CreateRequest):
    """
    Generate a CN22 customs declaration PDF and return it as a file.
    """

    try:
        filepath = generate_cn22_pdf(
            order_id=data.order_id,
            seller_name=data.seller_name,
            buyer_name=data.buyer_name,
            country=data.country,
            product_title=data.product_title,
            quantity=data.quantity,
            hs_code=data.hs_code,
            invoice_value_inr=data.invoice_value_inr,
            currency=data.currency,
            tracking_number=data.tracking_number,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate CN22 PDF: {exc}",
        ) from exc

    path = Path(filepath)

    if not path.exists():
        raise HTTPException(
            status_code=500,
            detail="CN22 PDF was generated but could not be found.",
        )

    return FileResponse(
        path=str(path),
        media_type="application/pdf",
        filename=path.name,
    )