"""add hs code to products

Revision ID: 0c9107328b1f
Revises: 4cac745efd53
Create Date: 2026-09-08 20:18:53.795969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0c9107328b1f'
down_revision: Union[str, Sequence[str], None] = '4cac745efd53'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "products",
        sa.Column(
            "hs_code",
            sa.String(length=8),
            nullable=True,
        ),
    )


def downgrade() -> None:
    op.drop_column("products", "hs_code")