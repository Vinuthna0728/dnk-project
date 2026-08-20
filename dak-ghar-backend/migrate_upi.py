from sqlalchemy import text
from database import engine


with engine.begin() as connection:
    connection.execute(
        text(
            """
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS upi_id VARCHAR(100) UNIQUE;
            """
        )
    )

print("✅ UPI ID column added successfully!")