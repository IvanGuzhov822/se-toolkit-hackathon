from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from datetime import date, time, datetime, timedelta

from app.database import get_session
from app.models.task import Task
from app.models.priority_history import PriorityHistory
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.utils.covey_matrix import calculate_quadrant
from app.services.task_service import log_priority_change
from app.services.time_scheduler import calculate_start_time, redistribute_day_overload
from app.services.ai_service import ai_check_priority_change
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("", response_model=list[TaskResponse])
async def list_tasks(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Task)
        .where(Task.user_id == user.id)
        .order_by(Task.scheduled_date, Task.start_time)
    )
    tasks = result.scalars().all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    # User-selected quadrant, no auto-calculation
    quadrant = payload.quadrant or "Q4"
    is_important = quadrant in ("Q1", "Q2")

    def _to_min(t):
        return t.hour * 60 + t.minute

    if payload.manual and payload.manual_start:
        start_time = payload.manual_start
        scheduled_date = payload.scheduled_date

        # Validate no overlap for manual tasks
        new_start_min = _to_min(start_time)
        new_end_min = new_start_min + payload.duration_min

        # Validate task is not scheduled before current time (if today)
        if scheduled_date == date.today():
            now_min = datetime.now().hour * 60 + datetime.now().minute
            if new_start_min < now_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot schedule a task before the current time. It is now {(now_min // 60):02d}:{now_min % 60:02d}.",
                )

        # Validate task can finish before its own deadline
        if payload.deadline and scheduled_date == payload.deadline:
            dl_min = _to_min(payload.deadline_time) if payload.deadline_time else 23 * 60 + 59
            if new_end_min > dl_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"Task cannot finish before deadline. It starts at {start_time.strftime('%H:%M')}, takes {payload.duration_min}min, and would end at {(new_end_min // 60):02d}:{new_end_min % 60:02d}, but the deadline is {payload.deadline_time or '23:59'}.",
                )

        all_tasks = await session.execute(
            select(Task).where(Task.user_id == user.id, Task.scheduled_date == scheduled_date)
        )
        for other in all_tasks.scalars().all():
            other_start = _to_min(other.start_time)
            other_end = other_start + other.duration_min
            if new_start_min < other_end and new_end_min > other_start:
                raise HTTPException(
                    status_code=400,
                    detail=f"Time conflict with \"{other.title}\" ({other.start_time.strftime('%H:%M')}–{(other_end // 60):02d}:{other_end % 60:02d}). Choose a different time.",
                )
    else:
        start_time, scheduled_date = await calculate_start_time(
            session, user, payload.scheduled_date, quadrant, payload.duration_min,
            deadline=payload.deadline, deadline_time=payload.deadline_time,
        )

        # Validate auto-scheduled task can finish before deadline
        if payload.deadline and scheduled_date == payload.deadline:
            start_min = _to_min(start_time)
            end_min = start_min + payload.duration_min
            dl_min = _to_min(payload.deadline_time) if payload.deadline_time else 23 * 60 + 59
            if end_min > dl_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"Task cannot finish before deadline. It would start at {(start_min // 60):02d}:{start_min % 60:02d}, takes {payload.duration_min}min, and would end at {(end_min // 60):02d}:{end_min % 60:02d}, but the deadline is {(dl_min // 60):02d}:{dl_min % 60:02d}.",
                )

    task = Task(
        user_id=user.id,
        title=payload.title,
        description=payload.description,
        is_important=is_important,
        deadline=payload.deadline,
        deadline_time=payload.deadline_time,
        scheduled_date=scheduled_date,
        start_time=start_time,
        duration_min=payload.duration_min,
        quadrant=quadrant,
    )
    session.add(task)
    await session.commit()
    await session.refresh(task)

    # Check if the day is overloaded after creation
    await redistribute_day_overload(session, user, task.scheduled_date)
    await session.commit()
    await session.refresh(task)

    # AI check with full history
    ai_warning = None
    all_past_tasks_res = await session.execute(
        select(Task.title, Task.quadrant).where(Task.user_id == user.id, Task.id != task.id)
    )
    past_tasks = [{"title": row.title, "quadrant": row.quadrant} for row in all_past_tasks_res.all()]

    if past_tasks:
        warning = await ai_check_priority_change(
            task.title, task.quadrant, past_tasks
        )
        if warning:
            ai_warning = warning

    response = TaskResponse.model_validate(task)
    response.ai_warning = ai_warning
    return response


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    def _to_min(t):
        return t.hour * 60 + t.minute

    # Validate: cannot move task to the past
    if payload.scheduled_date is not None and payload.scheduled_date < date.today():
        raise HTTPException(status_code=400, detail="Cannot schedule tasks in the past.")

    # Validate start_time if changed
    if payload.start_time is not None:
        new_start = payload.start_time
        new_date = payload.scheduled_date or task.scheduled_date
        new_duration = payload.duration_min or task.duration_min

        new_start_min = _to_min(new_start)
        new_end_min = new_start_min + new_duration

        # Validate task is not scheduled before current time (if today)
        # Only for new manual tasks, not for edits
        if new_date == date.today() and payload.start_time is not None:
            now_min = datetime.now().hour * 60 + datetime.now().minute
            if new_start_min < now_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"Cannot schedule a task before the current time. It is now {(now_min // 60):02d}:{now_min % 60:02d}.",
                )

        # Validate task can finish before its own deadline — for both new and edit
        task_deadline = payload.deadline if payload.deadline is not None else task.deadline
        task_deadline_time = payload.deadline_time if payload.deadline_time is not None else (task.deadline_time if task else None)
        if task_deadline and new_date == task_deadline:
            dl_min = _to_min(task_deadline_time) if task_deadline_time else 23 * 60 + 59
            if new_end_min > dl_min:
                raise HTTPException(
                    status_code=400,
                    detail=f"Task cannot finish before deadline. It starts at {(new_start_min // 60):02d}:{new_start_min % 60:02d}, takes {new_duration}min, and would end at {(new_end_min // 60):02d}:{new_end_min % 60:02d}, but the deadline is {(dl_min // 60):02d}:{dl_min % 60:02d}.",
                )

        # Check overlap with other tasks on the same day
        all_tasks = await session.execute(
            select(Task).where(Task.user_id == user.id, Task.scheduled_date == new_date)
        )
        for other in all_tasks.scalars().all():
            if other.id == task_id:
                continue
            other_start = _to_min(other.start_time)
            other_end = other_start + other.duration_min
            if new_start_min < other_end and new_end_min > other_start:
                raise HTTPException(
                    status_code=400,
                    detail=f"Time conflict with \"{other.title}\" ({other.start_time.strftime('%H:%M')}–{(other_end // 60):02d}:{other_end % 60:02d}). Choose a different time.",
                )

        # Q1/Q3 deadline check (to the minute)
        if task.deadline and task.quadrant in ("Q1", "Q3"):
            from datetime import datetime, timedelta
            deadline_dt = datetime.combine(task.deadline, task.deadline_time or time(23, 59))
            task_end = datetime.combine(new_date, new_start) + timedelta(minutes=new_duration)
            if task_end > deadline_dt:
                raise HTTPException(
                    status_code=400,
                    detail=f"Q1/Q3 tasks must be completed before deadline ({task.deadline} {task.deadline_time or '23:59'}).",
                )

    # Log priority change
    old_important = task.is_important
    old_deadline = task.deadline
    new_important = payload.is_important if payload.is_important is not None else old_important
    new_deadline = payload.deadline if payload.deadline is not None else old_deadline

    if old_important != new_important or old_deadline != new_deadline:
        await log_priority_change(
            session, task, old_important, new_important, old_deadline, new_deadline
        )

    # Update fields
    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.quadrant is not None:
        task.quadrant = payload.quadrant
        task.is_important = payload.quadrant in ("Q1", "Q2")
    if payload.is_important is not None and payload.quadrant is None:
        task.is_important = payload.is_important
    if payload.deadline is not None:
        task.deadline = payload.deadline
    if payload.deadline_time is not None:
        task.deadline_time = payload.deadline_time
    if payload.scheduled_date is not None:
        task.scheduled_date = payload.scheduled_date
    if payload.start_time is not None:
        task.start_time = payload.start_time
    if payload.duration_min is not None:
        task.duration_min = payload.duration_min

    await session.commit()
    await session.refresh(task)

    # Check if the day is overloaded (> 12h) and redistribute
    await redistribute_day_overload(session, user, task.scheduled_date)
    # Also check the new date if moved
    if payload.scheduled_date and payload.scheduled_date != task.scheduled_date:
        await redistribute_day_overload(session, user, payload.scheduled_date)

    await session.commit()
    await session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task_date = task.scheduled_date
    await session.delete(task)
    await session.commit()

    # After deletion, check if other tasks can be moved back
    await redistribute_day_overload(session, user, task_date)
    await session.commit()
