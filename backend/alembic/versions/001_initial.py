"""initial tables

Revision ID: 001_initial
Revises:
Create Date: 2026-04-04

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'users',
        sa.Column('id', sa.Uuid(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('username', sa.String(100), nullable=False, unique=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        'quotes',
        sa.Column('id', sa.Uuid(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('text', sa.Text(), nullable=False),
        sa.Column('quadrant_tag', sa.String(10), server_default='general'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
    )

    op.create_table(
        'tasks',
        sa.Column('id', sa.Uuid(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', sa.Uuid(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_important', sa.Boolean(), server_default='false'),
        sa.Column('deadline', sa.Date(), nullable=True),
        sa.Column('scheduled_date', sa.Date(), nullable=False),
        sa.Column('start_time', sa.Time(), nullable=False),
        sa.Column('duration_min', sa.Integer(), nullable=False),
        sa.Column('quadrant', sa.String(4), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )

    op.create_table(
        'priority_history',
        sa.Column('id', sa.Uuid(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('task_id', sa.Uuid(), sa.ForeignKey('tasks.id'), nullable=False),
        sa.Column('old_important', sa.Boolean(), nullable=True),
        sa.Column('new_important', sa.Boolean(), nullable=True),
        sa.Column('old_deadline', sa.Date(), nullable=True),
        sa.Column('new_deadline', sa.Date(), nullable=True),
        sa.Column('changed_at', sa.DateTime(), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('priority_history')
    op.drop_table('tasks')
    op.drop_table('quotes')
    op.drop_table('users')
