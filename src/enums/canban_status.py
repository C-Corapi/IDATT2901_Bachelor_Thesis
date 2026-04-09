from enum import Enum

class CanbanStatus(str, Enum):
    """Enum representing the possible statuses of an element of a Kanban board."""

    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    DONE = "Done"
