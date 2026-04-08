"""add auth fields to users

Revision ID: 002_add_auth
Revises: 001_initial
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '002_add_auth'
down_revision: Union[str, None] = '001_initial'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if columns already exist (idempotent migration)
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('users')]

    if 'password_hash' not in columns:
        op.add_column('users', sa.Column('password_hash', sa.String(255), nullable=True))
    if 'sleep_start' not in columns:
        op.add_column('users', sa.Column('sleep_start', sa.String(5), server_default='23:00'))
    if 'sleep_end' not in columns:
        op.add_column('users', sa.Column('sleep_end', sa.String(5), server_default='07:00'))

    # Delete tasks and default user if still present
    op.execute("DELETE FROM priority_history WHERE task_id IN (SELECT id FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000001')")
    op.execute("DELETE FROM tasks WHERE user_id = '00000000-0000-0000-0000-000000000001'")
    op.execute("DELETE FROM users WHERE id = '00000000-0000-0000-0000-000000000001'")

    # Make password_hash NOT NULL
    op.alter_column('users', 'password_hash', nullable=False)


def downgrade() -> None:
    op.drop_column('users', 'sleep_end')
    op.drop_column('users', 'sleep_start')
    op.drop_column('users', 'password_hash')
