from pathlib import Path
from textwrap import wrap

from reportlab.graphics.barcode import code128
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def _draw_wrapped_text(
    pdf,
    text: str,
    x: float,
    y: float,
    max_chars: int,
    font_name: str = "Helvetica",
    font_size: float = 10,
    line_gap: float = 14,
):
    """
    Draw wrapped text and return the final Y position.
    """
    pdf.setFont(font_name, font_size)

    lines = wrap(
        str(text),
        width=max_chars,
        break_long_words=False,
        break_on_hyphens=False,
    )

    for line in lines:
        pdf.drawString(x, y, line)
        y -= line_gap

    return y


def generate_domestic_shipping_label(
    tracking_number: str,
    order_id: int,
    consignee_name: str,
    consignee_address: str,
    destination_pin: str,
    sender_name: str,
    sender_address: str,
    weight_kg: float,
    output_dir: str = "generated_documents",
) -> str:
    """
    Generate a structured India Post / DNK international
    export shipping label.

    Returns:
        Path to the generated PDF.
    """

    # ------------------------------------------------------------
    # VALIDATION
    # ------------------------------------------------------------

    if not tracking_number or not tracking_number.strip():
        raise ValueError("Tracking number is required.")

    if not consignee_name or not consignee_name.strip():
        raise ValueError("Consignee name is required.")

    if not consignee_address or not consignee_address.strip():
        raise ValueError("Consignee address is required.")

    if not destination_pin or not destination_pin.strip():
        raise ValueError("Destination PIN is required.")

    if not sender_name or not sender_name.strip():
        raise ValueError("Sender name is required.")

    if not sender_address or not sender_address.strip():
        raise ValueError("Sender address is required.")

    if weight_kg <= 0:
        raise ValueError("Weight must be greater than zero.")

    tracking_number = tracking_number.strip()
    destination_pin = destination_pin.strip()

    # ------------------------------------------------------------
    # OUTPUT FILE
    # ------------------------------------------------------------

    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    filename = f"{tracking_number}_shipping_label.pdf"
    filepath = output_path / filename

    # ------------------------------------------------------------
    # PAGE
    # ------------------------------------------------------------

    pdf = canvas.Canvas(
        str(filepath),
        pagesize=A4,
    )

    page_width, page_height = A4

    margin = 14 * mm

    # Keep the outer border exactly where it was.
    left = margin
    right = page_width - margin

    # Internal text padding.
    # This moves left-aligned text away from the border
    # without changing the actual section borders.
    text_left = left + 5 * mm

    content_width = right - left

    # ------------------------------------------------------------
    # OUTER BORDER
    # ------------------------------------------------------------

    pdf.setLineWidth(1.2)
    pdf.rect(
        margin,
        margin,
        content_width,
        page_height - (2 * margin),
    )

    # ------------------------------------------------------------
    # HEADER
    # ------------------------------------------------------------

    header_top = page_height - margin
    header_height = 30 * mm
    header_bottom = header_top - header_height

    pdf.setLineWidth(1)
    pdf.line(
        left,
        header_bottom,
        right,
        header_bottom,
    )

    # Main DNK title
    pdf.setFont("Helvetica-Bold", 17)
    pdf.drawString(
        text_left,
        header_top - 11 * mm,
        "DAK GHAR NIRYAT KENDRA",
    )

    # Subtitle
    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        text_left,
        header_top - 18 * mm,
        "EXPORT SHIPPING LABEL",
    )

    # INDIA POST block on the right
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawRightString(
        right - 6 * mm,
        header_top - 10 * mm,
        "INDIA POST",
    )

    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(
        right - 6 * mm,
        header_top - 16 * mm,
        "INTERNATIONAL PARCEL",
    )

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawRightString(
        right - 6 * mm,
        header_top - 22 * mm,
        "POSTAL EXPORT",
    )

    # ------------------------------------------------------------
    # SERVICE / ROUTING INFORMATION
    # ------------------------------------------------------------

    y = header_bottom - 8 * mm

    # SERVICE
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        text_left,
        y,
        "SERVICE",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        text_left + 28 * mm,
        y,
        "INTERNATIONAL PARCEL",
    )

    # ROUTING
    # Give routing its own fixed area so it never collides
    # with the destination PIN.
    routing_label_x = left + 104 * mm
    routing_value_x = left + 124 * mm

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        routing_label_x,
        y,
        "ROUTING",
    )

    pdf.setFont("Helvetica", 8)
    pdf.drawString(
        routing_value_x,
        y,
        "DNK-KA-BEL-01",
    )

    # Destination PIN remains on the far right.
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawRightString(
        right - 2 * mm,
        y,
        f"PIN: {destination_pin}",
    )

    # Separator
    y -= 8 * mm

    pdf.setLineWidth(0.8)
    pdf.line(left, y, right, y)

    # ------------------------------------------------------------
    # TO / CONSIGNEE
    # ------------------------------------------------------------

    y -= 10 * mm

    pdf.setFont("Helvetica-Bold", 13)
    pdf.drawString(
        text_left,
        y,
        "TO / CONSIGNEE",
    )

    y -= 9 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        text_left,
        y,
        consignee_name,
    )

    y -= 7 * mm

    y = _draw_wrapped_text(
        pdf,
        consignee_address,
        text_left,
        y,
        max_chars=65,
        font_name="Helvetica",
        font_size=9.5,
        line_gap=13,
    )

    # Destination PIN
    y -= 4 * mm

    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        text_left,
        y,
        "DESTINATION PIN",
    )

    pdf.setFont("Helvetica-Bold", 22)
    pdf.drawString(
        text_left + 42 * mm,
        y - 2 * mm,
        destination_pin,
    )

    # ------------------------------------------------------------
    # SEPARATOR
    # ------------------------------------------------------------

    y -= 15 * mm

    pdf.setLineWidth(0.8)
    pdf.line(left, y, right, y)

    # ------------------------------------------------------------
    # FROM / ARTISAN RETURN ADDRESS
    # ------------------------------------------------------------

    y -= 10 * mm

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        text_left,
        y,
        "FROM / ARTISAN RETURN ADDRESS",
    )

    y -= 8 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawString(
        text_left,
        y,
        sender_name,
    )

    y -= 7 * mm

    y = _draw_wrapped_text(
        pdf,
        sender_address,
        text_left,
        y,
        max_chars=65,
        font_name="Helvetica",
        font_size=9.5,
        line_gap=13,
    )

    # ------------------------------------------------------------
    # ORDER / WEIGHT / PAYMENT BOX
    # ------------------------------------------------------------

    y -= 7 * mm

    box_height = 20 * mm
    box_bottom = y - box_height

    pdf.setLineWidth(0.8)
    pdf.rect(
        left,
        box_bottom,
        content_width,
        box_height,
    )

    # Move column text slightly right from box border.
    col1 = left + 5 * mm
    col2 = left + 67 * mm
    col3 = left + 132 * mm

    label_y = y - 7 * mm
    value_y = y - 14 * mm

    # ORDER
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        col1,
        label_y,
        "ORDER ID",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        col1,
        value_y,
        f"ORD-{int(order_id):06d}",
    )

    # WEIGHT
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        col2,
        label_y,
        "WEIGHT",
    )

    pdf.setFont("Helvetica", 9)
    pdf.drawString(
        col2,
        value_y,
        f"{float(weight_kg):.2f} KG",
    )

    # PAYMENT
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawString(
        col3,
        label_y,
        "PAYMENT",
    )

    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawString(
        col3,
        value_y,
        "PREPAID",
    )

    # ------------------------------------------------------------
    # BARCODE SECTION
    # ------------------------------------------------------------

    barcode_y = box_bottom - 48 * mm

    pdf.setFont("Helvetica-Bold", 10)
    pdf.drawCentredString(
        page_width / 2,
        barcode_y + 30 * mm,
        "SHIPMENT TRACKING BARCODE",
    )

    barcode = code128.Code128(
        tracking_number,
        barHeight=23 * mm,
        barWidth=0.42 * mm,
    )

    barcode_width = barcode.width

    barcode_x = (page_width - barcode_width) / 2

    barcode.drawOn(
        pdf,
        barcode_x,
        barcode_y,
    )

    # Tracking number under barcode
    pdf.setFont("Helvetica-Bold", 11)
    pdf.drawCentredString(
        page_width / 2,
        barcode_y - 7 * mm,
        tracking_number,
    )

    # ------------------------------------------------------------
    # FOOTER
    # ------------------------------------------------------------

    footer_y = margin + 6 * mm

    pdf.setFont("Helvetica", 7.5)
    pdf.drawCentredString(
        page_width / 2,
        footer_y,
        "Generated automatically by Dak Ghar Niryat Kendra",
    )

    pdf.setFont("Helvetica", 7)
    pdf.drawCentredString(
        page_width / 2,
        footer_y + 4 * mm,
        "Postal Export Logistics • DNK Belagavi",
    )

    # ------------------------------------------------------------
    # SAVE
    # ------------------------------------------------------------

    pdf.save()

    return str(filepath)