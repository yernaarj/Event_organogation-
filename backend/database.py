import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Подключение к БД по URL из окружения,
# на Render.com он задаётся автоматически.
# Для локалки отступает sqlite:///./event.db
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./event.db"
)

engine = create_engine(
    DATABASE_URL,
    # check_same_thread нужен только для sqlite
    connect_args={"check_same_thread": False}
    if DATABASE_URL.startswith("sqlite")
    else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
