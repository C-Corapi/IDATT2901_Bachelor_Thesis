"""SQLAlchemy model representing an Activity in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Activity(Base):
    """SQLAlchemy model representing an Activity in the database."""

    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str | None] = mapped_column(nullable=True)
    owner: Mapped[str | None] = mapped_column(nullable=True)
    status: Mapped[str | None] = mapped_column(nullable=True)
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)
    source: Mapped[str | None] = mapped_column(nullable=True)
    confidence: Mapped[float | None] = mapped_column(nullable=True)

    def __repr__(self):
        """Return a string representation of the Activity instance."""
        return f"<Activity(id={self.id}, title='{self.title}')>"
