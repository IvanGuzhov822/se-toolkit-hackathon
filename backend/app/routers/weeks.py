from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import date, timedelta

from app.database import get_session
from app.models.task import Task
from app.models.user import User
from app.schemas.week import WeekView, WeekDayResponse
from app.utils.covey_matrix import QUADRANT_ORDER
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/weeks", tags=["weeks"])

DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def get_week_start(given_date: date) -> date:
    return given_date - timedelta(days=given_date.weekday())


def get_week_days(monday: date) -> list[date]:
    return [monday + timedelta(days=i) for i in range(7)]


@router.get("/current", response_model=WeekView)
async def get_current_week(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    today = date.today()
    week_start = get_week_start(today)
    week_end = week_start + timedelta(days=6)
    return await build_week_view(session, user, week_start, week_end)


@router.get("/{week_date}", response_model=WeekView)
async def get_week(
    week_date: date,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    week_start = get_week_start(week_date)
    week_end = week_start + timedelta(days=6)
    return await build_week_view(session, user, week_start, week_end)


async def build_week_view(session: AsyncSession, user: User, week_start: date, week_end: date) -> WeekView:
    result = await session.execute(
        select(Task)
        .where(
            Task.user_id == user.id,
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
