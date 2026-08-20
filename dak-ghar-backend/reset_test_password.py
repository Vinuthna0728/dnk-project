from database import SessionLocal
from models import User
from auth import hash_password


def reset_test_password():
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == "seller@dakghar.local")
            .first()
        )

        if user is None:
            print("Test seller not found.")
            return

        user.password_hash = hash_password("DakGhar@123")

        db.commit()
        db.refresh(user)

        print("Password reset successfully.")
        print(f"User ID: {user.id}")
        print("Email: seller@dakghar.local")
        print("Password: DakGhar@123")

    finally:
        db.close()


if __name__ == "__main__":
    reset_test_password()