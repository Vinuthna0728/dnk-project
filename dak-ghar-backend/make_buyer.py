from database import SessionLocal
from models import User


db = SessionLocal()

try:
    user = db.query(User).filter(User.id == 6).first()

    if not user:
        print("❌ User ID 6 not found")
    else:
        user.role = "BUYER"
        db.commit()
        db.refresh(user)

        print("✅ User converted to BUYER")
        print(f"ID: {user.id}")
        print(f"Name: {user.name}")
        print(f"Role: {user.role}")

finally:
    db.close()