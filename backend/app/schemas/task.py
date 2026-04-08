from datetime import date, time, datetime
from uuid import UUID
from pydantic import BaseModel, Field, field_serializer
from typing import Optional


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_important: bool = False
    deadline: Optional[date] = None
    deadline_time: Optional[time] = None
    scheduled_date: date
    duration_min: int = Field(..., gt=0, le=480)
    manual: bool = False
    manual_start: Optional[time] = None
    quadrant: Optional[str] = None  # If provided, overrides auto-calculation


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_important: Optional[bool] = None
    deadline: Optional[date] = None
    scheduled_date: Optional[date] = None
    start_time: Optional[time] = None
    duration_min: Optional[int] = None
    quadrant: Optional[str] = None  # If provided, overrides auto-calculation


class TaskMove(BaseModel):
    """Move task to a different day and/or time slot."""
    scheduled_date: date
    start_time: time


class TaskResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    description: Optional[str]
    is_important: bool
    deadline: Optional[date]
    deadline_time: Optional[time]
    scheduled_date: date
    start_time: time
    duration_min: int
    quadrant: str
    ai_warning: Optional[str] = None  # AI priority warning
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

    @field_serializer("created_at", "updated_at")
    def serialize_dt(self, value: datetime, _info):
        if value is None:
            return None
        return value.isoformat()
