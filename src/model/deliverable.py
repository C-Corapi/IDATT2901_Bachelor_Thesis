"""SQLAlchemy model representing a Deliverable in the database."""

from __future__ import annotations

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from model.activity import Activity
from utils.database import Base


class Deliverable(Base):
    """SQLAlchemy model representing a Deliverable in the database."""

    __tablename__ = "deliverable"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str]
    requirements: Mapped[str]
    specifications: Mapped[str]
    properties: Mapped[str]
    fit_criterion: Mapped[str]
    owner: Mapped[str]

    def __repr__(self):
        """Return a string representation of the Deliverable instance."""
        return f"<Deliverable(id={self.id}, name='{self.name}')>"
