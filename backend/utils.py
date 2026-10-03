def calculate(a: float, b: float, operation: str) -> float:
    """Perform basic arithmetic operations."""
    operations = {
        "+": lambda x, y: x + y,
        "-": lambda x, y: x - y,
        "*": lambda x, y: x * y,
        "/": lambda x, y: x / y,
    }
    if operation not in operations:
        raise ValueError(f"Operação inválida: {operation}. Use: +, -, *, /")
    return operations[operation](a, b)


def validate_email(email: str) -> bool:
    """Validate email format."""
    if not isinstance(email, str):
        raise TypeError("Email deve ser uma string")
    if "@" not in email or "." not in email.split("@")[-1]:
        return False
    return True


def format_name(first: str, last: str) -> str:
    """Format a full name."""
    if not first.strip() or not last.strip():
        raise ValueError("Nome e sobrenome não podem ser vazios")
    return f"{first.strip().title()} {last.strip().title()}"


def is_palindrome(text: str) -> bool:
    """Check if a string is a palindrome (case-insensitive, ignoring spaces)."""
    if not isinstance(text, str):
        raise TypeError("O texto deve ser uma string")
    cleaned = text.lower().replace(" ", "")
    return cleaned == cleaned[::-1]


def calculate_bmi(weight: float, height: float) -> float:
    """Calculate Body Mass Index."""
    if weight <= 0 or height <= 0:
        raise ValueError("Peso e altura devem ser positivos")
    return round(weight / (height**2), 2)
