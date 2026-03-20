"""SQLAlchemy model representing a Decision in the database."""

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Mapped, mapped_column

from ..utils.database import Base


class Decision(Base):
    """SQLAlchemy model representing a Decision in the database."""
    __tablename__ = "decision"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    alternatives: Mapped[str]
    nature: Mapped[str]
    reach: Mapped[str]
    deadline: Mapped[Optional[datetime]]
    owner: Mapped[Optional[str]]

    def __repr__(self) -> str:
        """Return a string representation of the Decision instance."""
        return f"Decision(id={self.id!r}, title={self.name!r})"
