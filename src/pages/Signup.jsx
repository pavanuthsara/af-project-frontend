import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '../api/authApi';
import useAuthStore from '../store/authStore';

export default function Signup() {
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await signup(form);
      setAuth(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🌱</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Create account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Join the BinWise community</p>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input name="name" className="form-input" placeholder="John Doe"
              value={form.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input name="email" type="email" className="form-input" placeholder="you@example.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input name="password" type="password" className="form-input" placeholder="Min. 8 characters"
              value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select name="role" className="form-select" value={form.role} onChange={handleChange}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}
            style={{ justifyContent: 'center', marginTop: '0.5rem' }}>
            {loading ? <span className="spinner" /> : '✨ Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
