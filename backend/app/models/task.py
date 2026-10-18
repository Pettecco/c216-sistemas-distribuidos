from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(500), default=None)
    done: Mapped[bool] = mapped_column(default=False)
