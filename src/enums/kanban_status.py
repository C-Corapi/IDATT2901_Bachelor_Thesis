"""Module containing the KanbanStatus enum."""

from enum import Enum


class KanbanStatus(str, Enum):
    """Enum representing the possible statuses of an element of a Kanban board."""

    BACKLOG = "backlog"
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
