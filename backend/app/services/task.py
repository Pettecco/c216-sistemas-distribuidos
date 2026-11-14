from fastapi import HTTPException, status

from app.api.schemas.task import Task, TaskCreate
from app.models.task import TaskModel
from app.repositories.task import TaskRepository


class TaskService:
    def __init__(self, repository: TaskRepository) -> None:
        self._repository = repository

    @staticmethod
    def _to_schema(task: TaskModel) -> Task:
        return Task(
            id=task.id,
            name=task.name,
            description=task.description,
            done=task.done,
        )

    def list_tasks(self, done: bool | None = None) -> list[Task]:
        return [self._to_schema(task) for task in self._repository.list(done)]

    def _get_or_404(self, task_id: int) -> TaskModel:
        task = self._repository.get(task_id)
        if task is None:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Tarefa não encontrada")
        return task

    def get_task(self, task_id: int) -> Task:
        return self._to_schema(self._get_or_404(task_id))

    def create_task(self, data: TaskCreate) -> Task:
        return self._to_schema(self._repository.create(data.model_dump()))

    def replace_task(self, task_id: int, data: TaskCreate) -> Task:
        task = self._get_or_404(task_id)
        return self._to_schema(self._repository.update(task, data.model_dump()))

    def delete_task(self, task_id: int) -> None:
        self._repository.delete(self._get_or_404(task_id))
