"""Epic model for storing metadata designations in the database.

This module defines the Epic SQLAlchemy model, which represents an epic entity
used in agile development for organizing and tracking high-level features or
initiatives. The model includes fields for various metadata extracted or
designated for epics.
"""

from typing import Optional
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from db.base import Base

class Epic(Base):
    """SQLAlchemy model representing an Epic entity.

    An Epic is a high-level feature or initiative in agile development that
    encompasses multiple user stories, tasks, and deliverables. This model
    stores metadata designations for epics, including classification,
    description, ownership, and requirements.

    Attributes:
        id (int): Primary key, auto-incrementing identifier for the epic.
        name (str): The name or title of the epic.
        description (str): A detailed description of the epic's purpose and scope.
        classification (str): The classification category of the epic.
        owner (Optional[str]): The person or team responsible for the epic.
        scope (str): The scope or boundaries of the epic.
        use_case (Optional[str]): The primary use case addressed by the epic.
        user_story (Optional[str]): Associated user story or stories.
        non_functional_requirements (Optional[str]): Non-functional requirements for the epic.
    """

    __tablename__ = "epics"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    classification: Mapped[str]
    owner: Mapped[Optional[str]]
    scope: Mapped[str]
    use_case: Mapped[Optional[str]]
    user_story: Mapped[Optional[str]]
    non_functional_requirements: Mapped[Optional[str]]

    def __repr__(self) -> str:
        """Return a string representation of the Epic instance."""
        return f"Epic(id={self.id!r}, name={self.name!r})"