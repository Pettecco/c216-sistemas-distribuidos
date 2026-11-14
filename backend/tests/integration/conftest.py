import pytest
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import engine
from app.main import app


@pytest.fixture
def client() -> TestClient:
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE TABLE tasks RESTART IDENTITY"))
    return TestClient(app)
