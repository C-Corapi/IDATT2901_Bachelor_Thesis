from pydantic import BaseModel

class KanbanCard(BaseModel):
    """Represents a card on the Kanban board, which can be an Epic, Deliverable, Activity, Decision, or Task."""

    id: int
    title: str
    type: str
    kanban_status: str
