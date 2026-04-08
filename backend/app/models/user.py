import uuid
from sqlalchemy import String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    sleep_start: Mapped[str] = mapped_column(String(5), server_default="'23:00'")  # HH:MM
    sleep_end: Mapped[str] = mapped_column(String(5), server_default="'07:00'")    # HH:MM
    created_at: Mapped[func.now] = mapped_column(DateTime, server_default=func.now())

    tasks: Mapped[list["Task"]] = relationship(back_populates="user")  # noqa: F405
