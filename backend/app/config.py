import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg://postgres:postgres@localhost:5433/appdb",
)

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]


def _parse_origins(raw: str | None) -> list[str]:
    """Converte CORS_ORIGINS em uma lista de origens explícitas."""
    if not raw:
        return list(DEFAULT_CORS_ORIGINS)

    origins = [origin.strip() for origin in raw.split(",")]
    return [origin for origin in origins if origin]


# Nunca use "*": a origem permitida precisa ser explícita.
CORS_ORIGINS = _parse_origins(os.getenv("CORS_ORIGINS"))
