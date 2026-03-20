from datetime import datetime, date

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..utils.database import Base


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    time_logged: Mapped[datetime]
    target_date: Mapped[date]
    activity_id: Mapped[int] = mapped_column(ForeignKey("activity.id"))

    activity: Mapped["Activity"] = relationship(back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, name='{self.name}')>"
