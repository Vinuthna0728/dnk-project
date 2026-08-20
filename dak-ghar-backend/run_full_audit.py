import os, sys, json, requests, jwt
from datetime import datetime, timezone
from sqlalchemy import create_engine, inspect, text
from dotenv import load_dotenv

load_dotenv(r'D:\dnk-project\dak-ghar-backend\.env')
db_url = os.getenv('DATABASE_URL')
secret_key = os.getenv('SECRET_KEY')

engine = create_engine(db_url)
inspector = inspect(engine)

print('=' * 80)
print('          DAK GHAR BACKEND COMPREHENSIVE FUNCTIONAL AUDIT')
print('=' * 80)

# ============================================================
# PHASE 3: DATABASE SCHEMA AUDIT
# ============================================================
print('\n[PHASE 3] DATABASE SCHEMA AUDIT')
tables = inspector.get_table_names()
print(f'Database Tables Found ({len(tables)}): {tables}')

expected_tables = ['users', 'products', 'orders', 'escrows', 'payouts', 'compliance_checks', 'pbe_filings', 'shipping_events']
for t in expected_tables:
    if t in tables:
        cols = [c['name'] for c in inspector.get_columns(t)]
        fks = [fk['referred_table'] + '.' + ','.join(fk['referred_columns']) for fk in inspector.get_foreign_keys(t)]
        print(f'  [OK] Table [{t:<18}] -> Columns: {len(cols):2d}, FKs: {fks}')
    else:
        print(f'  [MISSING] Table [{t:<18}]')

# ============================================================
# PHASE 5 & 6: AUTH & ROLE AUDIT
# ============================================================
print('\n[PHASE 5 & 6] AUTHENTICATION & ROLE AUDIT')

test_ts = int(datetime.now(timezone.utc).timestamp())
reg_email = f'audit_user_{test_ts}@example.com'
reg_payload = {
    'name': f'Audit User {test_ts}',
    'email': reg_email,
    'password': 'Password@123',
    'phone': '+91-9876543210',
    'upi_id': f'audit_{test_ts}@okhdfc'
}

reg_res = requests.post('http://127.0.0.1:8000/api/v1/auth/register', json=reg_payload)
print(f'  Registration API Status: {reg_res.status_code}')
reg_data = reg_res.json()
role_val = reg_data.get('role')
user_id_val = reg_data.get('id')
print(f'  Registered User Role returned: {role_val} (ID: {user_id_val})')

# Verify in DB directly
with engine.connect() as conn:
    row = conn.execute(text('SELECT id, name, email, password_hash, role, upi_id FROM users WHERE id = :id'), {'id': user_id_val}).fetchone()
    is_hashed = row[3].startswith('$argon2') or row[3].startswith('$2b$') or len(row[3]) > 40
    print(f'  DB Verification -> ID: {row[0]}, Role: {row[4]}, Password Hashed: {is_hashed}')
    assert row[3] != 'Password@123', 'CRITICAL SECURITY: Plaintext password stored!'

# Duplicate registration rejection
dup_res = requests.post('http://127.0.0.1:8000/api/v1/auth/register', json=reg_payload)
print(f'  Duplicate Registration Rejection: HTTP {dup_res.status_code} (Expected 400)')

# Login test
login_res = requests.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username': reg_email, 'password': 'Password@123'})
print(f'  Valid Login Status: HTTP {login_res.status_code}')
token = login_res.json()['access_token']
decoded = jwt.decode(token, secret_key, algorithms=['HS256'])
print(f'  Decoded JWT: sub={decoded.get("sub")}, email={decoded.get("email")}, role={decoded.get("role")}')

# Invalid login
invalid_res = requests.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username': reg_email, 'password': 'WrongPassword!'})
print(f'  Invalid Password Rejection: HTTP {invalid_res.status_code} (Expected 401)')

# ============================================================
# PHASE 7: PRODUCT CATALOG AUDIT
# ============================================================
print('\n[PHASE 7] PRODUCT CATALOG AUDIT')
prod_headers = {'Authorization': f'Bearer {token}'}
prod_payload = {
    'title': f'Audit Handcrafted Silk Scarf {test_ts}',
    'description': 'Handwoven Mulberry Silk Scarf from Karnataka cluster',
    'price_inr': 3500.0,
    'hs_code': '50072010',
    'hs_confidence': 0.89,
    'image_urls': ['https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800']
}
prod_res = requests.post('http://127.0.0.1:8000/api/v1/products', json=prod_payload, headers=prod_headers)
print(f'  Create Product Status: HTTP {prod_res.status_code}')
prod_data = prod_res.json()
created_prod_id = prod_data.get('id')

# Verify in DB
with engine.connect() as conn:
    p_row = conn.execute(text('SELECT id, seller_id, title, price_inr, hs_code FROM products WHERE id = :id'), {'id': created_prod_id}).fetchone()
    print(f'  DB Product -> ID: {p_row[0]}, Seller ID: {p_row[1]}, Title: {p_row[2]}, Price: {p_row[3]}, HS: {p_row[4]}')

# Get Product
get_p_res = requests.get(f'http://127.0.0.1:8000/api/v1/products/{created_prod_id}')
print(f'  GET /products/{created_prod_id} -> HTTP {get_p_res.status_code}, Title: {get_p_res.json().get("title")}')

# Update Product
up_res = requests.put(f'http://127.0.0.1:8000/api/v1/products/{created_prod_id}', json={'price_inr': 3800.0}, headers=prod_headers)
print(f'  PUT /products/{created_prod_id} -> HTTP {up_res.status_code}, Updated Price: {up_res.json().get("price_inr")}')

# ============================================================
# PHASE 8 & 9: ORDER CREATION & AUDIT CASE (ORDER 53 & NEW)
# ============================================================
print('\n[PHASE 8 & 9] ORDER CREATION & PERSISTENCE AUDIT')

# Audit Order #53 in database
with engine.connect() as conn:
    row_53 = conn.execute(text('SELECT id, buyer_id, product_id, amount_inr, status, checkout_url, stripe_session_id, escrow_id FROM orders WHERE id = 53')).fetchone()
    if row_53:
        print('  Order #53 in PostgreSQL:')
        print(f'    - ID: {row_53[0]}, Buyer ID: {row_53[1]}, Product ID: {row_53[2]}, Amount: {row_53[3]}, Status: {row_53[4]}')
        print(f'    - checkout_url:      {row_53[5][:50] if row_53[5] else None}...')
        print(f'    - stripe_session_id: {row_53[6]}')
        print(f'    - escrow_id:         {row_53[7]}')
    else:
        print('  Order #53 not in DB.')

# Create a fresh Buyer user and order
buyer_email = 'buyer@dakghar.local'
buyer_login = requests.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username': buyer_email, 'password': 'DakGhar@123'})
b_token = buyer_login.json()['access_token']
b_headers = {'Authorization': f'Bearer {b_token}'}

order_payload = {
    'product_id': created_prod_id,
    'quantity': 2,
    'shipping_address': '456 Market St, San Francisco, CA 94105',
    'country': 'United States'
}
ord_res = requests.post('http://127.0.0.1:8000/api/v1/orders/create', json=order_payload, headers=b_headers)
print(f'  Create Order Status: HTTP {ord_res.status_code}')
ord_data = ord_res.json()
audit_order_id = ord_data['id']
chk_url = ord_data.get('checkout_url')
chk_preview = chk_url[:50] + '...' if chk_url else 'None'
print(f'  Created Order ID: {audit_order_id}')
print(f'    - checkout_url:      {chk_preview}')
print(f'    - stripe_session_id: {ord_data.get("stripe_session_id")}')
print(f'    - escrow_id:         {ord_data.get("escrow_id")}')

# Direct DB verification
with engine.connect() as conn:
    db_ord = conn.execute(text('SELECT id, buyer_id, product_id, amount_inr, status, checkout_url, stripe_session_id, escrow_id FROM orders WHERE id = :id'), {'id': audit_order_id}).fetchone()
    db_chk = db_ord[5][:50] + '...' if db_ord[5] else 'None'
    print(f'  Direct PostgreSQL Verification for Order #{audit_order_id}:')
    print(f'    - DB checkout_url:      {db_chk}')
    print(f'    - DB stripe_session_id: {db_ord[6]}')
    print(f'    - DB escrow_id:         {db_ord[7]}')
    assert db_ord[5] is not None, 'checkout_url NOT stored in DB!'
    assert db_ord[6] is not None, 'stripe_session_id NOT stored in DB!'
    assert db_ord[7] is not None, 'escrow_id NOT stored in DB!'

# ============================================================
# PHASE 10 & 11: GET ORDERS & OBJECT-LEVEL AUTHORIZATION
# ============================================================
print('\n[PHASE 10 & 11] GET ORDERS & OBJECT-LEVEL AUTHORIZATION AUDIT')
get_my_res = requests.get('http://127.0.0.1:8000/api/v1/orders', headers=b_headers)
my_orders = get_my_res.json()
print(f'  GET /orders for Buyer -> Returned {len(my_orders)} orders')
matching = [o for o in my_orders if o['id'] == audit_order_id]
assert len(matching) > 0, 'Created order not returned in GET /orders!'
print(f'  GET /orders contains Order #{audit_order_id} with checkout_url: {matching[0].get("checkout_url") is not None}')

# Single order GET as buyer
single_res = requests.get(f'http://127.0.0.1:8000/api/v1/orders/{audit_order_id}', headers=b_headers)
print(f'  GET /orders/{audit_order_id} as Buyer -> HTTP {single_res.status_code}')

# Object-level authorization test: Another user trying to access this order
other_user_email = f'intruder_{test_ts}@example.com'
requests.post('http://127.0.0.1:8000/api/v1/auth/register', json={
    'name': 'Intruder User',
    'email': other_user_email,
    'password': 'Password@123'
})
intruder_login = requests.post('http://127.0.0.1:8000/api/v1/auth/login', data={'username': other_user_email, 'password': 'Password@123'})
intruder_headers = {'Authorization': f'Bearer {intruder_login.json()["access_token"]}'}

unauth_res = requests.get(f'http://127.0.0.1:8000/api/v1/orders/{audit_order_id}', headers=intruder_headers)
print(f'  Unauthorized GET /orders/{audit_order_id} by another user -> HTTP {unauth_res.status_code} (Expected 403 Forbidden)')

# ============================================================
# PHASE 14, 15 & 16: ESCROW & DNK POSTAL SCAN WEBHOOK AUDIT
# ============================================================
print('\n[PHASE 14, 15 & 16] ESCROW & WEBHOOK AUDIT')

# Escrow initial state
escrow_id = ord_data['escrow_id']
with engine.connect() as conn:
    e_row = conn.execute(text('SELECT id, order_id, amount_inr, status FROM escrows WHERE id = :id'), {'id': escrow_id}).fetchone()
    print(f'  Initial Escrow #{escrow_id} Status: {e_row[3]}')

# Buyer Payment / Escrow Payment transition
pay_res = requests.post(f'http://127.0.0.1:8000/api/v1/escrow/{escrow_id}/payment', headers=b_headers)
print(f'  POST /escrow/{escrow_id}/payment -> HTTP {pay_res.status_code}, Status: {pay_res.json().get("status")}')

# Verify in DB
with engine.connect() as conn:
    e_paid = conn.execute(text('SELECT status FROM escrows WHERE id = :id'), {'id': escrow_id}).fetchone()
    print(f'  PostgreSQL Escrow Status after Payment: {e_paid[0]}')
    assert e_paid[0] == 'FUNDS_HELD_ESCROW', f'Expected FUNDS_HELD_ESCROW, got {e_paid[0]}'

# Webhook call: POSTAL_SCAN
webhook_payload = {
    'order_id': audit_order_id,
    'tracking_number': f'DNK{audit_order_id:09d}IN',
    'event_type': 'POSTAL_SCAN',
    'location': 'Belagavi DNK Post Office'
}
wh_res = requests.post('http://127.0.0.1:8000/api/v1/webhooks/dnk-scan', json=webhook_payload)
print(f'  POST /webhooks/dnk-scan -> HTTP {wh_res.status_code}, Message: {wh_res.json().get("message")}')

# Verify in DB: escrow status, shipping events, payouts
with engine.connect() as conn:
    e_scan = conn.execute(text('SELECT status FROM escrows WHERE id = :id'), {'id': escrow_id}).fetchone()
    ship_ev = conn.execute(text('SELECT tracking_number, event_type, location FROM shipping_events WHERE order_id = :oid'), {'oid': audit_order_id}).fetchall()
    payout_ev = conn.execute(text('SELECT amount_inr, status, destination_type FROM payouts WHERE order_id = :oid'), {'oid': audit_order_id}).fetchall()
    print(f'  PostgreSQL Escrow Status after Postal Scan: {e_scan[0]}')
    print(f'  PostgreSQL Shipping Events Count: {len(ship_ev)} (Latest: {ship_ev[-1] if ship_ev else None})')
    print(f'  PostgreSQL Payouts Count: {len(payout_ev)} (Payout: {payout_ev[-1] if payout_ev else None})')

# Test Invalid Webhook: Duplicate / Invalid Order
bad_wh = requests.post('http://127.0.0.1:8000/api/v1/webhooks/dnk-scan', json={
    'order_id': 999999,
    'tracking_number': 'DNK999999999IN',
    'event_type': 'POSTAL_SCAN',
    'location': 'Unknown'
})
print(f'  Invalid Order Webhook Rejection: HTTP {bad_wh.status_code} (Expected 404)')

# ============================================================
# PHASE 17 & 18: PBE-III, CN23 & TRACKING AUDIT
# ============================================================
print('\n[PHASE 17 & 18] PBE-III, CN23 & TRACKING LIFECYCLE AUDIT')

# Create PBE Filing
pbe_res = requests.post('http://127.0.0.1:8000/api/v1/logistics/pbe-submit', json={
    'order_id': audit_order_id,
    'currency': 'USD',
    'pbe_type': 'PBE-III'
}, headers=b_headers)
print(f'  POST /logistics/pbe-submit -> HTTP {pbe_res.status_code}')
pbe_data = pbe_res.json()
pbe_id = pbe_data.get('id')
tracking_no = pbe_data.get('tracking_number')
print(f'  Generated PBE ID: {pbe_id}, Number: {pbe_data.get("pbe_number")}, Tracking: {tracking_no}')

# Check PDF generation endpoint
pdf_res = requests.get(f'http://127.0.0.1:8000/api/v1/logistics/pbe/{pbe_id}/cn23-pdf')
print(f'  GET /logistics/pbe/{pbe_id}/cn23-pdf -> HTTP {pdf_res.status_code}, Content-Type: {pdf_res.headers.get("content-type")}, Size: {len(pdf_res.content)} bytes')

# Test Full Lifecycle Events: FPO -> LEO -> Dispatch -> Delivery
fpo_res = requests.post('http://127.0.0.1:8000/api/v1/dnk/fpo-transfer', json={'tracking_number': tracking_no, 'location': 'Foreign Post Office, Mumbai'})
leo_res = requests.post('http://127.0.0.1:8000/api/v1/dnk/leo-release', json={'tracking_number': tracking_no, 'location': 'Customs LEO Terminal'})
disp_res = requests.post('http://127.0.0.1:8000/api/v1/dnk/international-dispatch', json={'tracking_number': tracking_no, 'location': 'Air Cargo Complex, Mumbai'})
deliv_res = requests.post('http://127.0.0.1:8000/api/v1/dnk/delivery-confirm', json={'tracking_number': tracking_no, 'location': 'San Francisco, USA'})

print(f'  Lifecycle API Events -> FPO: {fpo_res.status_code}, LEO: {leo_res.status_code}, Dispatch: {disp_res.status_code}, Delivery: {deliv_res.status_code}')

# Track shipment
track_res = requests.get(f'http://127.0.0.1:8000/api/v1/logistics/track/{tracking_no}')
print(f'  GET /logistics/track/{tracking_no} -> HTTP {track_res.status_code}')
track_data = track_res.json()
print(f'  Milestones Tracked ({len(track_data.get("events", []))}):')
for ev in track_data.get('events', []):
    print(f'    - [{ev.get("status"):<9}] {ev.get("event_type"):<24} @ {ev.get("location")}')

# ============================================================
# PHASE 19: AI FEATURES AUDIT
# ============================================================
print('\n[PHASE 19] AI FEATURES AUDIT')
ai_res = requests.post('http://127.0.0.1:8000/api/v1/ai/catalog/generate', json={
    'raw_text': 'Handmade wooden rocking horse toy with organic vegetable dyes',
    'source_language': 'en'
}, headers=prod_headers)
print(f'  POST /api/v1/ai/catalog/generate -> HTTP {ai_res.status_code}')
if ai_res.status_code == 200:
    ai_json = ai_res.json()
    print(f'  AI Result -> Title: {ai_json.get("title")}')
    print(f'               HS Code: {ai_json.get("hs_code")} (Confidence: {ai_json.get("hs_confidence")})')
    print(f'               Category: {ai_json.get("category")}')

# ============================================================
# PHASE 21: CORS CONFIGURATION AUDIT
# ============================================================
print('\n[PHASE 21] CORS CONFIGURATION AUDIT')
cors_res = requests.options('http://127.0.0.1:8000/api/v1/products', headers={
    'Origin': 'http://localhost:3000',
    'Access-Control-Request-Method': 'GET'
})
print(f'  OPTIONS /products (Origin: http://localhost:3000) -> HTTP {cors_res.status_code}')
print(f'  Access-Control-Allow-Origin: {cors_res.headers.get("access-control-allow-origin")}')
print(f'  Access-Control-Allow-Credentials: {cors_res.headers.get("access-control-allow-credentials")}')

print('\n' + '=' * 80)
print('                    AUDIT EXECUTION COMPLETE')
print('=' * 80)