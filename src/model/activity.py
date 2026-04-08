"""SQLAlchemy model representing an Activity in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from utils.database import Base


class Activity(Base):
    """SQLAlchemy model representing an Activity in the database."""

    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]

    def __repr__(self):
        """Return a string representation of the Activity instance."""
        return f"<Activity(id={self.id}, name='{self.name}')>"
