from pathlib import Path

from reportlab.graphics.barcode import code128
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm


def generate_barcode(
    tracking_number: str,
    output_dir: str = "generated_documents",
) -> str:
    """
    Generate a printable Code 128 barcode PDF for a shipment tracking number.

    Args:
        tracking_number: Unique shipment tracking number.
        output_dir: Directory where the barcode PDF will be stored.

    Returns:
        Path to the generated barcode PDF.
    """

    if not tracking_number or not tracking_number.strip():
        raise ValueError("Tracking number is required.")

    tracking_number = tracking_number.strip()

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    filename = f"{tracking_number}_barcode.pdf"
    filepath = output_path / filename

    pdf = canvas.Canvas(
        str(filepath),
        pagesize=A4,
    )

    width, height = A4

    pdf.setFont("Helvetica-Bold", 14)
    pdf.drawString(
        20 * mm,
        height - 25 * mm,
        "DNK SHIPMENT BARCODE",
    )

    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        20 * mm,
        height - 34 * mm,
        f"Tracking Number: {tracking_number}",
    )

    barcode = code128.Code128(
        tracking_number,
        barHeight=18 * mm,
        barWidth=0.35 * mm,
    )

    barcode.drawOn(
        pdf,
        20 * mm,
        height - 70 * mm,
    )

    pdf.setFont("Helvetica", 8)
    pdf.drawString(
        20 * mm,
        15 * mm,
        "Generated automatically by Dak Ghar Niryat Kendra Platform",
    )

    pdf.save()

    return str(filepath)