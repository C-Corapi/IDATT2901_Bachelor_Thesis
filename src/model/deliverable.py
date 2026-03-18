from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base


class Deliverable(Base):
    __tablename__ = "deliverable"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    requirements: Mapped[str]
    specifications: Mapped[str]
    properties: Mapped[str]
    fit_criterion: Mapped[str]
    owner: Mapped[str]
    activity_id: Mapped[int] = mapped_column(ForeignKey("activity.id"))

    activity: Mapped["Activity"] = relationship(back_populates="deliverables")

    def __repr__(self):
        return f"<Deliverable(id={self.id}, name='{self.name}')>"
    