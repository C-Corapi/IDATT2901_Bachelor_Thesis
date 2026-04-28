from model.activity import Activity
from repository import activity_repository
from schemas.activity import ActivityCreateModel

def test_get_all_empty(db_session):
    """Test that get_all returns empty list if DB is table is empty."""
    result = activity_repository.get_all(db_session)
    assert result == []

def test_get_all_with_data(db_session):
    """Test that get_all retrieves the stored activities."""
    activity1 = Activity(title="A1")
    activity2 = Activity(title="A2")

    db_session.add_all([activity1, activity2])
    db_session.commit()

    result = activity_repository.get_all(db_session)

    assert len(result) == 2
    assert {a.title for a in result} == {"A1", "A2"}

def test_get_by_id_found(db_session):
    """Test that get_by_id retrieves the activity."""
    activity = Activity(title="Test Activity")
    db_session.add(activity)
    db_session.commit()

    result = activity_repository.get_by_id(db_session, activity.id)

    assert result is not None
    assert result.id == activity.id
    assert result.title == "Test Activity"

def test_get_by_id_not_found(db_session):
    """Test that None is returned on invalid ID."""
    result = activity_repository.get_by_id(db_session, 999)
    assert result is None

def test_add_activity(db_session):
    """Test that new activity is stored."""
    activity_data = ActivityCreateModel(title="New Activity")

    result = activity_repository.add(db_session, activity_data)

    assert result.id is not None
    assert result.title == "New Activity"

    db_activity = db_session.query(Activity).first()
    assert db_activity is not None
    assert db_activity.title == "New Activity"

def test_delete_existing_activity(db_session):
    """Test that delete returns True on delete and it deletes the activity."""
    activity = Activity(title="To Delete")
    db_session.add(activity)
    db_session.commit()

    result = activity_repository.delete(db_session, activity.id)

    assert result is True
    assert db_session.query(Activity).count() == 0

def test_delete_nonexistent_activity(db_session):
    """Test that delete returns False on invalid ID."""
    result = activity_repository.delete(db_session, 999)
    assert result is False


def test_update_activity(db_session):
    """Test that activities get updated and stored."""
    activity = Activity(title="Old Title")
    db_session.add(activity)
    db_session.commit()

    updated_data = ActivityCreateModel(title="Updated Title")

    result = activity_repository.update(db_session, activity.id, updated_data)

    assert result is not None
    assert result.title == "Updated Title"

    db_activity = db_session.query(Activity).first()
    assert db_activity.title == "Updated Title"

def test_update_nonexistent_activity(db_session):
    """Test that update returns none if no activity matches the ID."""
    updated_data = ActivityCreateModel(title="Updated")

    result = activity_repository.update(db_session, 999, updated_data)

    assert result is None

def test_update_multiple_fields(db_session):
    """Test that all fields are updated."""
    activity = Activity(title="Old", description="Old desc")
    db_session.add(activity)
    db_session.commit()

    updated_data = ActivityCreateModel(
        title="New",
        description="New desc"
    )

    result = activity_repository.update(db_session, activity.id, updated_data)

    assert result is not None
    assert result.title == "New"
    assert result.description == "New desc"
