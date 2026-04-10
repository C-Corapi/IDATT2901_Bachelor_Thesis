"""Module containing the KanbanStatus enum."""

from enum import Enum


class KanbanStatus(str, Enum):
    """Enum representing the possible statuses of an element of a Kanban board."""

    BACKLOG = "Backlog"
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
