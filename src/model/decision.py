"""SQLAlchemy model representing a Decision in the database."""

from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Decision(Base):
    """SQLAlchemy model representing a Decision in the database."""

    __tablename__ = "decision"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[Optional[str]]
    alternatives: Mapped[Optional[str]]
    nature: Mapped[Optional[str]]
    reach: Mapped[Optional[str]]
    deadline: Mapped[Optional[str]]
    owner: Mapped[Optional[str]]
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)

    def __repr__(self) -> str:
        """Return a string representation of the Decision instance."""
        return f"Decision(id={self.id!r}, title={self.title!r})"
