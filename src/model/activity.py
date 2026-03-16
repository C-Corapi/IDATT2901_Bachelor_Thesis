from db.base import Base
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column
from __future__ import annotations

class Activity(Base):
    __tablename__ = "activity"

    id: Mapped[int]
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    epic_id: Mapped[int] = mapped_column(ForeignKey("epic.id"))

    epic: Mapped[Epic] = relationship(back_populates="activities")

    def __repr__(self):
        return f"<Activity(id={self.id}, name='{self.name}')>"
    