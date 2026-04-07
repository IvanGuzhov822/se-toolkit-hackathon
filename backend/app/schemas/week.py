from datetime import date
from pydantic import BaseModel
from app.schemas.task import TaskResponse


class WeekDayResponse(BaseModel):
    day_date: date
    day_name: str
    tasks: list[TaskResponse]


class WeekView(BaseModel):
    week_start: date
    week_end: date
    days: list[WeekDayResponse]
