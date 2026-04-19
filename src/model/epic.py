"""Epic model for storing metadata designations in the database.

This module defines the Epic SQLAlchemy model, which represents an epic entity
used in agile development for organizing and tracking high-level features or
initiatives. The model includes fields for various metadata extracted or
designated for epics.
"""

from sqlalchemy.orm import Mapped, mapped_column

from enums.kanban_status import KanbanStatus
from utils.database import Base


class Epic(Base):
    """SQLAlchemy model representing an Epic entity.

    An Epic is a high-level feature or initiative in agile development that
    encompasses multiple user stories, tasks, and deliverables. This model
    stores metadata designations for epics, including classification,
    description, ownership, and requirements.

    Attributes:
        id (int): Primary key, auto-incrementing identifier for the epic.
        title (str): The title of the epic.
        description (str): A detailed description of the epic's purpose and scope.
        classification (str): The classification category of the epic.
        owner (Optional[str]): The person or team responsible for the epic.
        scope (str): The scope or boundaries of the epic.
        use_case (Optional[str]): The primary use case addressed by the epic.
        user_story (Optional[str]): Associated user story or stories.
        non_functional_requirements (Optional[str]): Non-functional requirements for the epic.
    """

    __tablename__ = "epic"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    description: Mapped[str | None] = mapped_column(nullable=True)
    classification: Mapped[str | None] = mapped_column(nullable=True)
    owner: Mapped[str | None] = mapped_column(nullable=True)
    scope: Mapped[str | None] = mapped_column(nullable=True)
    use_case: Mapped[str | None] = mapped_column(nullable=True)
    user_story: Mapped[str | None] = mapped_column(nullable=True)
    non_functional_requirements: Mapped[str | None] = mapped_column(nullable=True)
    kanban_status: Mapped[KanbanStatus] = mapped_column(default=KanbanStatus.BACKLOG)

    def __repr__(self) -> str:
        """Return a string representation of the Epic instance."""
        return f"Epic(id={self.id!r}, name={self.name!r})"
