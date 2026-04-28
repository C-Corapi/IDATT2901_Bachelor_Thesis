from model.epic import Epic
from repository import epic_repository
from schemas.epic import EpicCreateModel

def test_get_all_empty(db_session):
    """Test that get_all returns empty list if DB is table is empty."""
    result = epic_repository.get_all(db_session)
    assert result == []

def test_get_all_with_data(db_session):
    """Test that get_all retrieves the stored epics."""
    epic1 = Epic(title="A1")
    epic2 = Epic(title="A2")

    db_session.add_all([epic1, epic2])
    db_session.commit()

    result = epic_repository.get_all(db_session)

    assert len(result) == 2
    assert {a.title for a in result} == {"A1", "A2"}

def test_get_by_id_found(db_session):
    """Test that get_by_id retrieves the epic."""
    epic = Epic(title="Test epic")
    db_session.add(epic)
    db_session.commit()

    result = epic_repository.get_by_id(db_session, epic.id)

    assert result is not None
    assert result.id == epic.id
    assert result.title == "Test epic"

def test_get_by_id_not_found(db_session):
    """Test that None is returned on invalid ID."""
    result = epic_repository.get_by_id(db_session, 999)
    assert result is None

def test_add_epic(db_session):
    """Test that new epic is stored."""
    epic_data = EpicCreateModel(title="New epic", description="Description")

    result = epic_repository.add(db_session, epic_data)

    assert result.id is not None
    assert result.title == "New epic"
    assert result.description == "Description"

    db_epic = db_session.query(Epic).first()
    assert db_epic is not None
    assert db_epic.title == "New epic"

def test_delete_existing_epic(db_session):
    """Test that delete returns True on delete and it deletes the epic."""
    epic = Epic(title="To Delete")
    db_session.add(epic)
    db_session.commit()

    result = epic_repository.delete(db_session, epic.id)

    assert result is True
    assert db_session.query(Epic).count() == 0

def test_delete_nonexistent_epic(db_session):
    """Test that delete returns False on invalid ID."""
    result = epic_repository.delete(db_session, 999)
    assert result is False


def test_update_epic(db_session):
    """Test that epics get updated and stored."""
    epic = Epic(title="Old Title")
    db_session.add(epic)
    db_session.commit()

    updated_data = EpicCreateModel(title="Updated Title",  description="Description")

    result = epic_repository.update(db_session, epic.id, updated_data)

    assert result is not None
    assert result.title == "Updated Title"

    db_epic = db_session.query(Epic).first()
    assert db_epic.title == "Updated Title"

def test_update_nonexistent_epic(db_session):
    """Test that update returns none if no epic matches the ID."""
    updated_data = EpicCreateModel(title="Updated", description="Description")

    result = epic_repository.update(db_session, 999, updated_data)

    assert result is None

def test_update_multiple_fields(db_session):
    """Test that all fields are updated."""
    epic = Epic(title="Old", description="Old desc")
    db_session.add(epic)
    db_session.commit()

    updated_data = EpicCreateModel(
        title="New",
        description="New desc"
    )

    result = epic_repository.update(db_session, epic.id, updated_data)

    assert result is not None
    assert result.title == "New"
    assert result.description == "New desc"
