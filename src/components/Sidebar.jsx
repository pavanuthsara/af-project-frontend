import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const navItems = [
  { to: '/', icon: '🏠', label: 'Dashboard', roles: ['user', 'admin', 'manager'] },
  { to: '/identify', icon: '🔍', label: 'Identify Waste', roles: ['user', 'admin', 'manager'] },
  { to: '/waste', icon: '♻️', label: 'Waste Library', roles: ['user', 'admin', 'manager'] },
  { to: '/disposal', icon: '📋', label: 'Disposal Log', roles: ['user', 'admin', 'manager'] },
  { to: '/quizzes', icon: '🎓', label: 'Quizzes', roles: ['user', 'admin', 'manager'] },
  { to: '/centres', icon: '📍', label: 'Recycle Centres', roles: ['user', 'admin', 'manager'] },
];

const adminItems = [
  { to: '/admin', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const role = user?.role || 'user';

  const visible = navItems.filter(i => i.roles.includes(role));
  const adminVisible = adminItems.filter(i => i.roles.includes(role));

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo-icon">🌿</div>
        <div>
          <div className="sidebar-logo-text">EcoWaste</div>
          <div className="sidebar-logo-sub">Manager</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Navigation</div>
          {visible.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        {adminVisible.length > 0 && (
          <div className="nav-section">
            <div className="nav-section-label">Admin</div>
            {adminVisible.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <div className="sidebar-footer">
        <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
          <span className={`badge badge-${role === 'admin' ? 'red' : role === 'manager' ? 'teal' : 'green'}`} style={{ marginTop: '0.4rem' }}>
            {role}
          </span>
        </div>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
