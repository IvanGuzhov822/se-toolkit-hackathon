from datetime import time, timedelta, date, datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.task import Task
from app.models.user import User

QUADRANT_BASE = {
    "Q1": time(8, 0),
    "Q2": time(10, 0),
    "Q3": time(14, 0),
    "Q4": time(16, 0),
}

MAX_DAILY_MINUTES = 12 * 60  # 12 hours


def _time_to_minutes(t: time) -> int:
    return t.hour * 60 + t.minute


def _minutes_to_time(m: int) -> time:
    return time(m // 60, m % 60)


def _is_sleep_time(minutes_from_midnight: int, sleep_start: str, sleep_end: str) -> bool:
    start_min = int(sleep_start.split(":")[0]) * 60 + int(sleep_start.split(":")[1])
    end_min = int(sleep_end.split(":")[0]) * 60 + int(sleep_end.split(":")[1])
    if start_min > end_min:
        return minutes_from_midnight >= start_min or minutes_from_midnight < end_min
    else:
        return start_min <= minutes_from_midnight < end_min


def _get_wake_time(sleep_end: str) -> int:
    return int(sleep_end.split(":")[0]) * 60 + int(sleep_end.split(":")[1])


def _get_sleep_time(sleep_start: str) -> int:
    return int(sleep_start.split(":")[0]) * 60 + int(sleep_start.split(":")[1])


async def _get_day_tasks(session: AsyncSession, user: User, task_date: date):
    result = await session.execute(
        select(Task)
        .where(Task.user_id == user.id, Task.scheduled_date == task_date)
        .order_by(Task.start_time)
    )
    return result.scalars().all()


async def _day_total_minutes(session: AsyncSession, user: User, task_date: date) -> int:
    tasks = await _get_day_tasks(session, user, task_date)
    return sum(t.duration_min for t in tasks)


async def _find_last_free_slot(session: AsyncSession, user: User, task_date: date, duration_min: int, wake_min: int, sleep_min: int) -> int | None:
    """Find the latest available slot before sleep."""
    existing = await _get_day_tasks(session, user, task_date)
    existing_sorted = sorted(existing, key=lambda t: _time_to_minutes(t.start_time))

    # Start from the end of the last task or from wake time
    if existing_sorted:
        last = existing_sorted[-1]
        candidate = _time_to_minutes(last.start_time) + last.duration_min
    else:
        candidate = wake_min

    if candidate + duration_min <= sleep_min:
        return candidate
    return None


async def redistribute_day_overload(session: AsyncSession, user: User, task_date: date):
    """
    If a day has > 12 hours of tasks:
    1. Move Q4 tasks to the next day (Q4 time slot)
    2. If still overloaded, move Q2 tasks to the next day (end of day)
    Repeat until the day is under 12h or no more tasks can be moved.
    """
    max_iterations = 20
    for _ in range(max_iterations):
        total = await _day_total_minutes(session, user, task_date)
        if total <= MAX_DAILY_MINUTES:
            return

        wake_min = _get_wake_time(user.sleep_end)
        sleep_min = _get_sleep_time(user.sleep_start)

        # Try to move Q4 first
        tasks = await _get_day_tasks(session, user, task_date)
        q4_tasks = [t for t in tasks if t.quadrant == "Q4"]

        if q4_tasks:
            # Move the last Q4 task to the next day
            task_to_move = q4_tasks[-1]
            next_date = task_date + timedelta(days=1)

            # Find a Q4 slot on the next day
            slot = await _find_slot_for_quadrant(session, user, next_date, "Q4", task_to_move.duration_min, wake_min, sleep_min)
            if slot is not None:
                task_to_move.scheduled_date = next_date
                task_to_move.start_time = _minutes_to_time(slot)
                await session.flush()
                continue

        # Try to move Q2
        q2_tasks = [t for t in tasks if t.quadrant == "Q2"]
        if q2_tasks:
            task_to_move = q2_tasks[-1]
            next_date = task_date + timedelta(days=1)

            # Q2 goes to end of day
            slot = await _find_last_free_slot(session, user, next_date, task_to_move.duration_min, wake_min, sleep_min)
            if slot is not None:
                task_to_move.scheduled_date = next_date
                task_to_move.start_time = _minutes_to_time(slot)
                await session.flush()
                continue

        # No more tasks can be moved
        return


async def _find_slot_for_quadrant(session: AsyncSession, user: User, task_date: date, quadrant: str, duration_min: int, wake_min: int, sleep_min: int) -> int | None:
    """Find the earliest available slot for a given quadrant."""
    existing = await _get_day_tasks(session, user, task_date)
    base_min = _time_to_minutes(QUADRANT_BASE.get(quadrant, time(8, 0)))
    if base_min < wake_min:
        base_min = wake_min

    candidate = base_min
    for task in sorted(existing, key=lambda t: _time_to_minutes(t.start_time)):
        task_start = _time_to_minutes(task.start_time)
        task_end = task_start + task.duration_min
        if candidate + duration_min <= task_start:
            if not _is_sleep_time(candidate, user.sleep_start, user.sleep_end):
                return candidate
        candidate = max(candidate, task_end)

    if candidate + duration_min <= sleep_min:
        return candidate
    return None


async def calculate_start_time(
    session: AsyncSession,
    user: User,
    scheduled_date: date,
    quadrant: str,
    duration_min: int,
    manual: bool = False,
    manual_start: time | None = None,
    deadline: date | None = None,
    deadline_time: time | None = None,
) -> tuple[time, date]:
    quadrant_order = {"Q1": 1, "Q2": 2, "Q3": 3, "Q4": 4}

    wake_min = _get_wake_time(user.sleep_end)
    sleep_min = _get_sleep_time(user.sleep_start)

    if manual and manual_start:
        return manual_start, scheduled_date

    base_min = _time_to_minutes(QUADRANT_BASE.get(quadrant, time(8, 0)))
    if base_min < wake_min:
        base_min = wake_min

    deadline_dt = None
    if deadline and quadrant in ("Q1", "Q3"):
        deadline_dt = datetime.combine(deadline, deadline_time or time(23, 59))

    current_date = scheduled_date
    max_days_search = 14

    for _ in range(max_days_search):
        if deadline_dt:
            if datetime.combine(current_date, time(0, 0)) > deadline_dt:
                break

        existing = await _get_day_tasks(session, user, current_date)
        candidate = base_min

        for task in sorted(existing, key=lambda t: _time_to_minutes(t.start_time)):
            task_start = _time_to_minutes(task.start_time)
            task_end = task_start + task.duration_min
            if candidate + duration_min <= task_start:
                if not _is_sleep_time(candidate, user.sleep_start, user.sleep_end):
                    slot = candidate
                    if deadline_dt:
                        task_end_dt = datetime.combine(current_date, _minutes_to_time(slot)) + timedelta(minutes=duration_min)
                        if task_end_dt <= deadline_dt:
                            return _minutes_to_time(slot), current_date
                    else:
                        return _minutes_to_time(slot), current_date
            candidate = max(candidate, task_end)

        if not _is_sleep_time(candidate, user.sleep_start, user.sleep_end) and candidate + duration_min <= sleep_min:
            if deadline_dt:
                task_end_dt = datetime.combine(current_date, _minutes_to_time(candidate)) + timedelta(minutes=duration_min)
                if task_end_dt <= deadline_dt:
                    return _minutes_to_time(candidate), current_date
            else:
                return _minutes_to_time(candidate), current_date

        current_date = current_date + timedelta(days=1)

    return _minutes_to_time(wake_min), scheduled_date
