"""Service layer for Kanban board operations."""

from sqlalchemy.orm import Session

from model.activity import Activity
from model.decision import Decision
from model.deliverable import Deliverable
from model.epic import Epic
from model.task import Task
from schemas.kanban import KanbanBoard, KanbanCard


def build_kanban_board(db: Session) -> KanbanBoard:
    """Builds the Kanban board data structure."""
    print("Building Kanban board...")
    activities: list[Activity] = db.query(Activity).all()
    decisions: list[Decision] = db.query(Decision).all()
    deliverables: list[Deliverable] = db.query(Deliverable).all()
    epics: list[Epic] = db.query(Epic).all()
    tasks: list[Task] = db.query(Task).all()

    board: KanbanBoard = KanbanBoard()

    for activity in activities:
        getattr(board, activity.kanban_status.value).append(map_activity_to_card(activity))

    for decision in decisions:
        getattr(board, decision.kanban_status.value).append(map_decision_to_card(decision))

    for deliverable in deliverables:
        getattr(board, deliverable.kanban_status.value).append(map_deliverable_to_card(deliverable))

    for epic in epics:
        getattr(board, epic.kanban_status.value).append(map_epic_to_card(epic))

    for task in tasks:
        getattr(board, task.kanban_status.value).append(map_task_to_card(task))

    return board


def update_kanban_card_in_db(card: KanbanCard, db: Session) -> KanbanCard:
    """Updates the kanban status of an element in the database."""
    element: Activity | Decision | Deliverable | Epic | Task | None = None

    if card.type == "Activity":
        element = db.query(Activity).filter(Activity.id == card.id).first()
    elif card.type == "Decision":
        element = db.query(Decision).filter(Decision.id == card.id).first()
    elif card.type == "Deliverable":
        element = db.query(Deliverable).filter(Deliverable.id == card.id).first()
    elif card.type == "Epic":
        element = db.query(Epic).filter(Epic.id == card.id).first()
    elif card.type == "Task":
        element = db.query(Task).filter(Task.id == card.id).first()
    else:
        raise ValueError(f"Unknown card type: {card.type}")

    if element is None:
        raise ValueError(f"Element with ID {card.id} not found in the database")

    element.kanban_status = card.kanban_status
    db.commit()
    db.refresh(element)

    return card


def map_activity_to_card(activity: Activity) -> KanbanCard:
    """Maps an Activity instance to a KanbanCard."""
    return KanbanCard(
        id=activity.id, title=activity.title, type="Activity", kanban_status=activity.kanban_status
    )


def map_decision_to_card(decision: Decision) -> KanbanCard:
    """Maps a Decision instance to a KanbanCard."""
    return KanbanCard(
        id=decision.id, title=decision.title, type="Decision", kanban_status=decision.kanban_status
    )


def map_deliverable_to_card(deliverable: Deliverable) -> KanbanCard:
    """Maps a Deliverable instance to a KanbanCard."""
    return KanbanCard(
        id=deliverable.id,
        title=deliverable.title,
        type="Deliverable",
        kanban_status=deliverable.kanban_status,
    )


def map_epic_to_card(epic: Epic) -> KanbanCard:
    """Maps an Epic instance to a KanbanCard."""
    return KanbanCard(id=epic.id, title=epic.name, type="Epic", kanban_status=epic.kanban_status)


def map_task_to_card(task: Task) -> KanbanCard:
    """Maps a Task instance to a KanbanCard."""
    return KanbanCard(id=task.id, title=task.name, type="Task", kanban_status=task.kanban_status)
