import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCertificates } from '../api/quizApi';

export default function Certificates() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificates().then(r => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><span className="spinner" style={{ width: 48, height: 48 }} /></div>;

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">🏅 My Certificates</h1>
          <p className="page-subtitle">Badges and achievements you've earned</p>
        </div>
        <Link to="/quizzes" className="btn btn-secondary">← Back to Quizzes</Link>
      </div>

      {/* Eco-points banner */}
      <div className="card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(20,184,166,0.08))', border: '1px solid rgba(34,197,94,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ fontSize: '3.5rem' }}>🌿</div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-green)' }}>{data?.ecoPoints ?? 0}</div>
            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Total Eco-Points</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>+10 pts for each quiz passed</div>
          </div>
        </div>
      </div>

      {/* Badges */}
      {!data?.badges?.length ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎖️</div>
          <p>No badges yet — take a quiz to earn your first badge!</p>
          <Link to="/quizzes" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Go to Quizzes</Link>
        </div>
      ) : (
        <div className="grid-3">
          {data.badges.map((b, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '2rem 1.5rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(20,184,166,0.05))', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎖️</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{b.title}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Earned on {new Date(b.earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <span className="badge badge-green" style={{ marginTop: '0.75rem' }}>✓ Certified</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
