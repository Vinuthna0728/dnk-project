"""add currency fields to escrow and payout

Revision ID: 4cac745efd53
Revises: 3395f8e4c76b
Create Date: 2026-09-08 17:49:48.233934
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4cac745efd53"
down_revision: Union[str, Sequence[str], None] = "3395f8e4c76b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make INR amounts nullable and add currency fields to payouts."""

    op.alter_column(
        "escrows",
        "amount_inr",
        existing_type=sa.Float(),
        nullable=True,
    )

    op.alter_column(
        "payouts",
        "amount_inr",
        existing_type=sa.Numeric(12, 2),
        nullable=True,
    )

    op.add_column(
        "payouts",
        sa.Column(
            "amount_usd",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )

    op.add_column(
        "payouts",
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
            server_default="INR",
        ),
    )


def downgrade() -> None:
    """Reverse payout currency changes and restore INR requirements."""

    op.drop_column("payouts", "currency")
    op.drop_column("payouts", "amount_usd")

    op.alter_column(
        "payouts",
        "amount_inr",
        existing_type=sa.Numeric(12, 2),
        nullable=False,
    )

    op.alter_column(
        "escrows",
        "amount_inr",
        existing_type=sa.Float(),
        nullable=False,
    )