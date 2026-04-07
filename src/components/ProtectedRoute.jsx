import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Sidebar from './Sidebar';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, token } = useAuthStore();

  if (!token || !user) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roleHierarchy = { user: 0, manager: 1, admin: 2 };
    const userLevel = roleHierarchy[user.role] ?? 0;
    const requiredLevel = roleHierarchy[requiredRole] ?? 0;
    if (userLevel < requiredLevel) return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <div className="page-content fade-in">{children}</div>
      </div>
    </div>
  );
}
