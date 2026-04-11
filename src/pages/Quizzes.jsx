import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes, createQuiz, addQuestion, deleteQuestion } from '../api/quizApi';
import useAuthStore from '../store/authStore';

const DIFFICULTY_COLOR = { Beginner: 'green', Intermediate: 'yellow', Advanced: 'red' };

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Quizzes() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizModal, setQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', difficulty: 'Beginner', passingScore: 60 });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    getQuizzes()
      .then(r => {
        // API may return a bare array, { data: [] }, { quizzes: [] }, etc.
        const raw = r.data;
        const list = Array.isArray(raw)
          ? raw
          : Array.isArray(raw?.data)
            ? raw.data
            : Array.isArray(raw?.quizzes)
              ? raw.quizzes
              : [];
        setQuizzes(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    setSaving(true); setErr('');
    try {
      await createQuiz({ ...quizForm, passingScore: Number(quizForm.passingScore) });
      setQuizModal(false); load();
    } catch (e) {
      const errorMsg = e.response?.data?.error || e.response?.data?.message || e.message || 'Error creating quiz';
      setErr(errorMsg);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">🎓 Eco Quizzes</h1>
          <p className="page-subtitle">Test your waste management knowledge and earn eco-points</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/quizzes/certificates" className="btn btn-secondary">🏅 My Certificates</Link>
          {isAdmin && <button className="btn btn-primary" onClick={() => setQuizModal(true)}>+ Create Quiz</button>}
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : quizzes.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">🎓</div><p>No quizzes available yet</p></div>
      ) : (
        <div className="grid-3">
          {quizzes.map(q => (
            <div key={q._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className={`badge badge-${DIFFICULTY_COLOR[q.difficulty] || 'teal'}`}>{q.difficulty}</span>
                {q.completed && <span className="badge badge-green">✓ Completed</span>}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{q.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>{q.description}</p>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                🎯 Pass at {q.passingScore}%
                {q.lastAttempt && <span style={{ marginLeft: '0.75rem' }}>Last score: <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{q.lastAttempt.score}%</span></span>}
              </div>
              <Link to={`/quizzes/${q._id}/play`} className="btn btn-primary" style={{ justifyContent: 'center' }}>
                {q.completed ? '🔄 Retry Quiz' : '▶ Start Quiz'}
              </Link>
            </div>
          ))}
        </div>
      )}

      {quizModal && (
        <Modal title="Create New Quiz" onClose={() => setQuizModal(false)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title</label>
              <input className="form-input" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Difficulty</label>
                <select className="form-select" value={quizForm.difficulty} onChange={e => setQuizForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Passing Score (%)</label>
                <input type="number" min="0" max="100" className="form-input" value={quizForm.passingScore} onChange={e => setQuizForm(f => ({ ...f, passingScore: e.target.value }))} /></div>
            </div>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Create Quiz'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
