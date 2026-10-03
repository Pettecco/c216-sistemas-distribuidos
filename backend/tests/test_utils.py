import pytest

from utils import calculate, calculate_bmi, format_name, is_palindrome, validate_email


# ── Testes para calculate ─────────────────────────────────────────────────────


@pytest.mark.parametrize(
    "a, b, operation, expected",
    [
        (10, 5, "+", 15),
        (10, 5, "-", 5),
        (10, 5, "*", 50),
        (10, 5, "/", 2.0),
        (0, 5, "+", 5),
        (-3, 3, "+", 0),
    ],
)
def test_calculate_operations(a, b, operation, expected):
    assert calculate(a, b, operation) == expected


def test_calculate_division_by_zero():
    with pytest.raises(ZeroDivisionError):
        calculate(10, 0, "/")


def test_calculate_invalid_operation():
    with pytest.raises(ValueError, match="Operação inválida"):
        calculate(10, 5, "^")


# ── Testes para validate_email ────────────────────────────────────────────────


@pytest.mark.parametrize(
    "email, expected",
    [
        ("usuario@exemplo.com", True),
        ("test@mail.org", True),
        ("invalido", False),
        ("sem@dominio", False),
        ("@semnome.com", True),
    ],
)
def test_validate_email(email, expected):
    assert validate_email(email) == expected


def test_validate_email_type_error():
    with pytest.raises(TypeError, match="Email deve ser uma string"):
        validate_email(123)


# ── Testes para format_name ───────────────────────────────────────────────────


def test_format_name_valid():
    assert format_name("joão", "silva") == "João Silva"


def test_format_name_empty():
    with pytest.raises(ValueError, match="Nome e sobrenome não podem ser vazios"):
        format_name("", "silva")


def test_format_name_whitespace():
    with pytest.raises(ValueError):
        format_name("   ", "silva")


# ── Testes para is_palindrome ─────────────────────────────────────────────────


@pytest.mark.parametrize(
    "text, expected",
    [
        ("arara", True),
        ("ovo", True),
        ("hello", False),
        ("A cara rajada da jararaca", True),
        ("Roma é amor", True),
    ],
)
def test_is_palindrome(text, expected):
    assert is_palindrome(text) == expected


def test_is_palindrome_type_error():
    with pytest.raises(TypeError, match="O texto deve ser uma string"):
        is_palindrome(123)


# ── Testes para calculate_bmi ─────────────────────────────────────────────────


def test_calculate_bmi_normal():
    assert calculate_bmi(70, 1.75) == 22.86


def test_calculate_bmi_invalid_weight():
    with pytest.raises(ValueError, match="Peso e altura devem ser positivos"):
        calculate_bmi(-70, 1.75)


def test_calculate_bmi_invalid_height():
    with pytest.raises(ValueError):
        calculate_bmi(70, 0)
