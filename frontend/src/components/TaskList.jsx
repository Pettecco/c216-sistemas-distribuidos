import { TaskItem } from "./TaskItem.jsx";

export function TaskList({ tasks, onToggle, onRemove }) {
  return (
    <ul aria-label="Tarefas" className="divide-y divide-slate-900/10">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
