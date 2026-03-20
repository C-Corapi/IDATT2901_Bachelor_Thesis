"""SQLAlchemy model representing an Activity in the database."""

from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

if TYPE_CHECKING:
    from .deliverable import Deliverable
    from .epic import Epic
    from .task import Task

from ..utils.database import Base


class Activity(Base):
    """SQLAlchemy model representing an Activity in the database."""

    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    epic_id: Mapped[int] = mapped_column(ForeignKey("epic.id"))

    epic: Mapped["Epic"] = relationship(back_populates="activities")

    tasks: Mapped[List["Task"]] = relationship(back_populates="activity")
    deliverables: Mapped[List["Deliverable"]] = relationship(back_populates="activity")

    def __repr__(self):
        """Return a string representation of the Activity instance."""
        return f"<Activity(id={self.id}, name='{self.name}')>"
