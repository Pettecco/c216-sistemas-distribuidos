from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.task import TaskModel


class TaskRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list(self, done: bool | None = None) -> list[TaskModel]:
        statement = select(TaskModel).order_by(TaskModel.id)
        if done is not None:
            statement = statement.where(TaskModel.done == done)
        return list(self._session.scalars(statement))

    def get(self, task_id: int) -> TaskModel | None:
        return self._session.get(TaskModel, task_id)

    def create(self, data: dict) -> TaskModel:
        task = TaskModel(**data)
        self._session.add(task)
        self._session.commit()
        self._session.refresh(task)
        return task

    def update(self, task: TaskModel, changes: dict) -> TaskModel:
        for field, value in changes.items():
            setattr(task, field, value)
        self._session.commit()
        self._session.refresh(task)
        return task

    def delete(self, task: TaskModel) -> None:
        self._session.delete(task)
        self._session.commit()
