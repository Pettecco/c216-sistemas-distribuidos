from typing import Annotated

from fastapi import APIRouter, HTTPException, Path, Query, status

from app.api.schemas.task import Task, TaskCreate
from app.services.task import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[Task])
def list_tasks(
    done: Annotated[
        bool | None, Query(description="Filtra por concluídas (true) ou pendentes")
    ] = None,
):
    return task_service.list_tasks(done=done)


@router.get("/{task_id}", response_model=Task)
def get_task(
    task_id: Annotated[int, Path(ge=1, description="ID da tarefa")],
):
    task = task_service.get_task(task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tarefa não encontrada")
    return task


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate):
    return task_service.create_task(data)
