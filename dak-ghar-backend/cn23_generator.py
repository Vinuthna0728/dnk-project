from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.graphics.barcode import code128


# ============================================================
# CN23 PDF GENERATOR
# ============================================================

def generate_cn23_pdf(
    pbe_number: str,
    order_id: int,
    seller_name: str,
    buyer_name: str,
    country: str,
    hs_code: str,
    invoice_value_inr: float,
    currency: str,
    tracking_number: str,
):
    """
    Generate a printable CN23-style customs declaration PDF.
    """

    # --------------------------------------------------------
    # 1. Create output directory
    # --------------------------------------------------------

    output_dir = Path("generated_documents")
    output_dir.mkdir(exist_ok=True)

    filename = f"{pbe_number}_CN23.pdf"
    filepath = output_dir / filename

    # --------------------------------------------------------
    # 2. Create PDF
    # --------------------------------------------------------

    pdf = canvas.Canvas(
        str(filepath),
        pagesize=A4
    )

    width, height = A4

    # --------------------------------------------------------
    # 3. Title
    # --------------------------------------------------------

    pdf.setFont("Helvetica-Bold", 18)

    pdf.drawString(
        20 * mm,
        height - 25 * mm,
        "CN23 CUSTOMS DECLARATION"
    )

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        height - 32 * mm,
        "Dak Ghar Niryat Kendra - Postal Bill of Export"
    )

    # --------------------------------------------------------
    # 4. PBE information
    # --------------------------------------------------------

    y = height - 50 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(20 * mm, y, "PBE INFORMATION")

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        y,
        f"PBE Number: {pbe_number}"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Order ID: {order_id}"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Destination Country: {country}"
    )

    # --------------------------------------------------------
    # 5. Seller / Buyer
    # --------------------------------------------------------

    y -= 12 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        20 * mm,
        y,
        "PARTIES"
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        y,
        f"Seller: {seller_name}"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Buyer: {buyer_name}"
    )

    # --------------------------------------------------------
    # 6. Shipment information
    # --------------------------------------------------------

    y -= 12 * mm

    pdf.setFont("Helvetica-Bold", 11)

    pdf.drawString(
        20 * mm,
        y,
        "SHIPMENT DETAILS"
    )

    y -= 8 * mm

    pdf.setFont("Helvetica", 10)

    pdf.drawString(
        20 * mm,
        y,
        f"HS Code: {hs_code}"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Invoice Value: {invoice_value_inr:.2f} INR"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Declared Currency: {currency}"
    )

    y -= 6 * mm

    pdf.drawString(
        20 * mm,
        y,
        f"Tracking Number: {tracking_number}"
    )

    # --------------------------------------------------------
    # 7. Barcode
    # --------------------------------------------------------

    y -= 20 * mm

    pdf.setFont("Helvetica-Bold", 11)

    pdf.drawString(
        20 * mm,
        y,
        "TRACKING BARCODE"
    )

    y -= 12 * mm

    barcode = code128.Code128(
        tracking_number,
        barHeight=18 * mm,
        barWidth=0.35 * mm
    )

    barcode.drawOn(
        pdf,
        20 * mm,
        y - 18 * mm
    )

    # --------------------------------------------------------
    # 8. Footer
    # --------------------------------------------------------

    pdf.setFont("Helvetica", 8)

    pdf.drawString(
        20 * mm,
        15 * mm,
        "Generated automatically by Dak Ghar Niryat Kendra Platform"
    )

    # --------------------------------------------------------
    # 9. Save
    # --------------------------------------------------------

    pdf.save()

    return str(filepath)