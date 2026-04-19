"""SQLAlchemy model representing a Task in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Task(Base):
    """SQLAlchemy model representing a Task in the database."""

    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str | None] = mapped_column(nullable=True)
    owner: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[str | None] = mapped_column(nullable=True)
    time_logged: Mapped[str | None] = mapped_column(nullable=True)
    target_date: Mapped[str | None] = mapped_column(nullable=True)
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)

    def __repr__(self):
        """Return a string representation of the Task instance."""
        return f"<Task(id={self.id}, name='{self.title}')>"
