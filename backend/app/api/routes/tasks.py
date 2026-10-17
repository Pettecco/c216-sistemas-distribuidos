from fastapi import APIRouter, HTTPException, status

from app.api.schemas.task import Task, TaskCreate
from app.services.task import task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=list[Task])
def list_tasks():
    return task_service.list_tasks()


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int):
    task = task_service.get_task(task_id)
    if task is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tarefa não encontrada")
    return task


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate):
    return task_service.create_task(data)
