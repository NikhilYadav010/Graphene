import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import TaskCard from '../components/TaskCard';

const COLUMNS = [
  { key: 'todo', label: 'To Do', cls: 'kanban-todo' },
  { key: 'in_progress', label: 'In Progress', cls: 'kanban-inprogress' },
  { key: 'done', label: 'Done', cls: 'kanban-done' },
];

const EMPTY_TASK = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assigneeId: '' };

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditTask, setShowEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = project?.isAdmin
    ? project.isAdmin(user?._id)
    : project?.owner?._id === user?._id ||
      project?.members?.some((m) => m.user?._id === user?._id && m.role === 'admin');

  const loadProject = useCallback(async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        client.get(`/projects/${id}`),
        client.get(`/tasks/project/${id}`),
      ]);
      setProject(projRes.data.data);
      setTasks(taskRes.data.data);
    } catch {
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadProject();
    client.get('/projects/users').then(({ data }) => setUsers(data.data)).catch(() => {});
  }, [loadProject]);

  const taskHandle = (e) => setTaskForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) { setError('Title required'); return; }
    setSaving(true); setError('');
    try {
      await client.post(`/tasks/project/${id}`, { ...taskForm, assigneeId: taskForm.assigneeId || null });
      setTaskForm(EMPTY_TASK);
      setShowTaskModal(false);
      loadProject();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally { setSaving(false); }
  };

  const updateTask = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await client.put(`/tasks/${showEditTask._id}`, { ...taskForm, assigneeId: taskForm.assigneeId || null });
      setShowEditTask(null);
      loadProject();
    } catch (err) {
      setError(err.message || 'Failed to update task');
    } finally { setSaving(false); }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await client.delete(`/tasks/${taskId}`);
      setShowEditTask(null);
      loadProject();
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const updateStatus = async (taskId, status) => {
    try {
      await client.patch(`/tasks/${taskId}/status`, { status });
      loadProject();
    } catch (err) {
      alert(err.message || 'Cannot change status');
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) { setError('Email required'); return; }
    setSaving(true); setError('');
    try {
      await client.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      setMemberEmail(''); setMemberRole('member');
      setShowMemberModal(false);
      loadProject();
    } catch (err) {
      setError(err.message || 'Failed to add member');
    } finally { setSaving(false); }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await client.delete(`/projects/${id}/members/${userId}`);
      loadProject();
    } catch (err) {
      alert(err.message || 'Cannot remove member');
    }
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assigneeId: task.assignee?._id || '',
    });
    setShowEditTask(task);
    setError('');
  };

  const allMembers = project
    ? [{ user: project.owner, role: 'admin' }, ...(project.members || [])]
    : [];

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!project) return null;

  return (
    <div className="page fade-in">
      <div className="flex-between page-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: `${project.color}22`, border: `1px solid ${project.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🗂️</div>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem', marginBottom: 2 }}>{project.name}</h1>
            <p className="page-subtitle">{project.description || 'No description'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className={`badge badge-${project.status}`}>{project.status}</span>
          {isAdmin && (
            <button id="add-member-btn" className="btn btn-secondary btn-sm" onClick={() => { setShowMemberModal(true); setError(''); }}>
              👥 Add Member
            </button>
          )}
          <button id="add-task-btn" className="btn btn-primary btn-sm" onClick={() => { setShowTaskModal(true); setError(''); setTaskForm(EMPTY_TASK); }}>
            + Add Task
          </button>
        </div>
      </div>

      <div className="flex gap-2" style={{ marginBottom: 24, borderBottom: '1px solid var(--glass-border)', paddingBottom: 0 }}>
        {['board', 'members'].map((tab) => (
          <button
            key={tab}
            className={`btn btn-ghost ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={activeTab === tab ? { color: 'var(--accent-light)', borderBottom: '2px solid var(--accent)', borderRadius: 0 } : { borderRadius: 0 }}
          >
            {tab === 'board' ? '📋 Board' : '👥 Members'}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div className="kanban">
          {COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className={`kanban-col ${col.cls}`}>
                <div className="kanban-col-header">
                  <span>{col.label}</span>
                  <span className="kanban-col-count">{colTasks.length}</span>
                </div>
                <div className="kanban-tasks">
                  {colTasks.map((task) => (
                    <div key={task._id}>
                      <TaskCard task={task} onClick={openEditTask} />
                    </div>
                  ))}
                  {colTasks.length === 0 && (
                    <div className="empty-state" style={{ padding: '20px 0' }}>
                      <div className="empty-state-icon" style={{ fontSize: '1.5rem' }}>📭</div>
                      <div className="empty-state-sub">No tasks here</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'members' && (
        <div style={{ maxWidth: 600 }}>
          <div className="members-list">
            {allMembers.map(({ user: u, role }, i) => (
              <div key={i} className="member-row">
                <div className="member-info">
                  <div className="member-avatar" style={{ background: `linear-gradient(135deg, ${project.color}, var(--blue))` }}>
                    {u?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="member-name">{u?.name}</div>
                    <div className="member-email">{u?.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`badge badge-${role}`}>{role}</span>
                  {isAdmin && u?._id !== project.owner._id && u?._id !== user?._id && (
                    <button className="btn btn-danger btn-sm" onClick={() => removeMember(u._id)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <Modal
          title="Create Task"
          onClose={() => { setShowTaskModal(false); setError(''); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button id="save-task-btn" className="btn btn-primary" onClick={createTask} disabled={saving}>{saving ? 'Creating...' : 'Create Task'}</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <TaskForm form={taskForm} handle={taskHandle} users={allMembers} />
        </Modal>
      )}

      {showEditTask && (
        <Modal
          title="Edit Task"
          onClose={() => { setShowEditTask(null); setError(''); }}
          footer={
            <div className="flex-between w-full">
              {isAdmin && (
                <button className="btn btn-danger btn-sm" onClick={() => deleteTask(showEditTask._id)}>🗑 Delete</button>
              )}
              <div className="flex gap-2">
                {COLUMNS.filter((c) => c.key !== showEditTask.status).map((c) => (
                  <button
                    key={c.key}
                    className="btn btn-secondary btn-sm"
                    onClick={() => { updateStatus(showEditTask._id, c.key); setShowEditTask(null); }}
                  >
                    → {c.label}
                  </button>
                ))}
                <button className="btn btn-primary" onClick={updateTask} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </div>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <TaskForm form={taskForm} handle={taskHandle} users={allMembers} showStatus />
        </Modal>
      )}

      {showMemberModal && (
        <Modal
          title="Add Member"
          onClose={() => { setShowMemberModal(false); setError(''); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
              <button id="save-member-btn" className="btn btn-primary" onClick={addMember} disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="member-email">User Email</label>
            <input id="member-email" className="form-input" type="email" placeholder="user@example.com" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="member-role">Role</label>
            <select id="member-role" className="form-select" value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TaskForm({ form, handle, users, showStatus }) {
  return (
    <>
      <div className="form-group">
        <label className="form-label" htmlFor="tf-title">Title *</label>
        <input id="tf-title" className="form-input" name="title" placeholder="Task title" value={form.title} onChange={handle} required />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="tf-desc">Description</label>
        <textarea id="tf-desc" className="form-textarea" name="description" placeholder="Task details..." value={form.description} onChange={handle} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="tf-priority">Priority</label>
          <select id="tf-priority" className="form-select" name="priority" value={form.priority} onChange={handle}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        {showStatus && (
          <div className="form-group">
            <label className="form-label" htmlFor="tf-status">Status</label>
            <select id="tf-status" className="form-select" name="status" value={form.status} onChange={handle}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div className="form-group">
          <label className="form-label" htmlFor="tf-due">Due Date</label>
          <input id="tf-due" className="form-input" type="date" name="dueDate" value={form.dueDate} onChange={handle} />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="tf-assignee">Assign To</label>
          <select id="tf-assignee" className="form-select" name="assigneeId" value={form.assigneeId} onChange={handle}>
            <option value="">Unassigned</option>
            {users.map(({ user: u }) => u && (
              <option key={u._id} value={u._id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
