"""Module containing the KanbanStatus enum."""

from enum import Enum


class KanbanStatus(str, Enum):
    """Enum representing the possible statuses of an element of a Kanban board."""

    BACKLOG = "backlog"
    TODO = "to do"
    IN_PROGRESS = "in progress"
    DONE = "done"
