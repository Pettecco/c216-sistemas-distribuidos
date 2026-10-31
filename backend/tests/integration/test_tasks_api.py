from fastapi.testclient import TestClient

from app.main import app


def test_crud_persists_in_postgres(client):
    created = client.post(
        "/tasks", json={"name": "Estudar", "description": "SQLAlchemy"}
    )
    assert created.status_code == 201
    task = created.json()
    assert task == {
        "id": 1,
        "name": "Estudar",
        "description": "SQLAlchemy",
        "done": False,
    }

    assert client.get("/tasks").json() == [task]
    assert client.get("/tasks/1").json() == task
    assert client.get("/tasks/99").status_code == 404

    updated = client.put("/tasks/1", json={"name": "Estudar", "done": True})
    assert updated.status_code == 200
    assert updated.json() == {
        "id": 1,
        "name": "Estudar",
        "description": None,
        "done": True,
    }

    assert client.delete("/tasks/1").status_code == 204
    assert client.get("/tasks/1").status_code == 404


def test_data_survives_a_new_client(client):
    client.post("/tasks", json={"name": "Persistir"})

    with TestClient(app) as other_client:
        assert other_client.get("/tasks").json()[0]["name"] == "Persistir"


def test_filter_by_done(client):
    client.post("/tasks", json={"name": "Pendente"})
    client.post("/tasks", json={"name": "Concluída", "done": True})

    done = client.get("/tasks", params={"done": True}).json()
    pending = client.get("/tasks", params={"done": False}).json()

    assert [task["name"] for task in done] == ["Concluída"]
    assert [task["name"] for task in pending] == ["Pendente"]
    assert client.get("/tasks", params={"done": "abc"}).status_code == 422


def test_create_validates_payload(client):
    response = client.post("/tasks", json={"description": "sem nome"})
    assert response.status_code == 422
