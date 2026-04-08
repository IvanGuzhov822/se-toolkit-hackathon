from sqlalchemy.ext.asyncio import AsyncSession
from app.models.task import Task
from app.models.priority_history import PriorityHistory
from datetime import date


async def log_priority_change(
    session: AsyncSession,
    task: Task,
    old_important: bool,
    new_important: bool,
    old_deadline: date | None,
    new_deadline: date | None,
):
    """Log a change in task priority/deadline to priority_history table."""
    if old_important == new_important and old_deadline == new_deadline:
        return

    entry = PriorityHistory(
        task_id=task.id,
        old_important=old_important,
        new_important=new_important,
        old_deadline=old_deadline,
        new_deadline=new_deadline,
    )
    session.add(entry)
