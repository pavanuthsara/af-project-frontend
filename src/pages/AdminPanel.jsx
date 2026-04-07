import { useEffect, useState } from 'react';
import { getCategories, getItems, createCategory, updateCategory, deleteCategory, createItem, updateItem, deleteItem } from '../api/wasteApi';
import { getQuizzes, createQuiz, addQuestion, updateQuestion, deleteQuestion } from '../api/quizApi';
import { getCentres, createCentre, deleteCentre } from '../api/centresApi';

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700 }}>{title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const SECTION = ['Categories', 'Items', 'Quizzes', 'Questions'];

export default function AdminPanel() {
  const [section, setSection] = useState('Categories');

  // ── Categories ────────────────────────────
  const [cats, setCats] = useState([]);
  const [catModal, setCatModal] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', recyclable: true, hazardous: false, compostable: false });

  // ── Items ────────────────────────────────
  const [items, setItems] = useState([]);
  const [itemModal, setItemModal] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', category: '', recyclable: true, hazardous: false, compostable: false });

  // ── Quizzes + Questions ──────────────────
  const [quizzes, setQuizzes] = useState([]);
  const [quizModal, setQuizModal] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', difficulty: 'Beginner', passingScore: 60 });
  const [selQuiz, setSelQuiz] = useState(null); // quiz to manage questions of
  const [qModal, setQModal] = useState(null);
  const [qForm, setQForm] = useState({ questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const loadCats = () => getCategories({ limit: 100 }).then(r => setCats(r.data.data || []));
  const loadItems = () => getItems({ limit: 100 }).then(r => setItems(r.data.data || []));
  const loadQuizzes = () => getQuizzes().then(r => setQuizzes(r.data || []));

  useEffect(() => {
    loadCats(); loadItems(); loadQuizzes();
  }, []);

  // ── Category CRUD ──
  const saveCat = async () => {
    setSaving(true); setErr('');
    try {
      if (catModal === 'new') await createCategory(catForm);
      else await updateCategory(catModal._id, catForm);
      setCatModal(null); loadCats();
    } catch (e) { setErr(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };
  const deleteCat = async id => { if (window.confirm('Delete?')) { await deleteCategory(id); loadCats(); } };

  // ── Item CRUD ──
  const saveItem = async () => {
    setSaving(true); setErr('');
    try {
      if (itemModal === 'new') await createItem(itemForm);
      else await updateItem(itemModal._id, itemForm);
      setItemModal(null); loadItems();
    } catch (e) { setErr(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };
  const deleteIt = async id => { if (window.confirm('Delete item?')) { await deleteItem(id); loadItems(); } };

  // ── Quiz CRUD ──
  const saveQuiz = async () => {
    setSaving(true); setErr('');
    try {
      await createQuiz({ ...quizForm, passingScore: Number(quizForm.passingScore) });
      setQuizModal(null); loadQuizzes();
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  // ── Question CRUD ──
  const saveQ = async () => {
    setSaving(true); setErr('');
    try {
      const filtered = { ...qForm, options: qForm.options.filter(o => o.trim()) };
      if (qModal === 'new') await addQuestion(selQuiz._id, filtered);
      else await updateQuestion(qModal._id, filtered);
      setQModal(null); loadQuizzes();
    } catch (e) { setErr(e.response?.data?.message || 'Error'); }
    setSaving(false);
  };
  const deleteQ = async id => { if (window.confirm('Delete question?')) { await deleteQuestion(id); loadQuizzes(); } };

  const openNewQ = (quiz) => {
    setSelQuiz(quiz);
    setQForm({ questionText: '', options: ['', '', '', ''], correctAnswer: '', explanation: '' });
    setQModal('new'); setErr('');
  };
  const openEditQ = (quiz, q) => {
    setSelQuiz(quiz);
    setQForm({ questionText: q.questionText, options: [...q.options], correctAnswer: q.correctAnswer, explanation: q.explanation || '' });
    setQModal(q); setErr('');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Panel</h1>
        <p className="page-subtitle">Manage waste data, quizzes, and recycling centres</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {SECTION.map(s => (
          <button key={s} className={`btn ${section === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setSection(s)}>
            {s === 'Categories' ? '🗂' : s === 'Items' ? '🔬' : s === 'Quizzes' ? '🎓' : '❓'} {s}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      {section === 'Categories' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Waste Categories</h2>
            <button className="btn btn-primary" onClick={() => { setCatForm({ name: '', description: '', recyclable: true, hazardous: false, compostable: false }); setCatModal('new'); setErr(''); }}>+ Add</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Description</th><th>Flags</th><th>Actions</th></tr></thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.description?.slice(0, 60)}</td>
                    <td>
                      {c.recyclable && <span className="badge badge-green" style={{ marginRight: 4 }}>♻️</span>}
                      {c.hazardous && <span className="badge badge-red" style={{ marginRight: 4 }}>☣️</span>}
                      {c.compostable && <span className="badge badge-lime">🌱</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setCatForm({ name: c.name, description: c.description, recyclable: c.recyclable, hazardous: c.hazardous, compostable: c.compostable }); setCatModal(c); setErr(''); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCat(c._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── ITEMS ── */}
      {section === 'Items' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Waste Items ({items.length})</h2>
            <button className="btn btn-primary" onClick={() => { setItemForm({ name: '', description: '', category: cats[0]?._id || '', recyclable: true, hazardous: false, compostable: false }); setItemModal('new'); setErr(''); }}>+ Add</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Flags</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600 }}>{item.name}</td>
                    <td><span className="badge badge-teal">{item.category?.name}</span></td>
                    <td>
                      {item.recyclable && <span className="badge badge-green" style={{ marginRight: 4 }}>♻️</span>}
                      {item.hazardous && <span className="badge badge-red" style={{ marginRight: 4 }}>☣️</span>}
                      {item.compostable && <span className="badge badge-lime">🌱</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setItemForm({ name: item.name, description: item.description, category: item.category?._id || '', recyclable: item.recyclable, hazardous: item.hazardous, compostable: item.compostable }); setItemModal(item); setErr(''); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteIt(item._id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── QUIZZES ── */}
      {section === 'Quizzes' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Quizzes ({quizzes.length})</h2>
            <button className="btn btn-primary" onClick={() => { setQuizForm({ title: '', description: '', difficulty: 'Beginner', passingScore: 60 }); setQuizModal('new'); setErr(''); }}>+ Create</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {quizzes.map(q => (
              <div key={q._id} className="card">
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{q.title}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{q.difficulty} • Pass at {q.passingScore}%</div>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => openNewQ(q)}>+ Question</button>
                </div>
                {(q.questions || []).map(qq => (
                  <div key={qq._id} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>{qq.questionText}</div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {qq.options?.map((o, i) => (
                          <span key={i} className={`badge ${o === qq.correctAnswer ? 'badge-green' : 'badge-teal'}`}>{o}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditQ(q, qq)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteQ(qq._id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── QUESTIONS section (redirected from Quizzes) ── */}
      {section === 'Questions' && (
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p>Switch to the Quizzes tab to manage questions per quiz.</p>
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setSection('Quizzes')}>Go to Quizzes</button>
        </div>
      )}

      {/* Category modal */}
      {catModal !== null && (
        <Modal title={catModal === 'new' ? 'New Category' : 'Edit Category'} onClose={() => setCatModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-input" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} /></div>
            {['recyclable', 'hazardous', 'compostable'].map(k => (
              <label key={k} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={catForm[k]} onChange={e => setCatForm(f => ({ ...f, [k]: e.target.checked }))} style={{ accentColor: 'var(--accent-green)' }} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
            <button className="btn btn-primary" onClick={saveCat} disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
          </div>
        </Modal>
      )}

      {/* Item modal */}
      {itemModal !== null && (
        <Modal title={itemModal === 'new' ? 'New Item' : 'Edit Item'} onClose={() => setItemModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-input" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}>
                {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            {['recyclable', 'hazardous', 'compostable'].map(k => (
              <label key={k} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={itemForm[k]} onChange={e => setItemForm(f => ({ ...f, [k]: e.target.checked }))} style={{ accentColor: 'var(--accent-green)' }} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
            <button className="btn btn-primary" onClick={saveItem} disabled={saving}>{saving ? <span className="spinner" /> : 'Save'}</button>
          </div>
        </Modal>
      )}

      {/* Create Quiz modal */}
      {quizModal !== null && (
        <Modal title="Create Quiz" onClose={() => setQuizModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Title</label>
              <input className="form-input" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Difficulty</label>
                <select className="form-select" value={quizForm.difficulty} onChange={e => setQuizForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {['Beginner', 'Intermediate', 'Advanced'].map(d => <option key={d}>{d}</option>)}
                </select></div>
              <div className="form-group"><label className="form-label">Pass Score (%)</label>
                <input type="number" className="form-input" value={quizForm.passingScore} onChange={e => setQuizForm(f => ({ ...f, passingScore: e.target.value }))} /></div>
            </div>
            <button className="btn btn-primary" onClick={saveQuiz} disabled={saving}>{saving ? <span className="spinner" /> : 'Create'}</button>
          </div>
        </Modal>
      )}

      {/* Question modal */}
      {qModal !== null && (
        <Modal title={qModal === 'new' ? `Add Question — ${selQuiz?.title}` : 'Edit Question'} onClose={() => setQModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Question Text</label>
              <textarea className="form-textarea" value={qForm.questionText} onChange={e => setQForm(f => ({ ...f, questionText: e.target.value }))} /></div>
            {[0, 1, 2, 3].map(i => (
              <div className="form-group" key={i}>
                <label className="form-label">Option {String.fromCharCode(65 + i)}</label>
                <input className="form-input" value={qForm.options[i] || ''} onChange={e => setQForm(f => { const opts = [...f.options]; opts[i] = e.target.value; return { ...f, options: opts }; })} />
              </div>
            ))}
            <div className="form-group"><label className="form-label">Correct Answer</label>
              <select className="form-select" value={qForm.correctAnswer} onChange={e => setQForm(f => ({ ...f, correctAnswer: e.target.value }))}>
                <option value="">Select correct answer…</option>
                {qForm.options.filter(o => o.trim()).map((o, i) => <option key={i} value={o}>{o}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Explanation</label>
              <textarea className="form-textarea" value={qForm.explanation} onChange={e => setQForm(f => ({ ...f, explanation: e.target.value }))} /></div>
            <button className="btn btn-primary" onClick={saveQ} disabled={saving}>{saving ? <span className="spinner" /> : qModal === 'new' ? 'Add Question' : 'Update Question'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
