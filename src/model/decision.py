from datetime import datetime

from sqlalchemy.orm import Mapped, mapped_column

from ..database import Base


class Decision(Base):
    __tablename__ = "decision"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    alternatives: Mapped[str]
    nature: Mapped[str]
    reach: Mapped[str]
    deadline: Mapped[datetime]
    owner: Mapped[str]

    def __repr__(self) -> str:
        """Return a string representation of the Decision instance."""
        return f"Decision(id={self.id!r}, title={self.name!r})"