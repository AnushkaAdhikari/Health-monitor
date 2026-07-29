from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from pathlib import Path
from dotenv import load_dotenv

# Always load the project's backend/.env file, even when Uvicorn is started
# from another folder or an old DATABASE_URL exists in the terminal session.
ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(ENV_FILE, override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://health_user:health_pass123@localhost/health_monitor")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
