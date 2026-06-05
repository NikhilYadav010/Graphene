import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const StatCard = ({ icon, label, value, colorClass }) => (
  <div className={`stat-card ${colorClass}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/dashboard')
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" />
    </div>
  );

  const { stats, myTasks, recentTasks } = data || {};

  return (
    <div className="page fade-in">
      <div className="page-header flex-between">
        <div>
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <span className={`badge badge-${user?.role}`}>{user?.role}</span>
      </div>

      <div className="stats-grid">
        <StatCard icon="🗂️" label="Total Projects" value={stats?.totalProjects ?? 0} colorClass="stat-card-purple" />
        <StatCard icon="📋" label="Total Tasks" value={stats?.totalTasks ?? 0} colorClass="stat-card-blue" />
        <StatCard icon="✅" label="Completed" value={stats?.doneCount ?? 0} colorClass="stat-card-green" />
        <StatCard icon="⚡" label="In Progress" value={stats?.inProgressCount ?? 0} colorClass="stat-card-amber" />
        <StatCard icon="🔴" label="Overdue" value={stats?.overdueCount ?? 0} colorClass="stat-card-red" />
      </div>

      {stats?.totalTasks > 0 && (
        <div className="card card-pad mb-4" style={{ marginBottom: 24 }}>
          <div className="flex-between mb-4">
            <h3>Overall Progress</h3>
            <span className="text-muted text-sm">
              {stats.doneCount} / {stats.totalTasks} tasks done
            </span>
          </div>
          <div className="progress-bar-track" style={{ height: 8 }}>
            <div
              className="progress-bar-fill"
              style={{
                width: `${Math.round((stats.doneCount / stats.totalTasks) * 100)}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--blue))',
              }}
            />
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card card-pad">
          <div className="flex-between" style={{ marginBottom: 16 }}>
            <h3>My Assigned Tasks</h3>
            <span className="badge badge-in_progress">{myTasks?.length ?? 0} open</span>
          </div>
          {myTasks?.length > 0 ? (
            myTasks.map((task) => (
              <div key={task._id} style={{ marginBottom: 8 }}>
                <Link to={`/projects/${task.project._id}`} style={{ textDecoration: 'none' }}>
                  <TaskCard task={task} />
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">🎉</div>
              <div className="empty-state-text">All clear!</div>
              <div className="empty-state-sub">No tasks assigned to you</div>
            </div>
          )}
        </div>

        <div className="card card-pad">
          <h3 style={{ marginBottom: 16 }}>Recent Activity</h3>
          {recentTasks?.length > 0 ? (
            recentTasks.map((task) => (
              <div key={task._id} style={{ marginBottom: 8 }}>
                <Link to={`/projects/${task.project._id}`} style={{ textDecoration: 'none' }}>
                  <TaskCard task={task} />
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '30px 0' }}>
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-text">No recent tasks</div>
              <div className="empty-state-sub">Create a project to get started</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
