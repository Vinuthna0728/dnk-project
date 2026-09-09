from fastapi import APIRouter
from app.schemas.compliance import ComplianceCheckRequest, ComplianceCheckResponse
from app.services.compliance_service import evaluate_export_compliance

router = APIRouter()

@router.post("/check", response_model=ComplianceCheckResponse)
async def check_compliance(request: ComplianceCheckRequest):
    return evaluate_export_compliance(
        product_title=request.product_title,
        category=request.category,
        material_declared=request.material_declared,
        dye_type=request.dye_type,
        destination_countries=request.destination_countries
    )
