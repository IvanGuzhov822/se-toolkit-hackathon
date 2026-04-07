import uuid
from datetime import date
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class PriorityHistory(Base):
    __tablename__ = "priority_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    task_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tasks.id"), nullable=False)
    old_important: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    new_important: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    old_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    new_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    changed_at: Mapped[func.now] = mapped_column(DateTime, server_default=func.now())

    task: Mapped["Task"] = relationship(back_populates="priority_history")  # noqa: F405
