"""SQLAlchemy model representing a Deliverable in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Deliverable(Base):
    """SQLAlchemy model representing a Deliverable in the database."""

    __tablename__ = "deliverable"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    requirements: Mapped[str | None] = mapped_column(nullable=True)
    specifications: Mapped[str | None] = mapped_column(nullable=True)
    properties: Mapped[str | None] = mapped_column(nullable=True)
    fit_criterion: Mapped[str | None] = mapped_column(nullable=True)
    owner: Mapped[str | None] = mapped_column(nullable=True)
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)
    source: Mapped[str | None] = mapped_column(nullable=True)
    confidence: Mapped[float | None] = mapped_column(nullable=True)

    def __repr__(self):
        """Return a string representation of the Deliverable instance."""
        return f"<Deliverable(id={self.id}, name='{self.title}')>"
