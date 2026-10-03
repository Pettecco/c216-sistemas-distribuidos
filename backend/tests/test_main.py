def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_calculate_endpoint(client):
    response = client.get("/calculate", params={"a": 10, "b": 5, "operation": "+"})
    assert response.status_code == 200
    assert response.json()["result"] == 15


def test_calculate_endpoint_invalid_operation(client):
    response = client.get("/calculate?a=10&b=5&operation=^")
    assert response.status_code == 400


def test_calculate_endpoint_division_by_zero(client):
    response = client.get("/calculate?a=10&b=0&operation=/")
    assert response.status_code == 400


def test_validate_email_endpoint_valid(client):
    response = client.get("/validate-email?email=test@example.com")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is True


def test_validate_email_endpoint_invalid(client):
    response = client.get("/validate-email?email=invalid")
    assert response.status_code == 200
    data = response.json()
    assert data["valid"] is False


def test_palindrome_endpoint(client):
    response = client.get("/palindrome?text=arara")
    assert response.status_code == 200
    assert response.json()["is_palindrome"] is True


def test_bmi_endpoint(client):
    response = client.get("/bmi?weight=70&height=1.75")
    assert response.status_code == 200
    assert response.json()["bmi"] == 22.86


def test_bmi_endpoint_invalid(client):
    response = client.get("/bmi?weight=-70&height=1.75")
    assert response.status_code == 400


def test_nonexistent_endpoint(client):
    response = client.get("/nonexistent")
    assert response.status_code == 404
