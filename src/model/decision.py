"""SQLAlchemy model representing a Decision in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Decision(Base):
    """SQLAlchemy model representing a Decision in the database."""

    __tablename__ = "decision"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str | None] = mapped_column(nullable=True)
    alternatives: Mapped[str | None] = mapped_column(nullable=True)
    nature: Mapped[str | None] = mapped_column(nullable=True)
    reach: Mapped[str | None] = mapped_column(nullable=True)
    deadline: Mapped[str | None] = mapped_column(nullable=True)
    owner: Mapped[str | None] = mapped_column(nullable=True)
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)
    source: Mapped[str | None] = mapped_column(nullable=True)
    confidence: Mapped[float | None] = mapped_column(nullable=True)

    def __repr__(self) -> str:
        """Return a string representation of the Decision instance."""
        return f"Decision(id={self.id!r}, title={self.title!r})"
