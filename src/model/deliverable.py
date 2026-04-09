"""SQLAlchemy model representing a Deliverable in the database."""

from sqlalchemy.orm import Mapped, mapped_column

from enums.canban_status import CanbanStatus
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
    canban_status: Mapped[CanbanStatus] = mapped_column(default=CanbanStatus.TODO)

    def __repr__(self):
        """Return a string representation of the Deliverable instance."""
        return f"<Deliverable(id={self.id}, name='{self.title}')>"
