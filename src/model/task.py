"""SQLAlchemy model representing a Task in the database."""

from datetime import date, datetime

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Task(Base):
    """SQLAlchemy model representing a Task in the database."""

    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    time_logged: Mapped[datetime]
    target_date: Mapped[date]
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)

    def __repr__(self):
        """Return a string representation of the Task instance."""
        return f"<Task(id={self.id}, name='{self.name}')>"
