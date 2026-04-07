import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDisposalStats, getWasteStats } from '../api/disposalApi';
import { getCertificates } from '../api/quizApi';
import useAuthStore from '../store/authStore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#22c55e', '#14b8a6', '#84cc16', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [wasteStats, setWasteStats] = useState([]);
  const [certs, setCerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getDisposalStats(),
      getWasteStats(),
      getCertificates(),
    ]).then(([s, w, c]) => {
      if (s.status === 'fulfilled') setStats(s.value.data.data);
      if (w.status === 'fulfilled') setWasteStats(w.value.data.data || []);
      if (c.status === 'fulfilled') setCerts(c.value.data.data);
      setLoading(false);
    });
  }, []);

  const methodData = stats?.byMethod
    ? Object.entries(stats.byMethod).map(([k, v]) => ({ name: k, value: v }))
    : [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good morning, <span className="text-gradient">{user?.name?.split(' ')[0]} 👋</span>
        </h1>
        <p className="page-subtitle">Here's your eco-impact at a glance</p>
      </div>

      {/* Eco-points strip */}
      {certs && (
        <div className="card" style={{ marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(20,184,166,0.08))', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div className="flex-between">
            <div className="flex-gap">
              <span style={{ fontSize: '2rem' }}>🏅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{certs.ecoPoints || 0} Eco-Points</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{certs.badges?.length || 0} badges earned</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {certs.badges?.slice(0, 3).map((b, i) => (
                <span key={i} className="badge badge-green" style={{ fontSize: '0.75rem' }}>🎖 {b.title?.replace('Certified: ', '')}</span>
              ))}
            </div>
            <Link to="/quizzes/certificates" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : (
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-green)' }}>
              {stats?.totalCo2Saved?.toFixed(2) ?? '0'} <span style={{ fontSize: '0.9rem' }}>kg</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>CO₂ Saved</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⚖️</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-teal)' }}>
              {stats?.totalWeight?.toFixed(1) ?? '0'} <span style={{ fontSize: '0.9rem' }}>kg</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total Recycled</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>♻️</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-lime)' }}>
              {stats?.totalDisposals ?? '0'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Disposal Events</div>
          </div>
          <div className="stat-card">
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏅</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)' }}>
              {certs?.ecoPoints ?? '0'}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Eco-Points</div>
          </div>
        </div>
      )}

      {/* Charts + Quick Actions */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        {/* Disposal method chart */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Disposal Methods</h3>
          {methodData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={methodData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {methodData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">📊</div>
              <p>No disposal data yet</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {methodData.map((d, i) => (
              <span key={d.name} className="badge" style={{ background: `${COLORS[i]}22`, color: COLORS[i], border: `1px solid ${COLORS[i]}44` }}>
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link to="/identify" className="btn btn-primary" style={{ justifyContent: 'center', padding: '1rem' }}>
              🔍 Identify Waste with AI
            </Link>
            <Link to="/disposal" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '1rem' }}>
              📋 Log a Disposal
            </Link>
            <Link to="/quizzes" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '1rem' }}>
              🎓 Take a Quiz &amp; Earn Points
            </Link>
            <Link to="/centres" className="btn btn-secondary" style={{ justifyContent: 'center', padding: '1rem' }}>
              📍 Find Recycle Centres
            </Link>
          </div>
        </div>
      </div>

      {/* Top waste items */}
      {wasteStats.length > 0 && (
        <div className="card">
          <div className="flex-between" style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>Top Disposed Items</h3>
            <Link to="/disposal" className="btn btn-secondary btn-sm">View History →</Link>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Item</th><th>Disposals</th><th>Weight (kg)</th><th>CO₂ Saved (kg)</th><th>Method</th>
              </tr></thead>
              <tbody>
                {wasteStats.slice(0, 5).map((w, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{w.wasteName}</td>
                    <td>{w.totalDisposals}</td>
                    <td>{w.totalWeight?.toFixed(2)}</td>
                    <td><span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{w.totalCo2Saved?.toFixed(2)}</span></td>
                    <td><span className="badge badge-green">{w.disposalMethod}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
