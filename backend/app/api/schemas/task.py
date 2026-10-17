from pydantic import BaseModel


class TaskCreate(BaseModel):
    name: str
    description: str | None = None
    done: bool = False


class Task(TaskCreate):
    id: int
