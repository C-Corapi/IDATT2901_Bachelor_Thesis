from ..utils.database import Base
from typing import List
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy.orm import mapped_column


class Activity(Base):
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
        return f"<Activity(id={self.id}, name='{self.name}')>"
