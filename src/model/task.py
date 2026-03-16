from sqlalchemy import Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class Task(Base):
    __tablename__ = "task"

    id: Mapped[int]
    name: Mapped[str]
    description: Mapped[str]
    owner: Mapped[str]
    status: Mapped[str]
    time_logged: Mapped[DateTime]
    target_date: Mapped[Date]
    activity_id: Mapped[int] = mapped_column(ForeignKey("activity.id"))

    activity: Mapped["Activity"] = relationship(back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, name='{self.name}')>"