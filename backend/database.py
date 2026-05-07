import os
from sqlmodel import create_engine, Session, SQLModel, select
from sqlalchemy import event

# Database file location
DB_FILE = "emergency_assessment.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

# Create engine
# check_same_thread=False is needed for SQLite with FastAPI
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    """Enable WAL mode for better concurrency and set other pragmas."""
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA busy_timeout=5000")  # 5 seconds
    cursor.close()

def init_db():
    """Initialize the database and create tables."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for getting a database session."""
    with Session(engine) as session:
        yield session
