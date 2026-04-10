"""Service layer for Kanban board operations."""

from sqlalchemy.orm import Session

from model.activity import Activity
from model.decision import Decision
from model.decision import Decision
from model.deliverable import Deliverable
from model.epic import Epic
from model.task import Task
from schemas.kanban_card import KanbanCard


def build_kanban_board(db: Session) -> dict[str, list[KanbanCard]]:
    """Builds the Kanban board data structure."""
    activities: list[Activity] = db.query(Activity).all()
    decisions: list[Decision] = db.query(Decision).all()
    deliverables: list[Deliverable] = db.query(Deliverable).all()
    epics: list[Epic] = db.query(Epic).all()
    task: list[Task] = db.query(Task).all()

    backlog_cards: list[KanbanCard] = []
    todo_cards: list[KanbanCard] = []
    in_progress_cards: list[KanbanCard] = []
    done_cards: list[KanbanCard] = []

    cards: dict[str, list[KanbanCard]] = {
        "backlog": backlog_cards,
        "todo": todo_cards,
        "in_progress": in_progress_cards,
        "done": done_cards
    }

    for a in activities:
        cards[a.kanban_status.value].append(map_activity_to_card(a))

    for d in decisions:
        cards[d.kanban_status.value].append(map_decision_to_card(d))

    for d in deliverables:
        cards[d.kanban_status.value].append(map_deliverable_to_card(d))

    for e in epics:
        cards[e.kanban_status.value].append(map_epic_to_card(e))

    for t in task:
        cards[t.kanban_status.value].append(map_task_to_card(t))

    return cards


def map_activity_to_card(activity: Activity) -> KanbanCard:
    """Maps an Activity instance to a KanbanCard."""
    return KanbanCard(
        id=activity.id,
        title=activity.name,
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
