"""add deadline_time to tasks

Revision ID: 003_deadline_time
Revises: 002_add_auth
Create Date: 2026-04-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '003_deadline_time'
down_revision: Union[str, None] = '002_add_auth'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tasks', sa.Column('deadline_time', sa.Time(), nullable=True))


def downgrade() -> None:
    op.drop_column('tasks', 'deadline_time')
