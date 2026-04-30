"""Tests for decision repository."""

from model.decision import Decision
from repository import decision_repository
from schemas.decision import DecisionCreateModel


def test_get_all_empty(db_session):
    """Test that get_all returns empty list if DB is table is empty."""
    result = decision_repository.get_all(db_session)
    assert result == []


def test_get_all_with_data(db_session):
    """Test that get_all retrieves the stored decisions."""
    decision1 = Decision(title="A1")
    decision2 = Decision(title="A2")

    db_session.add_all([decision1, decision2])
    db_session.commit()

    result = decision_repository.get_all(db_session)

    assert len(result) == 2
    assert {a.title for a in result} == {"A1", "A2"}


def test_get_by_id_found(db_session):
    """Test that get_by_id retrieves the decision."""
    decision = Decision(title="Test decision")
    db_session.add(decision)
    db_session.commit()

    result = decision_repository.get_by_id(db_session, decision.id)

    assert result is not None
    assert result.id == decision.id
    assert result.title == "Test decision"


def test_get_by_id_not_found(db_session):
    """Test that None is returned on invalid ID."""
    result = decision_repository.get_by_id(db_session, 999)
    assert result is None


def test_add_decision(db_session):
    """Test that new decision is stored."""
    decision_data = DecisionCreateModel(title="New decision", description="Description")

    result = decision_repository.add(db_session, decision_data)

    assert result.id is not None
    assert result.title == "New decision"
    assert result.description == "Description"

    db_decision = db_session.query(Decision).first()
    assert db_decision is not None
    assert db_decision.title == "New decision"


def test_delete_existing_decision(db_session):
    """Test that delete returns True on delete and it deletes the decision."""
    decision = Decision(title="To Delete")
    db_session.add(decision)
    db_session.commit()

    result = decision_repository.delete(db_session, decision.id)

    assert result is True
    assert db_session.query(Decision).count() == 0


def test_delete_nonexistent_decision(db_session):
    """Test that delete returns False on invalid ID."""
    result = decision_repository.delete(db_session, 999)
    assert result is False


def test_update_decision(db_session):
    """Test that decisions get updated and stored."""
    decision = Decision(title="Old Title")
    db_session.add(decision)
    db_session.commit()

    updated_data = DecisionCreateModel(title="Updated Title", description="Description")

    result = decision_repository.update(db_session, decision.id, updated_data)

    assert result is not None
    assert result.title == "Updated Title"

    db_decision = db_session.query(Decision).first()
    assert db_decision.title == "Updated Title"


def test_update_nonexistent_decision(db_session):
    """Test that update returns none if no decision matches the ID."""
    updated_data = DecisionCreateModel(title="Updated", description="Description")

    result = decision_repository.update(db_session, 999, updated_data)

    assert result is None


def test_update_multiple_fields(db_session):
    """Test that all fields are updated."""
    decision = Decision(title="Old", description="Old desc")
    db_session.add(decision)
    db_session.commit()

    updated_data = DecisionCreateModel(title="New", description="New desc")

    result = decision_repository.update(db_session, decision.id, updated_data)

    assert result is not None
    assert result.title == "New"
    assert result.description == "New desc"
