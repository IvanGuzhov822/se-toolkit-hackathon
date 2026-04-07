from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.task import Task
from app.schemas.week import WeekView, WeekDayResponse
from app.utils.covey_matrix import QUADRANT_ORDER

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
DEFAULT_USER_ID = UUID("00000000-0000-0000-0000-000000000001")


def get_week_days(monday: date) -> list[date]:
    return [monday + timedelta(days=i) for i in range(7)]


async def build_week_view(session: AsyncSession, week_start: date, week_end: date) -> WeekView:
    from app.models.user import User
    from sqlalchemy import select

    result = await session.execute(select(User).where(User.id == DEFAULT_USER_ID))
    user = result.scalar_one_or_none()

    result = await session.execute(
        select(Task)
        .where(
            Task.user_id == (user.id if user else DEFAULT_USER_ID),
            Task.scheduled_date >= week_start,
            Task.scheduled_date <= week_end,
        )
    )
    all_tasks = result.scalars().all()

    days = []
    for i, day_date in enumerate(get_week_days(week_start)):
        day_tasks = [t for t in all_tasks if t.scheduled_date == day_date]
        day_tasks.sort(
            key=lambda t: (QUADRANT_ORDER.get(t.quadrant, 99), t.start_time)
        )
        days.append(
            WeekDayResponse(
                day_date=day_date,
                day_name=DAY_NAMES[i],
                tasks=day_tasks,
            )
        )

    return WeekView(
        week_start=week_start,
        week_end=week_end,
        days=days,
    )
