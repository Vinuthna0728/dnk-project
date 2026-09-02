from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode import code128


def generate_cn22_pdf(
    order_id: int,
    seller_name: str,
    buyer_name: str,
    country: str,
    product_title: str,
    quantity: int,
    hs_code: str,
    invoice_value_inr: float,
    currency: str,
    tracking_number: str,
) -> str:
    """
    Generate a CN22-style customs declaration PDF.

    This generator is intentionally kept independent from FastAPI/database
    logic so it can be reused by API endpoints and the existing PBE flow.
    """

    output_dir = Path("generated_documents")
    output_dir.mkdir(parents=True, exist_ok=True)

    filename = f"ORDER-{order_id}_CN22.pdf"
    filepath = output_dir / filename

    pdf = canvas.Canvas(
        str(filepath),
        pagesize=A4,
    )

    width, height = A4

    # ========================================================
    # HEADER
    # ========================================================

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(
        20 * mm,
        height - 25 * mm,
        "CN22 CUSTOMS DECLARATION",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        20 * mm,
        height - 32 * mm,
        "Dak Ghar Niryat Kendra - Postal Export Declaration",
    )

    # ========================================================
    # ORDER INFORMATION
    # ========================================================

    y = height - 50 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "SHIPMENT INFORMATION",
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    fields = [
        ("Order ID", str(order_id)),
        ("Tracking Number", tracking_number),
        ("Destination Country", country),
        ("Currency", currency),
    ]

    for label, value in fields:
        pdf.drawString(
            20 * mm,
            y,
            f"{label}: {value}",
        )
        y -= 6 * mm

    # ========================================================
    # SELLER / BUYER
    # ========================================================

    y -= 6 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "PARTIES",
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        y,
        f"Sender / Seller: {seller_name}",
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Recipient / Buyer: {buyer_name}",
    )

    # ========================================================
    # CONTENTS / CUSTOMS INFORMATION
    # ========================================================

    y -= 14 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "CONTENTS / CUSTOMS DETAILS",
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        y,
        f"Description: {product_title}",
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Quantity: {quantity}",
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"HS Code: {hs_code}",
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Declared Value: {invoice_value_inr:.2f} INR",
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Declared Currency: {currency}",
    )

    # ========================================================
    # DECLARATION
    # ========================================================

    y -= 14 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "CUSTOMS DECLARATION",
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 9)

    declaration = (
        "I declare that the information provided in this customs "
        "declaration is accurate and complete to the best of my knowledge."
    )

    pdf.drawString(
        20 * mm,
        y,
        declaration,
    )

    # ========================================================
    # BARCODE
    # ========================================================

    y -= 18 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "SHIPMENT BARCODE",
    )

    y -= 10 * mm

    if tracking_number:
        barcode = code128.Code128(
            tracking_number,
            barHeight=15 * mm,
            barWidth=0.32 * mm,
        )

        barcode.drawOn(
            pdf,
            20 * mm,
            y - 15 * mm,
        )

    # ========================================================
    # FOOTER
    # ========================================================

    pdf.setFont("Helvetica", 8)

    pdf.drawString(
        20 * mm,
        15 * mm,
        "Generated automatically by Dak Ghar Niryat Kendra Platform",
    )

    # ========================================================
    # SAVE
    # ========================================================

    pdf.save()

    return str(filepath)