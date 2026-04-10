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
    print(f"Deliverables: {deliverables}")
    epics: list[Epic] = db.query(Epic).all()
    task: list[Task] = db.query(Task).all()

    board: KanbanBoard = KanbanBoard()

    for a in activities:
        getattr(board, a.kanban_status.value).append(map_activity_to_card(a))
        
    for d in decisions:
        getattr(board, d.kanban_status.value).append(map_decision_to_card(d))

    for d in deliverables:
        print(f"Mapping deliverable to card: {d}")
        getattr(board, d.kanban_status.value).append(map_deliverable_to_card(d))

    for e in epics:
        getattr(board, e.kanban_status.value).append(map_epic_to_card(e))

    for t in task:
        getattr(board, t.kanban_status.value).append(map_task_to_card(t))

    return board


def map_activity_to_card(activity: Activity) -> KanbanCard:
    """Maps an Activity instance to a KanbanCard."""
    return KanbanCard(
        id=activity.id,
        title=activity.title,
        type="Activity",
        kanban_status=activity.kanban_status.value
    )

def map_decision_to_card(decision: Decision) -> KanbanCard:
    """Maps a Decision instance to a KanbanCard."""
    return KanbanCard(
        id=decision.id,
        title=decision.title,
        type="Decision",
        kanban_status=decision.kanban_status.value
    )


def map_deliverable_to_card(deliverable: Deliverable) -> KanbanCard:
    """Maps a Deliverable instance to a KanbanCard."""
    return KanbanCard(
        id=deliverable.id,
        title=deliverable.title,
        type="Deliverable",
        kanban_status=deliverable.kanban_status.value
    )


def map_epic_to_card(epic: Epic) -> KanbanCard:
    """Maps an Epic instance to a KanbanCard."""
    return KanbanCard(
        id=epic.id,
        title=epic.name,
        type="Epic",
        kanban_status=epic.kanban_status.value
    )


def map_task_to_card(task: Task) -> KanbanCard:
    """Maps a Task instance to a KanbanCard."""
    return KanbanCard(
        id=task.id,
        title=task.name,
        type="Task",
        kanban_status=task.kanban_status.value
    )
