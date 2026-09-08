"""add order channel and shipping fields

Revision ID: f96da8eb4b3e
Revises: 7ccb6613847c
Create Date: 2026-09-08 10:21:36.939084
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f96da8eb4b3e"
down_revision: Union[str, Sequence[str], None] = "7ccb6613847c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add channel and shipping fields to orders."""

    op.add_column(
        "orders",
        sa.Column(
            "channel_type",
            sa.String(length=20),
            nullable=False,
            server_default="D2C_INLAND",
        ),
    )

    op.add_column(
        "orders",
        sa.Column(
            "shipping_pincode",
            sa.String(length=20),
            nullable=True,
        ),
    )

    op.add_column(
        "orders",
        sa.Column(
            "destination_country_code",
            sa.String(length=10),
            nullable=True,
        ),
    )

    op.add_column(
        "orders",
        sa.Column(
            "tracking_barcode",
            sa.String(length=30),
            nullable=True,
        ),
    )

    op.create_unique_constraint(
        "uq_orders_tracking_barcode",
        "orders",
        ["tracking_barcode"],
    )

    op.add_column(
    "orders",
    sa.Column(
        "amount_usd",
        sa.Numeric(12, 2),
        nullable=True,
    ),
)

    op.add_column(
    "orders",
    sa.Column(
        "currency",
        sa.String(length=3),
        nullable=False,
        server_default="INR",
    ),
)


def downgrade() -> None:
    """Remove channel and shipping fields from orders."""

    op.drop_column("orders", "currency")
    op.drop_column("orders", "amount_usd")

    op.drop_constraint(
        "uq_orders_tracking_barcode",
        "orders",
        type_="unique",
    )

    op.drop_column("orders", "tracking_barcode")
    op.drop_column("orders", "destination_country_code")
    op.drop_column("orders", "shipping_pincode")
    op.drop_column("orders", "channel_type")