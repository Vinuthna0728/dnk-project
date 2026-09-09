import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

logger = logging.getLogger(__name__)

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")


def send_otp_email(recipient_email: str, otp_code: str) -> bool:
    """
    Sends a 6-digit OTP to the recipient Gmail address using standard SMTP.
    If SMTP credentials are not configured in .env, falls back to logging
    the OTP to console so development and testing can proceed uninterrupted.
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("\n" + "=" * 60)
        print(f"[DNK DEV OTP CONSOLE] Recipient: {recipient_email}")
        print(f"[DNK DEV OTP CONSOLE] OTP Code:  {otp_code}")
        print("=" * 60 + "\n")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"{otp_code} is your Dak Ghar Niryat Kendra Verification Code"
    msg["From"] = f"Dak Ghar Niryat Kendra <{SMTP_USER}>"
    msg["To"] = recipient_email

    text_content = (
        f"Your login verification code for Dak Ghar Niryat Kendra is: {otp_code}\n"
        f"This code will expire in 5 minutes.\n"
        f"If you did not request this, please ignore this email."
    )

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px; border: 1px solid #e2e8f0;">
            <div style="border-bottom: 2px solid #b91c1c; padding-bottom: 12px; margin-bottom: 20px;">
                <h2 style="color: #b91c1c; margin: 0; font-size: 22px;">Dak Ghar Niryat Kendra</h2>
                <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Government of India Export Facilitation</p>
            </div>
            <p style="color: #334155; font-size: 15px; margin-top: 0;">Use the following One-Time Password (OTP) to access your artisan account:</p>
            <div style="text-align: center; margin: 28px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a; background: #f1f5f9; padding: 14px 28px; border-radius: 6px; border: 1px dashed #cbd5e1;">
                    {otp_code}
                </span>
            </div>
            <p style="color: #64748b; font-size: 13px; margin-bottom: 4px;">This code is valid for <strong>5 minutes</strong>.</p>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 0;">If you did not attempt to log in, please ignore this message.</p>
        </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Error delivering email to {recipient_email}: {e}")
        return False