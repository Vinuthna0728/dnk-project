"""add currency fields to escrow

Revision ID: 3395f8e4c76b
Revises: f96da8eb4b3e
Create Date: 2026-09-08 16:51:12.910863

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3395f8e4c76b'
down_revision: Union[str, Sequence[str], None] = 'f96da8eb4b3e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "escrows",
        sa.Column(
            "amount_usd",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )


    op.add_column(
        "escrows",
        sa.Column(
            "currency",
            sa.String(length=3),
            nullable=False,
            server_default="INR",
        ),
    )


def downgrade() -> None:
    op.drop_column("escrows", "currency")
    op.drop_column("escrows", "amount_usd")