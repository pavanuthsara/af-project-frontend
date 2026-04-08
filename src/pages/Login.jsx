import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, adminLogin } from '../api/authApi';
import useAuthStore from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ email: '', password: '', isAdmin: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const fn = form.isAdmin ? adminLogin : login;
      const { data } = await fn({ email: form.email, password: form.password });
      console.log("Backend response:", data);
      setAuth(data.user, data.token);
      console.log(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌿</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Sign in to your BinWise account</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={handleChange} required />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={form.isAdmin}
              onChange={e => setForm(f => ({ ...f, isAdmin: e.target.checked }))}
              style={{ width: 16, height: 16, accentColor: 'var(--accent-green)' }} />
            Sign in as Admin
          </label>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" /> : '🚀 Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
