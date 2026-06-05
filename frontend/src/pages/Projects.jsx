import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    client.get('/projects')
      .then(({ data }) => setProjects(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const createProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required.'); return; }
    setError(''); setSaving(true);
    try {
      await client.post('/projects', form);
      setForm({ name: '', description: '' });
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message || 'Failed to create project.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} you're part of</p>
        </div>
        {user?.role === 'admin' && (
          <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🗂️</div>
          <div className="empty-state-text">No projects yet</div>
          <div className="empty-state-sub">
            {user?.role === 'admin'
              ? 'Create your first project to get started.'
              : 'Ask an admin to add you to a project.'}
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link
              key={p._id}
              to={`/projects/${p._id}`}
              className="project-card"
              style={{ '--card-color': p.color }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: p.color, borderRadius: '16px 16px 0 0' }} />
              <div className="flex-between" style={{ marginBottom: 10 }}>
                <span
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${p.color}22`,
                    border: `1px solid ${p.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}
                >
                  🗂️
                </span>
                <span className={`badge badge-${p.status}`}>{p.status}</span>
              </div>
              <div className="project-card-name">{p.name}</div>
              <div className="project-card-desc">{p.description || 'No description provided.'}</div>

              <div className="project-card-progress">
                <div className="flex-between" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
                  <span>{p.completedCount}/{p.taskCount} tasks done</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="progress-bar-track">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${p.progress}%`, background: p.color }}
                  />
                </div>
              </div>

              <div className="project-card-footer">
                <div className="project-card-members">
                  {[p.owner, ...(p.members || []).map((m) => m.user)]
                    .slice(0, 4)
                    .map((u, i) => (
                      <div
                        key={i}
                        className="member-avatar-sm"
                        title={u?.name}
                        style={{ background: `linear-gradient(135deg, ${p.color}, var(--blue))` }}
                      >
                        {u?.name?.[0]?.toUpperCase()}
                      </div>
                    ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {(p.members?.length || 0) + 1} member{(p.members?.length || 0) !== 0 ? 's' : ''}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal
          title="Create New Project"
          onClose={() => { setShowModal(false); setError(''); }}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button id="save-project-btn" className="btn btn-primary" onClick={createProject} disabled={saving}>
                {saving ? 'Creating...' : 'Create Project'}
              </button>
            </>
          }
        >
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="form-label" htmlFor="proj-name">Project Name *</label>
            <input id="proj-name" className="form-input" name="name" placeholder="e.g. Website Redesign" value={form.name} onChange={handle} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="proj-desc">Description</label>
            <textarea id="proj-desc" className="form-textarea" name="description" placeholder="What is this project about?" value={form.description} onChange={handle} />
          </div>
        </Modal>
      )}
    </div>
  );
}
