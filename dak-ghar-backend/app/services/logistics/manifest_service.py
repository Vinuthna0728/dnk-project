from datetime import datetime
from pathlib import Path
from textwrap import wrap
import json

import qrcode
from reportlab.graphics.barcode import code128
from reportlab.lib import colors
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
    font_size: float = 8,
    line_gap: float = 10,
):
    """
    Draw wrapped text and return the final Y position.
    """

    pdf.setFont(
        font_name,
        font_size,
    )

    lines = wrap(
        str(text),
        width=max_chars,
        break_long_words=False,
        break_on_hyphens=False,
    )

    for line in lines:
        pdf.drawString(
            x,
            y,
            line,
        )

        y -= line_gap

    return y


def _format_datetime(value) -> str:
    """
    Convert a datetime-like value into a readable string.
    """

    if value is None:
        return datetime.utcnow().strftime(
            "%d-%m-%Y %H:%M"
        )

    if isinstance(value, datetime):
        return value.strftime(
            "%d-%m-%Y %H:%M"
        )

    return str(value)


def _safe_value(value, fallback: str = "N/A") -> str:
    """
    Return a printable string for optional values.
    """

    if value is None:
        return fallback

    value = str(value).strip()

    if not value:
        return fallback

    return value


def generate_manifest_qr(
    manifest_code: str,
    batch_id: int,
    batch_code: str,
    tracking_numbers: list[str],
    output_dir: str = "generated_documents",
) -> str:
    """
    Generate a QR code for a postal dispatch manifest.

    The QR contains structured manifest information required
    for one-scan postal batch intake.

    Example payload:

    {
        "type": "DNK_POSTAL_MANIFEST",
        "manifest_code": "DNK-MANIFEST-2026-000001",
        "batch_id": 1,
        "batch_code": "DNK-BATCH-2026-000001",
        "tracking_numbers": [
            "DNK00000001IN"
        ]
    }

    Returns:
        Path to the generated QR image.
    """

    # ============================================================
    # VALIDATION
    # ============================================================

    if not manifest_code or not manifest_code.strip():
        raise ValueError(
            "Manifest code is required."
        )

    if batch_id is None:
        raise ValueError(
            "Batch ID is required."
        )

    if not batch_code or not batch_code.strip():
        raise ValueError(
            "Batch code is required."
        )

    if tracking_numbers is None:
        tracking_numbers = []

    manifest_code = manifest_code.strip()
    batch_code = batch_code.strip()

    # ============================================================
    # CLEAN TRACKING NUMBERS
    # ============================================================

    cleaned_tracking_numbers = []

    for tracking_number in tracking_numbers:

        if tracking_number is None:
            continue

        tracking_number = str(
            tracking_number
        ).strip()

        if tracking_number:
            cleaned_tracking_numbers.append(
                tracking_number
            )

    # ============================================================
    # QR PAYLOAD
    # ============================================================

    payload = {
        "type": "DNK_POSTAL_MANIFEST",
        "manifest_code": manifest_code,
        "batch_id": int(batch_id),
        "batch_code": batch_code,
        "tracking_numbers": cleaned_tracking_numbers,
    }

    # Compact JSON keeps the QR smaller and easier to scan.
    qr_data = json.dumps(
        payload,
        separators=(",", ":"),
    )

    # ============================================================
    # OUTPUT DIRECTORY
    # ============================================================

    output_path = Path(
        output_dir
    )

    output_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = (
        f"{manifest_code}_qr.png"
    )

    filepath = output_path / filename

    # ============================================================
    # QR CONFIGURATION
    # ============================================================

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )

    qr.add_data(
        qr_data
    )

    qr.make(
        fit=True
    )

    # ============================================================
    # GENERATE IMAGE
    # ============================================================

    image = qr.make_image(
        fill_color="black",
        back_color="white",
    )

    image.save(
        str(filepath)
    )

    return str(filepath)


def _draw_table_header(
    pdf,
    x: float,
    y: float,
    column_widths: list[float],
    headers: list[str],
    row_height: float,
):
    """
    Draw the shipment table header.
    """

    total_width = sum(column_widths)

    pdf.setFillColor(
        colors.HexColor("#E8EEF5")
    )

    pdf.rect(
        x,
        y - row_height,
        total_width,
        row_height,
        fill=1,
        stroke=1,
    )

    pdf.setFillColor(
        colors.black
    )

    current_x = x

    pdf.setFont(
        "Helvetica-Bold",
        8,
    )

    for index, header in enumerate(headers):

        column_width = column_widths[index]

        pdf.drawCentredString(
            current_x + (column_width / 2),
            y - (row_height / 2) - 3,
            header,
        )

        if index < len(headers) - 1:
            pdf.line(
                current_x + column_width,
                y,
                current_x + column_width,
                y - row_height,
            )

        current_x += column_width


def _draw_shipment_row(
    pdf,
    x: float,
    y: float,
    column_widths: list[float],
    values: list[str],
    row_height: float,
):
    """
    Draw one shipment row.
    """

    total_width = sum(column_widths)

    pdf.rect(
        x,
        y - row_height,
        total_width,
        row_height,
        fill=0,
        stroke=1,
    )

    current_x = x

    pdf.setFont(
        "Helvetica",
        7.5,
    )

    for index, value in enumerate(values):

        column_width = column_widths[index]

        printable_value = _safe_value(
            value
        )

        pdf.drawCentredString(
            current_x + (column_width / 2),
            y - (row_height / 2) - 2.5,
            printable_value[:32],
        )

        if index < len(values) - 1:
            pdf.line(
                current_x + column_width,
                y,
                current_x + column_width,
                y - row_height,
            )

        current_x += column_width


def generate_manifest_pdf(
    manifest_code: str,
    batch_code: str,
    dnk_center: str | None,
    created_at,
    shipment_count: int,
    shipments: list[dict],
    status: str = "CREATED",
    output_dir: str = "generated_documents",
) -> str:
    """
    Generate a consolidated postal dispatch manifest PDF.

    The function is intentionally independent of FastAPI and
    database logic so it can be reused by API endpoints.

    Parameters:
        manifest_code:
            Unique manifest identifier.

        batch_code:
            Batch associated with the manifest.

        dnk_center:
            DNK / Sub-PO facility handling the dispatch.

        created_at:
            Manifest creation timestamp.

        shipment_count:
            Number of shipments in the manifest.

        shipments:
            List of shipment dictionaries. Expected keys:
                order_id
                tracking_number
                destination
                weight
                status

        status:
            Current manifest status.

        output_dir:
            Directory where the PDF will be stored.

    Returns:
        Path to the generated PDF.
    """

    # ============================================================
    # VALIDATION
    # ============================================================

    if not manifest_code or not manifest_code.strip():
        raise ValueError(
            "Manifest code is required."
        )

    if not batch_code or not batch_code.strip():
        raise ValueError(
            "Batch code is required."
        )

    if shipment_count < 0:
        raise ValueError(
            "Shipment count cannot be negative."
        )

    if shipments is None:
        shipments = []

    # ============================================================
    # OUTPUT DIRECTORY
    # ============================================================

    output_path = Path(
        output_dir
    )

    output_path.mkdir(
        parents=True,
        exist_ok=True,
    )

    filename = (
        f"{manifest_code}_manifest.pdf"
    )

    filepath = output_path / filename

    # ============================================================
    # PDF PAGE
    # ============================================================

    pdf = canvas.Canvas(
        str(filepath),
        pagesize=A4,
    )

    page_width, page_height = A4

    margin = 14 * mm

    left = margin
    right = page_width - margin

    content_width = right - left

    # ============================================================
    # OUTER BORDER
    # ============================================================

    pdf.setLineWidth(1.2)

    pdf.rect(
        margin,
        margin,
        content_width,
        page_height - (2 * margin),
    )

    # ============================================================
    # HEADER
    # ============================================================

    header_top = page_height - margin

    pdf.setFont(
        "Helvetica-Bold",
        18,
    )

    pdf.drawString(
        left + 6 * mm,
        header_top - 10 * mm,
        "DAK GHAR NIRYAT KENDRA",
    )

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        left + 6 * mm,
        header_top - 17 * mm,
        "POSTAL EXPORT LOGISTICS",
    )

    pdf.setFont(
        "Helvetica-Bold",
        13,
    )

    pdf.drawRightString(
        right - 6 * mm,
        header_top - 10 * mm,
        "POSTAL DISPATCH",
    )

    pdf.setFont(
        "Helvetica-Bold",
        11,
    )

    pdf.drawRightString(
        right - 6 * mm,
        header_top - 17 * mm,
        "MANIFEST",
    )

    header_bottom = header_top - 25 * mm

    pdf.setLineWidth(0.8)

    pdf.line(
        left,
        header_bottom,
        right,
        header_bottom,
    )

    # ============================================================
    # MANIFEST INFORMATION
    # ============================================================

    y = header_bottom - 9 * mm

    info_left = left + 6 * mm
    info_right = left + 105 * mm

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_left,
        y,
        "MANIFEST CODE",
    )

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        info_left + 35 * mm,
        y,
        manifest_code,
    )

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_right,
        y,
        "BATCH CODE",
    )

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        info_right + 28 * mm,
        y,
        batch_code,
    )

    y -= 7 * mm

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_left,
        y,
        "DNK CENTER",
    )

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        info_left + 35 * mm,
        y,
        _safe_value(dnk_center),
    )

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_right,
        y,
        "CREATED",
    )

    pdf.setFont(
        "Helvetica",
        9,
    )

    pdf.drawString(
        info_right + 28 * mm,
        y,
        _format_datetime(created_at),
    )

    y -= 7 * mm

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_left,
        y,
        "SHIPMENT COUNT",
    )

    pdf.setFont(
        "Helvetica-Bold",
        10,
    )

    pdf.drawString(
        info_left + 35 * mm,
        y,
        str(shipment_count),
    )

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_right,
        y,
        "MANIFEST STATUS",
    )

    pdf.setFont(
        "Helvetica-Bold",
        9,
    )

    pdf.drawString(
        info_right + 28 * mm,
        y,
        _safe_value(status),
    )

    # ============================================================
    # SECTION SEPARATOR
    # ============================================================

    y -= 10 * mm

    pdf.line(
        left,
        y,
        right,
        y,
    )

    # ============================================================
    # SHIPMENT TABLE TITLE
    # ============================================================

    y -= 8 * mm

    pdf.setFont(
        "Helvetica-Bold",
        12,
    )

    pdf.drawString(
        left + 6 * mm,
        y,
        "SHIPMENT DETAILS",
    )

    y -= 7 * mm

    # ============================================================
    # TABLE CONFIGURATION
    # ============================================================

    table_x = left + 4 * mm

    column_widths = [
        22 * mm,
        48 * mm,
        40 * mm,
        25 * mm,
        32 * mm,
    ]

    headers = [
        "ORDER ID",
        "TRACKING NUMBER",
        "DESTINATION",
        "WEIGHT",
        "DISPATCH STATUS",
    ]

    row_height = 10 * mm

    _draw_table_header(
        pdf,
        table_x,
        y,
        column_widths,
        headers,
        row_height,
    )

    y -= row_height

    # ============================================================
    # SHIPMENT ROWS
    # ============================================================

    for shipment in shipments:

        if y < 55 * mm:

            pdf.setFont(
                "Helvetica",
                7,
            )

            pdf.drawRightString(
                right - 4 * mm,
                margin + 3 * mm,
                "Continued on next page",
            )

            pdf.showPage()

            pdf.setLineWidth(1.2)

            pdf.rect(
                margin,
                margin,
                content_width,
                page_height - (2 * margin),
            )

            y = page_height - margin - 15 * mm

            pdf.setFont(
                "Helvetica-Bold",
                12,
            )

            pdf.drawString(
                left + 6 * mm,
                y,
                f"MANIFEST {manifest_code} - SHIPMENT DETAILS",
            )

            y -= 8 * mm

            _draw_table_header(
                pdf,
                table_x,
                y,
                column_widths,
                headers,
                row_height,
            )

            y -= row_height

        order_id = shipment.get(
            "order_id"
        )

        tracking_number = shipment.get(
            "tracking_number"
        )

        destination = shipment.get(
            "destination"
        )

        weight = shipment.get(
            "weight",
            "N/A",
        )

        shipment_status = shipment.get(
            "status"
        )

        values = [
            f"ORD-{int(order_id):06d}"
            if order_id is not None
            else "N/A",
            _safe_value(tracking_number),
            _safe_value(destination),
            _safe_value(weight),
            _safe_value(shipment_status),
        ]

        _draw_shipment_row(
            pdf,
            table_x,
            y,
            column_widths,
            values,
            row_height,
        )

        y -= row_height

    # ============================================================
    # BARCODE SECTION
    # ============================================================

    y -= 12 * mm

    if y < 75 * mm:

        pdf.showPage()

        pdf.setLineWidth(1.2)

        pdf.rect(
            margin,
            margin,
            content_width,
            page_height - (2 * margin),
        )

        y = page_height - margin - 18 * mm

    pdf.setFont(
        "Helvetica-Bold",
        11,
    )

    pdf.drawString(
        left + 6 * mm,
        y,
        "MANIFEST BARCODE",
    )

    y -= 7 * mm

    barcode = code128.Code128(
        manifest_code,
        barHeight=15 * mm,
        barWidth=0.45 * mm,
    )

    barcode_width = barcode.width

    barcode_x = (
        page_width - barcode_width
    ) / 2

    barcode.drawOn(
        pdf,
        barcode_x,
        y - 15 * mm,
    )

    pdf.setFont(
        "Helvetica-Bold",
        10,
    )

    pdf.drawCentredString(
        page_width / 2,
        y - 21 * mm,
        manifest_code,
    )

    # ============================================================
    # HANDOVER SECTION
    # ============================================================

    handover_y = y - 38 * mm

    pdf.setLineWidth(0.8)

    pdf.line(
        left + 6 * mm,
        handover_y,
        right - 6 * mm,
        handover_y,
    )

    handover_y -= 9 * mm

    pdf.setFont(
        "Helvetica-Bold",
        10,
    )

    pdf.drawString(
        left + 6 * mm,
        handover_y,
        "POSTAL / DNK HANDOVER",
    )

    handover_y -= 8 * mm

    pdf.setFont(
        "Helvetica",
        8.5,
    )

    handover_text = (
        "This manifest consolidates the shipments listed above "
        "for dispatch through the designated DNK/Sub-PO facility."
    )

    handover_y = _draw_wrapped_text(
        pdf,
        handover_text,
        left + 6 * mm,
        handover_y,
        max_chars=105,
        font_size=8.5,
        line_gap=11,
    )

    # ============================================================
    # SIGNATURE BLOCK
    # ============================================================

    signature_y = handover_y - 14 * mm

    pdf.setFont(
        "Helvetica",
        8,
    )

    pdf.drawString(
        left + 6 * mm,
        signature_y,
        "Artisan / Sender Signature",
    )

    pdf.drawString(
        left + 88 * mm,
        signature_y,
        "Postal / DNK Officer",
    )

    pdf.line(
        left + 6 * mm,
        signature_y - 12 * mm,
        left + 70 * mm,
        signature_y - 12 * mm,
    )

    pdf.line(
        left + 88 * mm,
        signature_y - 12 * mm,
        right - 6 * mm,
        signature_y - 12 * mm,
    )

    # ============================================================
    # FOOTER
    # ============================================================

    footer_y = margin + 6 * mm

    pdf.setFont(
        "Helvetica",
        7.5,
    )

    pdf.drawCentredString(
        page_width / 2,
        footer_y,
        "Generated automatically by Dak Ghar Niryat Kendra",
    )

    pdf.setFont(
        "Helvetica",
        7,
    )

    pdf.drawCentredString(
        page_width / 2,
        footer_y + 4 * mm,
        "Postal Export Logistics - DNK Dispatch Manifest",
    )

    # ============================================================
    # PAGE NUMBER
    # ============================================================

    pdf.setFont(
        "Helvetica",
        7,
    )

    pdf.drawRightString(
        right - 4 * mm,
        footer_y,
        "Page 1+",
    )

    # ============================================================
    # SAVE
    # ============================================================

    pdf.save()

    return str(filepath)