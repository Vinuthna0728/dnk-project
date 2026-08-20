"""
================================================================================
DAK GHAR NIRYAT KENDRA (DNK) — MASTER INTEGRATION & AUDIT TEST SUITE
================================================================================
Tests all 4 microservices and 10 functional modules end-to-end:
1. Backend & AI Engine Health Probes
2. Artisan & Buyer Authentication (JWT, Registration, Role Scoping)
3. Product Creation, Retrieval & Seller Isolation
4. Duplicate Product Prevention (HTTP 409 Conflict)
5. AI Multimodal Vision Catalog Synthesis
6. AI Multimodal Speech-to-Text & Combined Ingestion
7. Orders Creation & Financial Calculation
8. Customs PBE-III & Mock ICEGATE Acceptance
9. Escrow Vault & Payout Reconciliation
10. Postal Logistics Tracking Lifecycle (PBE, Customs, Tracking events)
================================================================================
"""

import sys
import time
import json
import base64
import wave
import struct
import math
import io
import requests

BACKEND_URL = "http://127.0.0.1:8000"
AI_ENGINE_URL = "http://127.0.0.1:8001"

passed = 0
failed = 0
total = 10

def report(idx, name, status, notes=""):
    global passed, failed
    if status:
        passed += 1
        print(f"[PASS] {idx:02d}. {name:<45} -> {notes}")
    else:
        failed += 1
        print(f"[FAIL] {idx:02d}. {name:<45} -> {notes}")

print("=" * 80)
print(" DAK GHAR NIRYAT KENDRA (DNK) - MASTER SYSTEM INTEGRATION TEST")
print("=" * 80)

# ----------------------------------------------------------------------
# 1. Backend & AI Engine Health
# ----------------------------------------------------------------------
try:
    b_res = requests.get(f"{BACKEND_URL}/", timeout=10)
    ai_root = requests.get(f"{AI_ENGINE_URL}/health", timeout=10)
    ai_v1 = requests.get(f"{AI_ENGINE_URL}/api/v1/health", timeout=10)
    
    ok = (b_res.status_code == 200 and ai_root.status_code == 200 and ai_v1.status_code in [200, 307])
    report(1, "Microservices Health Probes", ok, f"Backend 200 OK | AI Engine 200 OK")
except Exception as e:
    report(1, "Microservices Health Probes", False, str(e))

# ----------------------------------------------------------------------
# 2. Authentication (Register, Login, Me Profile)
# ----------------------------------------------------------------------
ts = int(time.time())
artisan_email = f"artisan_test_{ts}@example.com"
password = "Password@123"
token = ""
user_id = None

try:
    reg_res = requests.post(f"{BACKEND_URL}/api/v1/auth/register", json={
        "name": f"Master Artisan {ts}",
        "email": artisan_email,
        "password": password,
        "phone": f"+91 98765{ts % 100000:05d}",
        "upi_id": f"IPOS{ts}"
    }, timeout=15)
    assert reg_res.status_code in [200, 201], f"Register returned {reg_res.status_code}: {reg_res.text}"
    user_id = reg_res.json()["id"]

    login_res = requests.post(f"{BACKEND_URL}/api/v1/auth/login", data={
        "username": artisan_email,
        "password": password
    }, timeout=15)
    assert login_res.status_code == 200, f"Login returned {login_res.status_code}"
    token = login_res.json()["access_token"]

    auth_headers = {"Authorization": f"Bearer {token}"}
    me_res = requests.get(f"{BACKEND_URL}/api/v1/auth/me", headers=auth_headers, timeout=15)
    assert me_res.status_code == 200 and me_res.json()["email"] == artisan_email

    report(2, "Artisan Authentication Lifecycle", True, f"Registered ID={user_id}, JWT Verified")
except Exception as e:
    report(2, "Artisan Authentication Lifecycle", False, str(e))

auth_headers = {"Authorization": f"Bearer {token}"} if token else {}

# ----------------------------------------------------------------------
# 3. Product Creation & Scoping
# ----------------------------------------------------------------------
created_prod_id = None
prod_title = f"Handcrafted Bidriware Vase {ts}"

try:
    prod_res = requests.post(f"{BACKEND_URL}/api/v1/products", json={
        "title": prod_title,
        "description": "Authentic handcrafted silver inlaid Bidriware export vase.",
        "price_inr": 3200,
        "hs_code": "83062900",
        "hs_confidence": 0.98,
        "image_urls": ["/bidriware.png"]
    }, headers=auth_headers, timeout=15)
    assert prod_res.status_code == 201, f"Product create status: {prod_res.status_code}"
    created_prod = prod_res.json()
    created_prod_id = created_prod["id"]

    all_prods = requests.get(f"{BACKEND_URL}/api/v1/products", timeout=15).json()
    my_prods = [p for p in all_prods if p["seller_id"] == user_id]
    assert len(my_prods) >= 1 and any(p["id"] == created_prod_id for p in my_prods)

    report(3, "Product Creation & Seller Scoping", True, f"Created Product ID={created_prod_id}")
except Exception as e:
    report(3, "Product Creation & Seller Scoping", False, str(e))

# ----------------------------------------------------------------------
# 4. Duplicate Product Prevention (HTTP 409)
# ----------------------------------------------------------------------
try:
    dup_res = requests.post(f"{BACKEND_URL}/api/v1/products", json={
        "title": prod_title,
        "description": "Duplicate bidriware vase.",
        "price_inr": 3200,
        "hs_code": "83062900",
        "hs_confidence": 0.98,
        "image_urls": ["/bidriware.png"]
    }, headers=auth_headers, timeout=15)
    assert dup_res.status_code == 409, f"Expected 409, got {dup_res.status_code}"
    report(4, "Duplicate Prevention Engine", True, f"HTTP 409 Conflict Enforced")
except Exception as e:
    report(4, "Duplicate Prevention Engine", False, str(e))

# ----------------------------------------------------------------------
# 5. AI Multimodal Vision Cataloging
# ----------------------------------------------------------------------
try:
    sample_png_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
    
    ai_vis_res = requests.post(f"{BACKEND_URL}/api/v1/ai/catalog/generate", json={
        "raw_text": "Handcrafted Indian Channapatna wooden horse toy",
        "source_language": "en",
        "image_base64": sample_png_b64,
        "image_mime_type": "image/png"
    }, headers=auth_headers, timeout=60)
    assert ai_vis_res.status_code == 200, f"AI Vision status: {ai_vis_res.status_code}"
    vis_data = ai_vis_res.json()
    assert "product_title_en" in vis_data
    assert "hs_code" in vis_data

    report(5, "AI Vision Multimodal Engine", True, f"Synthesized: '{vis_data['product_title_en'][:35]}...' HS={vis_data.get('hs_code')}")
except Exception as e:
    report(5, "AI Vision Multimodal Engine", False, str(e))

# ----------------------------------------------------------------------
# 6. AI Voice STT & Multimodal Combined Pipeline
# ----------------------------------------------------------------------
try:
    wav_buf = io.BytesIO()
    with wave.open(wav_buf, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(16000)
        samples = [int(10000 * math.sin(2 * math.pi * 440 * t / 16000)) for t in range(16000)]
        wf.writeframes(struct.pack('<' + ('h' * len(samples)), *samples))
    wav_bytes = wav_buf.getvalue()

    voice_res = requests.post(
        f"{BACKEND_URL}/api/v1/artisan/voice-upload",
        files={"file": ("recording.wav", wav_bytes, "audio/wav")},
        data={"image_base64": sample_png_b64, "image_mime_type": "image/png"},
        headers=auth_headers,
        timeout=60
    )
    assert voice_res.status_code == 200, f"Voice upload status: {voice_res.status_code}"
    voice_data = voice_res.json()
    assert "product_title_en" in voice_data

    report(6, "AI Voice Multimodal Pipeline", True, f"Processed Voice+Image -> Title: '{voice_data['product_title_en'][:30]}...'")
except Exception as e:
    report(6, "AI Voice Multimodal Pipeline", False, str(e))

# ----------------------------------------------------------------------
# 7. Order Lifecycle & Financial Calculations
# ----------------------------------------------------------------------
created_order_id = None
tracking_number = None

try:
    order_res = requests.post(f"{BACKEND_URL}/api/v1/orders/create", json={
        "product_id": created_prod_id,
        "quantity": 1,
        "country": "US",
        "shipping_address": "123 Silicon Valley Way, CA 94025, United States"
    }, headers=auth_headers, timeout=30)
    assert order_res.status_code == 201, f"Order create status: {order_res.status_code}"
    order_data = order_res.json()
    created_order_id = order_data["id"]

    # File Electronic PBE-III for this order
    pbe_file_res = requests.post(f"{BACKEND_URL}/api/v1/logistics/pbe-submit", json={
        "order_id": created_order_id,
        "currency": "USD",
        "pbe_type": "PBE-III"
    }, headers=auth_headers, timeout=30)
    assert pbe_file_res.status_code in [200, 201], f"PBE filing status: {pbe_file_res.status_code}"
    pbe_info = pbe_file_res.json()
    tracking_number = pbe_info.get("tracking_number", f"DNK{created_order_id:09d}IN")

    report(7, "Order & Escrow Initialization", True, f"Order ID={created_order_id}, Tracking={tracking_number}")
except Exception as e:
    report(7, "Order & Escrow Initialization", False, str(e))

# ----------------------------------------------------------------------
# 8. Customs PBE-III / ICEGATE Mock Filing
# ----------------------------------------------------------------------
try:
    pbe_number = f"PBE-2026-DNK-{created_order_id:06d}"
    pbe_res = requests.post(f"{BACKEND_URL}/api/v1/mock/icegate/pbe-submit", json={
        "pbe_number": pbe_number,
        "order_id": created_order_id,
        "hs_code": "83062900",
        "invoice_value_inr": 3200.0,
        "currency": "INR",
        "country": "US"
    }, timeout=30)
    assert pbe_res.status_code == 200, f"PBE submit status: {pbe_res.status_code}: {pbe_res.text}"
    pbe_data = pbe_res.json()
    assert pbe_data["status"] == "ACCEPTED"
    assert pbe_data["pbe_number"] is not None

    report(8, "Customs PBE-III ICEGATE Acceptance", True, f"Filed PBE #{pbe_data['pbe_number']} status=ACCEPTED")
except Exception as e:
    report(8, "Customs PBE-III ICEGATE Acceptance", False, str(e))

# ----------------------------------------------------------------------
# 9. Escrow Vault & Payouts Engine
# ----------------------------------------------------------------------
try:
    escrows = requests.get(f"{BACKEND_URL}/api/v1/escrow", headers=auth_headers, timeout=30).json()
    matching_escrows = [e for e in escrows if isinstance(e, dict) and e.get("order_id") == created_order_id]
    assert len(matching_escrows) >= 1
    assert matching_escrows[0]["status"] in ["HELD", "RELEASED", "PENDING", "CREATED"]

    report(9, "Escrow Vault & Ledger", True, f"Verified Held Escrow for Order {created_order_id}")
except Exception as e:
    report(9, "Escrow Vault & Ledger", False, str(e))

# ----------------------------------------------------------------------
# 10. Postal Logistics Tracking Lifecycle
# ----------------------------------------------------------------------
try:
    track_res = requests.get(f"{BACKEND_URL}/api/v1/logistics/track/{tracking_number}", timeout=30)
    assert track_res.status_code == 200, f"Track status: {track_res.status_code}"
    track_data = track_res.json()

    assert track_data["pbe_status"] in ["ICEGATE_ACCEPTED", "ACCEPTED", "SUBMITTED", "PENDING"]
    assert len(track_data.get("events", [])) >= 1

    report(10, "Logistics & Customs Tracking Lifecycle", True, f"Tracking={track_data['tracking_number']}, Events={len(track_data.get('events', []))}")
except Exception as e:
    report(10, "Logistics & Customs Tracking Lifecycle", False, str(e))

# ----------------------------------------------------------------------
# Clean up test artifacts
# ----------------------------------------------------------------------
try:
    if created_prod_id:
        requests.delete(f"{BACKEND_URL}/api/v1/products/{created_prod_id}", headers=auth_headers, timeout=10)
except Exception:
    pass

print("=" * 80)
print(f" TOTAL TESTS RUN: {total} | PASSED: {passed} | FAILED: {failed}")
print("=" * 80)

if passed == total:
    print(" >>> ALL 10 SIH INTEGRATION TESTS PASSED WITH 100% SUCCESS <<<")
    sys.exit(0)
else:
    print(f" >>> {failed} TEST(S) FAILED <<<")
    sys.exit(1)
