import uuid
from datetime import date, time
from sqlalchemy import String, Text, Boolean, Date, Time, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_important: Mapped[bool] = mapped_column(Boolean, server_default="false")
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    deadline_time: Mapped[time | None] = mapped_column(Time, nullable=True)  # Deadline time of day
    scheduled_date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    duration_min: Mapped[int] = mapped_column(Integer, nullable=False)
    quadrant: Mapped[str] = mapped_column(String(4), nullable=False)  # Q1, Q2, Q3, Q4
    created_at: Mapped[func.now] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[func.now] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped["User"] = relationship(back_populates="tasks")  # noqa: F405
    priority_history: Mapped[list["PriorityHistory"]] = relationship(back_populates="task", cascade="all, delete-orphan")  # noqa: F405
