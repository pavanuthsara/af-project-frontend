import { useEffect, useState, useCallback } from 'react';
import {
  getCategories, getItems,
  createCategory, updateCategory, deleteCategory,
  createItem, updateItem, deleteItem,
} from '../api/wasteApi';
import {
  getQuizzes, createQuiz, playQuiz,
  addQuestion, updateQuestion, deleteQuestion,
} from '../api/quizApi';

/* Helpers */
function extractArray(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.quizzes)) return raw.quizzes;
  return [];
}

const BLANK_Q = { questionText: '', options: ['', '', ''], correctAnswer: '', explanation: '' };
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const DIFF_COLOR = { Beginner: 'badge-green', Intermediate: 'badge-yellow', Advanced: 'badge-red' };

/* Small reusable components */
function Modal({ title, wide, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: wide ? 780 : 540 }}>
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrMsg({ msg }) {
  return msg
    ? <div className="error-msg" style={{ marginBottom: '1rem' }}>{msg}</div>
    : null;
}

/* Question Form (used in add and edit) */
function QuestionForm({ initial, quizId, onSaved, onCancel }) {
  const [form, setForm] = useState(initial || BLANK_Q);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const setField = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setOption = (i, val) => setForm(f => {
    const opts = [...f.options]; opts[i] = val; return { ...f, options: opts };
  });
  const addOption = () => {
    if (form.options.length >= 6) return;
    setForm(f => ({ ...f, options: [...f.options, ''] }));
  };
  const removeOption = (i) => {
    setForm(f => {
      const opts = f.options.filter((_, idx) => idx !== i);
      return { ...f, options: opts, correctAnswer: f.correctAnswer === f.options[i] ? '' : f.correctAnswer };
    });
  };

  const filledOptions = form.options.filter(o => o.trim());

  const handleSave = async () => {
    if (!form.questionText.trim()) { setErr('Question text is required.'); return; }
    if (filledOptions.length < 2) { setErr('At least 2 options are required.'); return; }
    if (!form.correctAnswer) { setErr('Please select the correct answer.'); return; }
    if (!filledOptions.includes(form.correctAnswer)) { setErr('Correct answer must match one of the options.'); return; }

    setSaving(true); setErr('');
    try {
      const payload = { ...form, options: filledOptions };
      let savedQuestion;
      if (initial?._id) {
        const res = await updateQuestion(initial._id, payload);
        // response may be { data: {...} } or the question directly
        savedQuestion = res.data?.data || res.data;
      } else {
        const res = await addQuestion(quizId, payload);
        savedQuestion = res.data?.data || res.data;
      }
      // Pass the full saved question back so parent can update local state
      onSaved(savedQuestion || { ...payload, _id: initial?._id });
    } catch (e) {
      setErr(e.response?.data?.message || e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <ErrMsg msg={err} />

      {/* Question text */}
      <div className="form-group">
        <label className="form-label">Question Text *</label>
        <textarea
          className="form-textarea"
          placeholder="e.g. Which bin should a PET plastic bottle go in?"
          value={form.questionText}
          onChange={e => setField('questionText', e.target.value)}
          style={{ minHeight: 80 }}
        />
      </div>

      {/* Options */}
      <div className="form-group">
        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
          <label className="form-label" style={{ margin: 0 }}>Answer Options * <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 2, max 6)</span></label>
          {form.options.length < 6 && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={addOption}>+ Option</button>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {form.options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{
                minWidth: 28, height: 28, borderRadius: 8, background: 'var(--bg-secondary)',
                border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)',
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              <input
                className="form-input"
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                value={opt}
                onChange={e => setOption(i, e.target.value)}
                style={{ flex: 1 }}
              />
              {form.options.length > 2 && (
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeOption(i)}
                  style={{ padding: '0.3rem 0.5rem' }}>Remove</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Correct answer */}
      <div className="form-group">
        <label className="form-label">Correct Answer *</label>
        <select
          className="form-select"
          value={form.correctAnswer}
          onChange={e => setField('correctAnswer', e.target.value)}
        >
          <option value="">Select the correct answer</option>
          {filledOptions.map((o, i) => (
            <option key={i} value={o}>{String.fromCharCode(65 + i)}. {o}</option>
          ))}
        </select>
      </div>

      {/* Explanation */}
      <div className="form-group">
        <label className="form-label">Explanation <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown on wrong answer)</span></label>
        <textarea
          className="form-textarea"
          placeholder="e.g. PET bottles are 100% recyclable and should go in the blue bin."
          value={form.explanation}
          onChange={e => setField('explanation', e.target.value)}
          style={{ minHeight: 70 }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}
          style={{ flex: 1, justifyContent: 'center' }}>
          {saving ? <span className="spinner" /> : initial?._id ? 'Update Question' : 'Add Question'}
        </button>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

/* Question Manager Modal (per quiz) */
function QuestionManagerModal({ quiz, onClose, onQuizUpdated }) {
  const [questions, setQuestions] = useState([]);
  const [loadingQs, setLoadingQs] = useState(true);
  const [mode, setMode] = useState('list'); // 'list' | 'add' | { edit: questionObj }
  const [deleting, setDeleting] = useState(null);

  // Load questions on mount via playQuiz (list endpoint doesn't embed questions)
  useEffect(() => {
    playQuiz(quiz._id)
      .then(r => {
        const d = r.data;
        // Response shape: { title, description, questions: [...] } or similar
        const qs = d?.questions || d?.data?.questions || [];
        setQuestions(qs);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQs(false));
  }, [quiz._id]);

  // Called by QuestionForm after a successful add or update
  const handleSaved = useCallback((savedQuestion) => {
    if (!savedQuestion) { setMode('list'); return; }

    // 1. Calculate the new array outside the state setter
    const exists = questions.find(q => q._id === savedQuestion._id);
    const updatedQuestions = exists
      ? questions.map(q => q._id === savedQuestion._id ? savedQuestion : q)
      : [...questions, savedQuestion];

    // 2. Update local state
    setQuestions(updatedQuestions);

    // 3. Update parent state safely
    onQuizUpdated({ ...quiz, questions: updatedQuestions });

    setMode('list');
  }, [quiz, questions, onQuizUpdated]); // <-- Note: added 'questions' to dependency array

  const handleDelete = async (qid) => {
    if (!window.confirm('Delete this question?')) return;
    setDeleting(qid);
    try {
      await deleteQuestion(qid);

      // 1. Calculate the new array outside the state setter
      const updatedQuestions = questions.filter(q => q._id !== qid);

      // 2. Update local state
      setQuestions(updatedQuestions);

      // 3. Update parent state safely
      onQuizUpdated({ ...quiz, questions: updatedQuestions });

    } catch { /* silent */ }
    setDeleting(null);
  };

  return (
    <Modal
      title={
        <span>
          Questions for{' '}
          <span style={{ color: 'var(--accent-green)' }}>{quiz.title}</span>
        </span>
      }
      wide
      onClose={onClose}
    >
      {/* Header strip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', borderRadius: 10,
        background: 'var(--bg-primary)', border: '1px solid var(--border)',
        marginBottom: '1.25rem',
      }}>
        <span className={`badge ${DIFF_COLOR[quiz.difficulty] || 'badge-teal'}`}>{quiz.difficulty}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Pass at {quiz.passingScore}%</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {questions.length} question{questions.length !== 1 ? 's' : ''}
        </span>
        {mode === 'list' && (
          <button className="btn btn-primary btn-sm" onClick={() => setMode('add')}>
            Add Question
          </button>
        )}
      </div>

      {/* Add form */}
      {mode === 'add' && (
        <div className="card" style={{ marginBottom: '1.25rem', border: '1px solid rgba(34,197,94,0.25)', background: 'rgba(34,197,94,0.04)' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-green)' }}>New Question</div>
          <QuestionForm
            quizId={quiz._id}
            onSaved={handleSaved}
            onCancel={() => setMode('list')}
          />
        </div>
      )}

      {/* Edit form for a specific question */}
      {mode?.edit && (
        <div className="card" style={{ marginBottom: '1.25rem', border: '1px solid rgba(20,184,166,0.3)', background: 'rgba(20,184,166,0.04)' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem', color: 'var(--accent-teal)' }}>Edit Question</div>
          <QuestionForm
            initial={mode.edit}
            quizId={quiz._id}
            onSaved={handleSaved}
            onCancel={() => setMode('list')}
          />
        </div>
      )}

      {/* Questions list */}
      {loadingQs ? (
        <div className="flex-center" style={{ height: 140 }}>
          <span className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
          <div className="empty-state-icon">Q</div>
          <p>No questions yet.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Click "Add Question" above to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {questions.map((q, idx) => (
            <div key={q._id} style={{
              background: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '1rem 1.25rem',
              borderLeft: '3px solid var(--accent-teal)',
            }}>
              <div className="flex-between" style={{ marginBottom: '0.6rem', gap: '1rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', flex: 1, lineHeight: 1.4 }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }}>Q{idx + 1}.</span>
                  {q.questionText}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setMode({ edit: q })}
                    disabled={mode?.edit?._id === q._id}
                  >Edit</button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(q._id)}
                    disabled={deleting === q._id}
                  >
                    {deleting === q._id ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Delete'}
                  </button>
                </div>
              </div>

              {/* Options list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: q.explanation ? '0.6rem' : 0 }}>
                {q.options?.map((opt, i) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <span key={i} style={{
                      padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                      background: isCorrect ? 'rgba(34,197,94,0.15)' : 'var(--bg-card)',
                      border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                      color: isCorrect ? 'var(--accent-green)' : 'var(--text-secondary)',
                    }}>
                      {isCorrect ? 'Correct: ' : ''}{String.fromCharCode(65 + i)}. {opt}
                    </span>
                  );
                })}
              </div>

              {/* Explanation */}
              {q.explanation && (
                <div style={{
                  fontSize: '0.8rem', color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border)', paddingTop: '0.5rem', marginTop: '0.5rem',
                  lineHeight: 1.5,
                }}>
                  Note: {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/* Main AdminPanel */
const SECTIONS = ['Categories', 'Items', 'Quizzes'];

export default function AdminPanel() {
  const [section, setSection] = useState('Categories');

  /* Categories */
  const [cats, setCats] = useState([]);
  const [catModal, setCatModal] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', recyclable: true, hazardous: false, compostable: false });
  const [catSaving, setCatSaving] = useState(false);
  const [catErr, setCatErr] = useState('');

  /* Items */
  const [items, setItems] = useState([]);
  const [itemModal, setItemModal] = useState(null);
  const [itemForm, setItemForm] = useState({ name: '', description: '', category: '', recyclable: true, hazardous: false, compostable: false });
  const [itemSaving, setItemSaving] = useState(false);
  const [itemErr, setItemErr] = useState('');

  /* Quizzes */
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);
  const [quizModal, setQuizModal] = useState(false);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', difficulty: 'Beginner', passingScore: 60 });
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizErr, setQuizErr] = useState('');
  const [qManager, setQManager] = useState(null); // quiz for question manager

  /* Loaders */
  const loadCats = () => getCategories({ limit: 100 }).then(r => setCats(r.data.data || []));
  const loadItems = () => getItems({ limit: 100 }).then(r => setItems(r.data.data || []));
  const loadQuizzes = () => {
    setQuizLoading(true);
    getQuizzes()
      .then(r => { setQuizzes(extractArray(r.data)); })
      .finally(() => setQuizLoading(false));
  };

  useEffect(() => {
    Promise.all([
      getCategories({ limit: 100 }),
      getItems({ limit: 100 }),
      getQuizzes(),
    ]).then(([catsRes, itemsRes, quizzesRes]) => {
      setCats(catsRes.data.data || []);
      setItems(itemsRes.data.data || []);
      setQuizzes(extractArray(quizzesRes.data));
    }).finally(() => {
      setQuizLoading(false);
    });
  }, []);

  /* Category CRUD */
  const openNewCat = () => { setCatForm({ name: '', description: '', recyclable: true, hazardous: false, compostable: false }); setCatModal('new'); setCatErr(''); };
  const openEditCat = c => { setCatForm({ name: c.name, description: c.description, recyclable: c.recyclable, hazardous: c.hazardous, compostable: c.compostable }); setCatModal(c); setCatErr(''); };
  const saveCat = async () => {
    setCatSaving(true); setCatErr('');
    try {
      catModal === 'new' ? await createCategory(catForm) : await updateCategory(catModal._id, catForm);
      setCatModal(null); loadCats();
    } catch (e) { setCatErr(e.response?.data?.error || 'Error saving category'); }
    setCatSaving(false);
  };
  const deleteCat = async id => {
    if (!window.confirm('Delete this category and all its items?')) return;
    await deleteCategory(id); loadCats();
  };

  /* Item CRUD */
  const openNewItem = () => { setItemForm({ name: '', description: '', category: cats[0]?._id || '', recyclable: true, hazardous: false, compostable: false }); setItemModal('new'); setItemErr(''); };
  const openEditItem = item => { setItemForm({ name: item.name, description: item.description, category: item.category?._id || '', recyclable: item.recyclable, hazardous: item.hazardous, compostable: item.compostable }); setItemModal(item); setItemErr(''); };
  const saveItem = async () => {
    setItemSaving(true); setItemErr('');
    try {
      itemModal === 'new' ? await createItem(itemForm) : await updateItem(itemModal._id, itemForm);
      setItemModal(null); loadItems();
    } catch (e) { setItemErr(e.response?.data?.error || 'Error saving item'); }
    setItemSaving(false);
  };
  const deleteIt = async id => {
    if (!window.confirm('Delete this waste item?')) return;
    await deleteItem(id); loadItems();
  };

  /* Quiz CRUD */
  const saveQuiz = async () => {
    setQuizSaving(true); setQuizErr('');
    try {
      await createQuiz({ ...quizForm, passingScore: Number(quizForm.passingScore) });
      setQuizModal(false); loadQuizzes();
    } catch (e) { setQuizErr(e.response?.data?.message || 'Error creating quiz'); }
    setQuizSaving(false);
  };

  /* called by QuestionManagerModal after any mutation */
  const onQuizzesUpdated = useCallback(updatedQuiz => {
    setQuizzes(prev => prev.map(q => q._id === updatedQuiz._id ? updatedQuiz : q));

    if (qManager && qManager._id === updatedQuiz._id) {
      setQManager(updatedQuiz);
    }
  }, [qManager]);

  /* Render */
  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Admin Panel</h1>
        <p className="page-subtitle">Manage waste data, quizzes, and questions</p>
      </div>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {SECTIONS.map(s => (
          <button
            key={s}
            className={`btn ${section === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSection(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Categories */}
      {section === 'Categories' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Waste Categories <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({cats.length})</span></h2>
            <button className="btn btn-primary" onClick={openNewCat}>New Category</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Description</th><th>Flags</th><th>Actions</th></tr></thead>
              <tbody>
                {cats.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{c.description?.slice(0, 70)}{c.description?.length > 70 ? '...' : ''}</td>
                    <td>
                      {c.recyclable && <span className="badge badge-green" style={{ marginRight: 4 }}>Recyclable</span>}
                      {c.hazardous && <span className="badge badge-red" style={{ marginRight: 4 }}>Hazardous</span>}
                      {c.compostable && <span className="badge badge-lime">Compostable</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditCat(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteCat(c._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {cats.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Items */}
      {section === 'Items' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Waste Items <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({items.length})</span></h2>
            <button className="btn btn-primary" onClick={openNewItem}>New Item</button>
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Name</th><th>Category</th><th>Flags</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(item => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description?.slice(0, 50)}</div>
                    </td>
                    <td><span className="badge badge-teal">{item.category?.name || '-'}</span></td>
                    <td>
                      {item.recyclable && <span className="badge badge-green" style={{ marginRight: 4 }}>Recyclable</span>}
                      {item.hazardous && <span className="badge badge-red" style={{ marginRight: 4 }}>Hazardous</span>}
                      {item.compostable && <span className="badge badge-lime">Compostable</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEditItem(item)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteIt(item._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No items yet</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Quizzes */}
      {section === 'Quizzes' && (
        <>
          <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontWeight: 700 }}>Quizzes <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '0.9rem' }}>({quizzes.length})</span></h2>
            <button className="btn btn-primary" onClick={() => { setQuizForm({ title: '', description: '', difficulty: 'Beginner', passingScore: 60 }); setQuizModal(true); setQuizErr(''); }}>
              Create Quiz
            </button>
          </div>

          {quizLoading ? (
            <div className="flex-center" style={{ height: 200 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
          ) : quizzes.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon">Q</div><p>No quizzes yet. Create one!</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {quizzes.map(q => {
                const qCount = q.questions?.length ?? 0;
                return (
                  <div key={q._id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                      {/* Left: quiz info */}
                      <div style={{ flex: 1, minWidth: 220 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem' }}>{q.title}</span>
                          <span className={`badge ${DIFF_COLOR[q.difficulty] || 'badge-teal'}`}>{q.difficulty}</span>
                        </div>
                        {q.description && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{q.description}</div>
                        )}
                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <span>Pass at {q.passingScore}%</span>
                          <span style={{ color: qCount === 0 ? 'var(--danger)' : 'var(--accent-green)', fontWeight: 600 }}>
                            {qCount} question{qCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>

                      {/* Right: actions */}
                      <button
                        className="btn btn-primary"
                        onClick={() => setQManager(q)}
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        Manage Questions
                      </button>
                    </div>

                    {/* Inline mini question preview */}
                    {qCount > 0 && (
                      <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Questions preview
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {(q.questions || []).slice(0, 3).map((qq, i) => (
                            <div key={qq._id} style={{
                              display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                              fontSize: '0.85rem', color: 'var(--text-secondary)',
                            }}>
                              <span style={{ color: 'var(--text-muted)', minWidth: 24, fontWeight: 600 }}>Q{i + 1}.</span>
                              <span style={{ flex: 1 }}>{qq.questionText}</span>
                              {qq.correctAnswer && (
                                <span style={{
                                  padding: '0.1rem 0.5rem', borderRadius: 20, fontSize: '0.72rem',
                                  background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)',
                                  border: '1px solid rgba(34,197,94,0.25)', whiteSpace: 'nowrap',
                                }}>Correct: {qq.correctAnswer}</span>
                              )}
                            </div>
                          ))}
                          {qCount > 3 && (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: 24 }}>
                              +{qCount - 3} more question{qCount - 3 !== 1 ? 's' : ''} - click "Manage Questions" to see all
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}

      {/* Question Manager Modal */}
      {qManager && (
        <QuestionManagerModal
          key={qManager._id}
          onClose={() => setQManager(null)}
          onQuizUpdated={onQuizzesUpdated}
        />
      )}

      {/* Create Quiz modal */}
      {quizModal && (
        <Modal title="Create New Quiz" onClose={() => setQuizModal(false)}>
          <ErrMsg msg={quizErr} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" placeholder="e.g. Plastic Sorting 101" value={quizForm.title} onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="What will learners get out of this quiz?" value={quizForm.description} onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={quizForm.difficulty} onChange={e => setQuizForm(f => ({ ...f, difficulty: e.target.value }))}>
                  {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Passing Score (%)</label>
                <input type="number" min="0" max="100" className="form-input" value={quizForm.passingScore} onChange={e => setQuizForm(f => ({ ...f, passingScore: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveQuiz} disabled={quizSaving} style={{ justifyContent: 'center' }}>
              {quizSaving ? <span className="spinner" /> : 'Create Quiz'}
            </button>
          </div>
        </Modal>
      )}

      {/* Category modal */}
      {catModal !== null && (
        <Modal title={catModal === 'new' ? 'New Category' : 'Edit Category'} onClose={() => setCatModal(null)}>
          <ErrMsg msg={catErr} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name *</label>
              <input className="form-input" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} /></div>
            {['recyclable', 'hazardous', 'compostable'].map(k => (
              <label key={k} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', alignItems: 'center' }}>
                <input type="checkbox" checked={catForm[k]} onChange={e => setCatForm(f => ({ ...f, [k]: e.target.checked }))} style={{ accentColor: 'var(--accent-green)', width: 16, height: 16 }} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
            <button className="btn btn-primary" onClick={saveCat} disabled={catSaving} style={{ justifyContent: 'center' }}>
              {catSaving ? <span className="spinner" /> : catModal === 'new' ? 'Create' : 'Update'}
            </button>
          </div>
        </Modal>
      )}

      {/* Item modal */}
      {itemModal !== null && (
        <Modal title={itemModal === 'new' ? 'New Waste Item' : 'Edit Waste Item'} onClose={() => setItemModal(null)}>
          <ErrMsg msg={itemErr} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name *</label>
              <input className="form-input" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}>
                {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            {['recyclable', 'hazardous', 'compostable'].map(k => (
              <label key={k} style={{ display: 'flex', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', alignItems: 'center' }}>
                <input type="checkbox" checked={itemForm[k]} onChange={e => setItemForm(f => ({ ...f, [k]: e.target.checked }))} style={{ accentColor: 'var(--accent-green)', width: 16, height: 16 }} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </label>
            ))}
            <button className="btn btn-primary" onClick={saveItem} disabled={itemSaving} style={{ justifyContent: 'center' }}>
              {itemSaving ? <span className="spinner" /> : itemModal === 'new' ? 'Create' : 'Update'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
