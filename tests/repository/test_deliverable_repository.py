"""Tests for deliverable repository."""

from model.deliverable import Deliverable
from repository import deliverable_repository
from schemas.deliverable import DeliverableCreateModel


def test_get_all_empty(db_session):
    """Test that get_all returns empty list if DB is table is empty."""
    result = deliverable_repository.get_all(db_session)
    assert result == []


def test_get_all_with_data(db_session):
    """Test that get_all retrieves the stored deliverables."""
    deliverable1 = Deliverable(title="A1")
    deliverable2 = Deliverable(title="A2")

    db_session.add_all([deliverable1, deliverable2])
    db_session.commit()

    result = deliverable_repository.get_all(db_session)

    assert len(result) == 2
    assert {a.title for a in result} == {"A1", "A2"}


def test_get_by_id_found(db_session):
    """Test that get_by_id retrieves the deliverable."""
    deliverable = Deliverable(title="Test deliverable")
    db_session.add(deliverable)
    db_session.commit()

    result = deliverable_repository.get_by_id(db_session, deliverable.id)

    assert result is not None
    assert result.id == deliverable.id
    assert result.title == "Test deliverable"


def test_get_by_id_not_found(db_session):
    """Test that None is returned on invalid ID."""
    result = deliverable_repository.get_by_id(db_session, 999)
    assert result is None


def test_add_deliverable(db_session):
    """Test that new deliverable is stored."""
    deliverable_data = DeliverableCreateModel(title="New deliverable")

    result = deliverable_repository.add(db_session, deliverable_data)

    assert result.id is not None
    assert result.title == "New deliverable"

    db_deliverable = db_session.query(Deliverable).first()
    assert db_deliverable is not None
    assert db_deliverable.title == "New deliverable"


def test_delete_existing_deliverable(db_session):
    """Test that delete returns True on delete and it deletes the deliverable."""
    deliverable = Deliverable(title="To Delete")
    db_session.add(deliverable)
    db_session.commit()

    result = deliverable_repository.delete(db_session, deliverable.id)

    assert result is True
    assert db_session.query(Deliverable).count() == 0


def test_delete_nonexistent_deliverable(db_session):
    """Test that delete returns False on invalid ID."""
    result = deliverable_repository.delete(db_session, 999)
    assert result is False


def test_update_deliverable(db_session):
    """Test that deliverables get updated and stored."""
    deliverable = Deliverable(title="Old Title")
    db_session.add(deliverable)
    db_session.commit()

    updated_data = DeliverableCreateModel(title="Updated Title")

    result = deliverable_repository.update(db_session, deliverable.id, updated_data)

    assert result is not None
    assert result.title == "Updated Title"

    db_deliverable = db_session.query(Deliverable).first()
    assert db_deliverable.title == "Updated Title"


def test_update_nonexistent_deliverable(db_session):
    """Test that update returns none if no deliverable matches the ID."""
    updated_data = DeliverableCreateModel(title="Updated")

    result = deliverable_repository.update(db_session, 999, updated_data)

    assert result is None


def test_update_multiple_fields(db_session):
    """Test that all fields are updated."""
    deliverable = Deliverable(title="Old")
    db_session.add(deliverable)
    db_session.commit()

    updated_data = DeliverableCreateModel(
        title="New",
    )

    result = deliverable_repository.update(db_session, deliverable.id, updated_data)

    assert result is not None
    assert result.title == "New"
