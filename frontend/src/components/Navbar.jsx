import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">⚡</div>
        <span className="sidebar-logo-text">Task<span>Flow</span></span>
      </div>

      <p className="sidebar-section">Navigation</p>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="icon">📊</span> Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
        >
          <span className="icon">🗂️</span> Projects
        </NavLink>
      </nav>

      <div style={{ flex: 1 }} />

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sidebar-user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name}
          </div>
          <div className="sidebar-user-role">{user?.role === 'admin' ? '👑 Admin' : '👤 Member'}</div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={handleLogout}
          title="Logout"
          id="logout-btn"
        >
          🚪
        </button>
      </div>
    </aside>
  );
}
