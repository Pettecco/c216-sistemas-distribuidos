from app.api.schemas.task import Task, TaskCreate


class TaskService:
    def __init__(self) -> None:
        self._tasks: dict[int, Task] = {}
        self._next_id = 1

    def list_tasks(self) -> list[Task]:
        return list(self._tasks.values())

    def get_task(self, task_id: int) -> Task | None:
        return self._tasks.get(task_id)

    def create_task(self, data: TaskCreate) -> Task:
        task = Task(id=self._next_id, **data.model_dump())
        self._tasks[task.id] = task
        self._next_id += 1
        return task


task_service = TaskService()
