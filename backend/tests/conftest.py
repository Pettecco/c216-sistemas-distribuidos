import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Fixture que fornece um TestClient para a aplicação FastAPI."""
    return TestClient(app)


@pytest.fixture
def sample_calculation():
    """Fixture com dados de exemplo para cálculos."""
    return {"a": 10, "b": 5, "operation": "+"}


@pytest.fixture
def sample_email():
    """Fixture com email válido de exemplo."""
    return "usuario@exemplo.com"
