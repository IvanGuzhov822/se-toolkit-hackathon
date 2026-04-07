import uuid
from sqlalchemy import String, Text, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=func.gen_random_uuid())
    text: Mapped[str] = mapped_column(Text, nullable=False)
    quadrant_tag: Mapped[str] = mapped_column(String(10), server_default="general")
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
