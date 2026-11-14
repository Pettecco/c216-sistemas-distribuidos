from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    name: str = Field(max_length=120)
    description: str | None = Field(None, max_length=500)
    done: bool = False


class Task(TaskCreate):
    id: int
