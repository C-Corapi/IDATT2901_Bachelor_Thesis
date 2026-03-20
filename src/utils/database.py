"""Database utilities for setting up SQLAlchemy engine, session, and base model."""

import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

load_dotenv()

# Temporary db for testing. Should be loaded from env with postgres later.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models. All models should inherit from this class."""
    pass


def get_db():
    """Dependency that provides a database session to API routes."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
