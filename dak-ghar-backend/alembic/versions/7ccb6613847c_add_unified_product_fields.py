"""add unified product fields

Revision ID: 7ccb6613847c
Revises: 3e14cf0b82e1
Create Date: 2026-08-29
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7ccb6613847c"
down_revision: Union[str, Sequence[str], None] = "3e14cf0b82e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add unified product fields."""

    # --------------------------------------------------------
    # Multilingual catalog
    # --------------------------------------------------------

    op.add_column(
        "products",
        sa.Column(
            "title_en",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "title_hi",
            sa.String(length=255),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "description_en",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "description_hi",
            sa.Text(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "category",
            sa.String(length=100),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # Channel availability
    # --------------------------------------------------------

    op.add_column(
        "products",
        sa.Column(
            "is_d2c",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "is_b2b",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "is_export",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # --------------------------------------------------------
    # Channel-specific pricing
    # --------------------------------------------------------

    op.add_column(
        "products",
        sa.Column(
            "cost_price_inr",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "retail_price_inr",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "wholesale_price_inr",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "b2b_moq",
            sa.Integer(),
            nullable=False,
            server_default="10",
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "b2b_bulk_discount_percentage",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "export_price_usd",
            sa.Numeric(12, 2),
            nullable=True,
        ),
    )

    # --------------------------------------------------------
    # Logistics
    # --------------------------------------------------------

    op.add_column(
        "products",
        sa.Column(
            "weight_grams",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "length_cm",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "width_cm",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "height_cm",
            sa.Float(),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "is_fragile",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )

    # --------------------------------------------------------
    # Images
    # --------------------------------------------------------

    op.add_column(
        "products",
        sa.Column(
            "raw_image_url",
            sa.String(length=1000),
            nullable=True,
        ),
    )

    op.add_column(
        "products",
        sa.Column(
            "enhanced_image_url",
            sa.String(length=1000),
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Remove unified product fields."""

    op.drop_column("products", "enhanced_image_url")
    op.drop_column("products", "raw_image_url")

    op.drop_column("products", "is_fragile")
    op.drop_column("products", "height_cm")
    op.drop_column("products", "width_cm")
    op.drop_column("products", "length_cm")
    op.drop_column("products", "weight_grams")

    op.drop_column(
        "products",
        "export_price_usd",
    )
    op.drop_column(
        "products",
        "b2b_bulk_discount_percentage",
    )
    op.drop_column(
        "products",
        "b2b_moq",
    )
    op.drop_column(
        "products",
        "wholesale_price_inr",
    )
    op.drop_column(
        "products",
        "retail_price_inr",
    )
    op.drop_column(
        "products",
        "cost_price_inr",
    )

    op.drop_column("products", "is_export")
    op.drop_column("products", "is_b2b")
    op.drop_column("products", "is_d2c")

    op.drop_column("products", "category")
    op.drop_column("products", "description_hi")
    op.drop_column("products", "description_en")
    op.drop_column("products", "title_hi")
    op.drop_column("products", "title_en")