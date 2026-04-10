"""Defines the Pydantic model for a Kanban card."""

from pydantic import BaseModel


class KanbanCard(BaseModel):
    """Represents a card on the Kanban board."""
    id: int
    title: str
    type: str
    kanban_status: str


class KanbanBoard(BaseModel):
    """Represents the entire Kanban board with columns."""
    backlog: list[KanbanCard] = []
    todo: list[KanbanCard] = []
    in_progress: list[KanbanCard] = []
    done: list[KanbanCard] = []
