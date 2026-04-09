"""SQLAlchemy model representing an Activity in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.canban_status import CanbanStatus
from utils.database import Base


class Activity(Base):
    """SQLAlchemy model representing an Activity in the database."""

    __tablename__ = "activity"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    canban_status: Mapped[CanbanStatus] = mapped_column(default=CanbanStatus.TODO)

    def __repr__(self):
        """Return a string representation of the Activity instance."""
        return f"<Activity(id={self.id}, name='{self.name}')>"
