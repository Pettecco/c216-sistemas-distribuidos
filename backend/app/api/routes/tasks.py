from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query, status
from sqlalchemy.orm import Session

from app.api.schemas.task import Task, TaskCreate
from app.database import get_db
from app.repositories.task import TaskRepository
from app.services.task import TaskService

router = APIRouter(prefix="/tasks", tags=["tasks"])


def get_task_service(db: Annotated[Session, Depends(get_db)]) -> TaskService:
    return TaskService(TaskRepository(db))


ServiceDep = Annotated[TaskService, Depends(get_task_service)]
TaskId = Annotated[int, Path(ge=1, description="ID da tarefa")]


@router.get("", response_model=list[Task])
def list_tasks(
    service: ServiceDep,
    done: Annotated[
        bool | None, Query(description="Filtra por concluídas (true) ou pendentes")
    ] = None,
):
    return service.list_tasks(done=done)


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: TaskId, service: ServiceDep):
    return service.get_task(task_id)


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, service: ServiceDep):
    return service.create_task(data)


@router.put("/{task_id}", response_model=Task)
def replace_task(task_id: TaskId, data: TaskCreate, service: ServiceDep):
    return service.replace_task(task_id, data)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: TaskId, service: ServiceDep) -> None:
    service.delete_task(task_id)
