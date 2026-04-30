"""Module for custom exceptions."""


class ActivityNotFound(Exception):
    """Exception raised when an activity is not found in the database."""

    pass


class DecisionNotFound(Exception):
    """Exception raised when a decision is not found in the database."""

    pass


class EpicNotFound(Exception):
    """Exception raised when an epic is not found in the database."""

    pass


class TaskNotFound(Exception):
    """Exception raised when a task is not found in the database."""

    pass


class DeliverableNotFound(Exception):
    """Exception raised when a deliverable is not found in the database."""

    pass
