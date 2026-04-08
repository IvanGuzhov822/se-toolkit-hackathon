from datetime import date
from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class PriorityHistoryEntry(BaseModel):
    changed_at: date
    field: str
    old: bool
    new: bool


class AICheckRequest(BaseModel):
    task_id: UUID
    task_title: str
    old_important: bool
    new_important: bool
    old_deadline: Optional[date] = None
    new_deadline: Optional[date] = None
    history: list[PriorityHistoryEntry] = []


class AICheckResponse(BaseModel):
    ai_message: str
    confidence: float = 0.0
