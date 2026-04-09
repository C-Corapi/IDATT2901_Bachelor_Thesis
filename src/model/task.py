"""SQLAlchemy model representing a Task in the database."""

from datetime import date, datetime

from sqlalchemy.orm import Mapped, mapped_column

from enums.canban_status import CanbanStatus
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
    canban_status: Mapped[CanbanStatus] = mapped_column(default=CanbanStatus.BACKLOG)

    def __repr__(self):
        """Return a string representation of the Task instance."""
        return f"<Task(id={self.id}, name='{self.name}')>"
