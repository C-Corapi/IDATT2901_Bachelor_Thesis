"""SQLAlchemy model representing an Activity in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Activity(Base):
    """SQLAlchemy model representing an Activity in the database."""

    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)

    def __repr__(self):
        """Return a string representation of the Activity instance."""
        return f"<Activity(id={self.id}, name='{self.name}')>"
