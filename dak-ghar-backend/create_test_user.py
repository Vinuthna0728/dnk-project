from database import SessionLocal
from models import User
from auth import hash_password


def create_test_user():
    db = SessionLocal()

    try:
        existing_user = (
            db.query(User)
            .filter(User.email == "seller@dakghar.local")
            .first()
        )

        # If seller already exists, update the password
        if existing_user:
            existing_user.password_hash = hash_password("DakGhar@123")

            db.commit()
            db.refresh(existing_user)

            print(
                f"Test seller password updated successfully. "
                f"ID: {existing_user.id}"
            )
            return

        # If seller does not exist, create a new one
        user = User(
            name="Dak Ghar Seller",
            email="seller@dakghar.local",
            phone="9999999999",
            password_hash=hash_password("DakGhar@123"),
            role="SELLER",
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print(
            f"Test seller created successfully. ID: {user.id}"
        )

    finally:
        db.close()


if __name__ == "__main__":
    create_test_user()