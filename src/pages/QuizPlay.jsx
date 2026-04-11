import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playQuiz, submitQuiz } from '../api/quizApi';

const LANGS = [{ code: '', label: '🇬🇧 English' }, { code: 'si', label: '🇱🇰 Sinhala' }, { code: 'ta', label: 'Tamil' }];

export default function QuizPlay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState('');
  const [questions, setQuestions] = useState([]);
  const [quizMeta, setQuizMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState('');

  const load = (l) => {
    setLoading(true); setErr('');
    playQuiz(id, l).then(r => {
      const d = r.data;
      setQuizMeta({ title: d.title, description: d.description });
      setQuestions(d.questions || []);
      setLoading(false);
    }).catch(e => {
      setErr(e.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    });
  };

  useEffect(() => { load(lang); }, [id, lang]);

  const handleSelect = (opt) => {
    if (result) return;
    setSelected(opt);
    setAnswers(a => ({ ...a, [questions[current]._id]: opt }));
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1);
      setSelected(answers[questions[current + 1]?._id] || null);
    }
  };

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(c => c - 1);
      setSelected(answers[questions[current - 1]?._id] || null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }));
      const { data } = await submitQuiz(id, payload);
      setResult(data.data);
    } catch (e) {
      setErr(e.response?.data?.message || 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;
  const q = questions[current];

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}><span className="spinner" style={{ width: 48, height: 48 }} /></div>;
  if (err) return <div className="empty-state"><div style={{ fontSize: '3rem' }}>⚠️</div><p>{err}</p><button className="btn btn-secondary" onClick={() => navigate('/quizzes')} style={{ marginTop: '1rem' }}>Back to Quizzes</button></div>;

  // Result screen
  if (result) {
    const passed = result.passed;
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Quiz Results</h1>
        </div>
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{passed ? '🎉' : '📚'}</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: passed ? 'var(--accent-green)' : 'var(--danger)' }}>
            {passed ? 'You Passed! 🏆' : 'Keep Practising!'}
          </h2>
          <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0', color: passed ? 'var(--accent-green)' : 'var(--text-primary)' }}>
            {result.score}%
          </div>
          <div style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {result.correctAnswers} / {result.totalQuestions} correct
            {passed && <div style={{ color: 'var(--accent-green)', marginTop: '0.5rem' }}>+ 10 Eco-Points earned! 🌱</div>}
          </div>

          {result.wrongAnswerExplanations?.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Review Wrong Answers</h3>
              {result.wrongAnswerExplanations.map((w, i) => (
                <div key={i} style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--accent-green)', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                    ✓ Correct: {w.correctAnswer}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{w.explanation}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/quizzes')}>← All Quizzes</button>
            <button className="btn btn-primary" onClick={() => navigate('/quizzes/certificates')}>🏅 My Certificates</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex-between page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">{quizMeta?.title || 'Quiz'}</h1>
          <p className="page-subtitle">{quizMeta?.description}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {LANGS.map(l => (
            <button key={l.code} className={`btn btn-sm ${lang === l.code ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setLang(l.code); setCurrent(0); setSelected(null); setAnswers({}); }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Question {current + 1} of {questions.length}</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{answeredCount} answered</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      {/* Question card */}
      {q && (
        <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.75rem', lineHeight: 1.4 }}>
            {current + 1}. {q.questionText}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
            {q.options?.map((opt, i) => (
              <button key={i} className={`quiz-option${answers[q._id] === opt ? ' selected' : ''}`}
                onClick={() => handleSelect(opt)}>
                <span style={{ marginRight: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            ))}
          </div>

          <div className="flex-between">
            <button className="btn btn-secondary" onClick={handlePrev} disabled={current === 0}>← Previous</button>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {current < questions.length - 1 ? (
                <button className="btn btn-primary" onClick={handleNext}>Next →</button>
              ) : (
                <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting || answeredCount === 0}>
                  {submitting ? <><span className="spinner" /> Submitting…</> : '✅ Submit Quiz'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Question navigator */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1.5rem', justifyContent: 'center' }}>
        {questions.map((qq, i) => (
          <button key={i}
            onClick={() => { setCurrent(i); setSelected(answers[qq._id] || null); }}
            style={{
              width: 36, height: 36, borderRadius: 8, border: '1px solid',
              borderColor: i === current ? 'var(--accent-green)' : answers[qq._id] ? 'var(--border-light)' : 'var(--border)',
              background: i === current ? 'rgba(34,197,94,0.15)' : answers[qq._id] ? 'rgba(34,197,94,0.08)' : 'var(--bg-card)',
              color: i === current ? 'var(--accent-green)' : answers[qq._id] ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
            }}>{i + 1}</button>
        ))}
      </div>
    </div>
  );
}
