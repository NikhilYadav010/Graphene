const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };
const PRIORITY_COLORS = { low: 'var(--green)', medium: 'var(--amber)', high: 'var(--red)' };

export default function TaskCard({ task, onClick }) {
  const isOverdue = task.isOverdue || (task.dueDate && task.status !== 'done' && new Date() > new Date(task.dueDate));

  const initials = task.assignee?.name
    ? task.assignee.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const dueLabel = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      className={`task-card ${isOverdue ? 'overdue' : ''}`}
      onClick={() => onClick && onClick(task)}
      style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority] || 'transparent'}` }}
    >
      <div className="task-card-title">{task.title}</div>
      <div className="task-card-meta">
        <span className={`badge badge-${task.priority}`}>{task.priority}</span>
        {isOverdue && <span className="badge badge-overdue">Overdue</span>}
      </div>
      {task.assignee && (
        <div className="task-card-assignee">
          <div className="task-card-avatar">{initials}</div>
          {task.assignee.name}
        </div>
      )}
      {dueLabel && (
        <div className={`task-card-due ${isOverdue ? 'overdue' : ''}`}>
          📅 Due {dueLabel}
        </div>
      )}
    </div>
  );
}
