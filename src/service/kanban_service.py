from sqlalchemy.orm import Session

from model.activity import Activity
from model.decision import Decision
from model.decision import Decision
from model.deliverable import Deliverable
from model.epic import Epic
from model.task import Task
from schemas.kanban_card import KanbanCard


def build_kanban_board(db: Session) -> [KanbanCard]:
    """Builds the Kanban board data structure."""
    # This function will gather all epics, deliverables, and tasks,
    # and organize them into a structure suitable for the frontend.
    # The exact implementation will depend on how you want to structure
    # the data for the frontend, but it will likely involve nested dictionaries
    # or lists to represent the hierarchy of epics, deliverables, and tasks.
    
    activities: list[Activity] = db.query(Activity).all()
    decisions: list[Decision] = db.query(Decision).all()
    deliverables: list[Deliverable] = db.query(Deliverable).all()
    epics: list[Epic] = db.query(Epic).all()
    task: list[Task] = db.query(Task).all()

    cards: list[KanbanCard] = []

    cards += [map_activity_to_card(a) for a in activities]
    cards += [map_decision_to_card(d) for d in decisions]
    cards += [map_deliverable_to_card(d) for d in deliverables]
    cards += [map_epic_to_card(e) for e in epics]
    cards += [map_task_to_card(t) for t in task]

    return cards


def map_activity_to_card(activity: Activity) -> KanbanCard:
    """Maps an Activity instance to a KanbanCard."""
    return KanbanCard(
        id=activity.id,
        title=activity.name,
        type="Activity",
        canban_status=activity.canban_status.value
    )

def map_decision_to_card(decision: Decision) -> KanbanCard:
    """Maps a Decision instance to a KanbanCard."""
    return KanbanCard(
        id=decision.id,
        title=decision.name,
        type="Decision",
        canban_status=decision.canban_status.value
    )


def map_deliverable_to_card(deliverable) -> KanbanCard:
    """Maps a Deliverable instance to a KanbanCard."""
    return KanbanCard(
        id=deliverable.id,
        title=deliverable.title,
        type="Deliverable",
        canban_status=deliverable.canban_status.value
    )


def map_epic_to_card(epic) -> KanbanCard:
    """Maps an Epic instance to a KanbanCard."""
    return KanbanCard(
        id=epic.id,
        title=epic.name,
        type="Epic",
        canban_status=epic.canban_status.value
    )


def map_task_to_card(task) -> KanbanCard:
    """Maps a Task instance to a KanbanCard."""
    return KanbanCard(
        id=task.id,
        title=task.name,
        type="Task",
        canban_status=task.canban_status.value
    )
