import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createDisposal, getDisposalHistory, updateDisposal, deleteDisposal, getDisposalStats } from '../api/disposalApi';
import { getItems } from '../api/wasteApi';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const UNITS = ['kg', 'g', 'lbs', 'oz'];
const COLORS = { recycled: '#22c55e', composted: '#84cc16', landfill: '#f59e0b' };

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

function CO2Toast({ data, onClose }) {
  return (
    <div className="celebration">
      <div className="celebration-card">
        <div style={{ fontSize: '4rem', marginBottom: '0.75rem' }}>🌱</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Great job!</h2>
        <p style={{ color: 'var(--accent-green)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          You saved {data.co2Saved?.toFixed(2)} kg CO₂e
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          by {data.disposalMethod} this waste 🎉
        </p>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>
          Continue ✓
        </button>
      </div>
    </div>
  );
}

export default function DisposalLog() {
  const location = useLocation();
  const prefill = location.state || {};

  const [tab, setTab] = useState('log');
  const [wasteItems, setWasteItems] = useState([]);
  const [searchWaste, setSearchWaste] = useState('');

  // Form
  const [form, setForm] = useState({
    wasteId: prefill.wasteId || '',
    quantity: 1,
    weight: '',
    unit: 'kg',
    disposalGuideline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formErr, setFormErr] = useState('');
  const [toast, setToast] = useState(null);

  // History
  const [history, setHistory] = useState([]);
  const [hLoading, setHLoading] = useState(false);
  const [hPagination, setHPagination] = useState(null);
  const [hPage, setHPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Stats
  const [stats, setStats] = useState(null);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [eSaving, setESaving] = useState(false);

  useEffect(() => {
    getItems({ limit: 100 }).then(r => setWasteItems(r.data.data || []));
  }, []);

  const loadHistory = () => {
    setHLoading(true);
    const params = { page: hPage, limit: 10 };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    getDisposalHistory(params).then(r => {
      setHistory(r.data.data || []); setHPagination(r.data.pagination);
      setHLoading(false);
    });
  };

  const loadStats = () => getDisposalStats().then(r => {
    let s = r.data.data || r.data || {};
    if (Array.isArray(s)) s = s[0] || {};

    // Fallback in case backend returns empty/0 stats but history exists
    if (!s.totalDisposals && history.length > 0) {
      let co2 = 0, w = 0;
      const m = {};
      history.forEach(d => {
        co2 += (d.co2Saved || 0);
        w += (d.weight || 0);
        const method = d.disposalMethod || 'unknown';
        m[method] = (m[method] || 0) + 1;
      });
      s = { totalCo2Saved: co2, totalWeight: w, totalDisposals: history.length, byMethod: m };
    }

    setStats(s);
  }).catch(err => console.error("Error loading stats:", err));

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab, hPage, startDate, endDate]);
  useEffect(() => { if (tab === 'stats') loadStats(); }, [tab]);

  const filteredWaste = wasteItems.filter(w => w.name.toLowerCase().includes(searchWaste.toLowerCase()));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true); setFormErr('');
    try {
      const { data } = await createDisposal({ ...form, quantity: Number(form.quantity), weight: Number(form.weight) });
      setToast(data.data);
      setForm({ wasteId: '', quantity: 1, weight: '', unit: 'kg', disposalGuideline: '' });
    } catch (err) {
      setFormErr(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (d) => {
    setEditForm({ weight: d.weight, quantity: d.quantity, unit: d.unit, disposalGuideline: d.disposalGuideline || '' });
    setEditModal(d);
  };
  const saveEdit = async () => {
    setESaving(true);
    await updateDisposal(editModal.id, { ...editForm, weight: Number(editForm.weight), quantity: Number(editForm.quantity) });
    setEditModal(null); setESaving(false); loadHistory();
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this log?')) return;
    await deleteDisposal(id); loadHistory();
  };

  const byMethod = stats?.byMethod ? Object.entries(stats.byMethod).map(([k, v]) => ({ name: k, value: v })) : [];

  return (
    <div>
      {toast && <CO2Toast data={toast} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1 className="page-title">📋 Disposal Log</h1>
        <p className="page-subtitle">Track your waste disposal and see your CO₂ impact</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        {['log', 'history', 'stats'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
            {t === 'log' ? '➕ Log New' : t === 'history' ? '📜 History' : '📊 My Stats'}
          </button>
        ))}
      </div>

      {/* ── LOG FORM ── */}
      {tab === 'log' && (
        <div className="grid-2" style={{ alignItems: 'start' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Log a Disposal Activity</h3>
            {formErr && <div className="error-msg" style={{ marginBottom: '1rem' }}>{formErr}</div>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Waste Item</label>
                <input className="form-input" placeholder="🔍 Search item…" value={searchWaste} onChange={e => setSearchWaste(e.target.value)} />
                <select className="form-select" value={form.wasteId} onChange={e => setForm(f => ({ ...f, wasteId: e.target.value }))} required>
                  <option value="">Select waste item…</option>
                  {filteredWaste.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                </select>
              </div>
              {form.wasteId && wasteItems.find(w => w._id === form.wasteId) && (
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(20,184,166,0.05))', padding: '1rem' }}>
                  {(() => {
                    const selected = wasteItems.find(w => w._id === form.wasteId);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{selected.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{selected.description}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                          {selected.recyclable && <span className="badge" style={{ background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e44', fontSize: '0.75rem' }}>♻️ Recyclable</span>}
                          {selected.compostable && <span className="badge" style={{ background: '#84cc1622', color: '#84cc16', border: '1px solid #84cc1644', fontSize: '0.75rem' }}>🌱 Compostable</span>}
                          {selected.hazardous && <span className="badge" style={{ background: '#ef444422', color: '#ef4444', border: '1px solid #ef444444', fontSize: '0.75rem' }}>⚠️ Hazardous</span>}
                        </div>
                        {selected.disposalInstructions && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic', borderLeft: '3px solid var(--accent-green)', paddingLeft: '0.75rem' }}>{selected.disposalInstructions}</p>}
                      </div>
                    );
                  })()}
                </div>
              )}
              <div className="grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Quantity</label>
                  <input type="number" min="1" className="form-input" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="number" min="0" step="0.01" className="form-input" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} required style={{ flex: 1 }} />
                    <select className="form-select" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={{ width: 80 }}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Disposal Guideline <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
                <textarea className="form-textarea" value={form.disposalGuideline} onChange={e => setForm(f => ({ ...f, disposalGuideline: e.target.value }))} placeholder="e.g. Rinse and place in blue recycling bin" style={{ minHeight: 80 }} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ justifyContent: 'center', padding: '1rem' }}>
                {submitting ? <><span className="spinner" /> Logging…</> : '🌱 Log Disposal'}
              </button>
            </form>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.07), rgba(20,184,166,0.05))' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🌍 Did you know?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[{ em: '1.53 kg', text: 'CO₂ saved by recycling 1.5 kg of plastic' }, { em: '9.13 kg', text: 'CO₂ saved per kg of aluminium recycled' }, { em: '2.58 kg', text: 'CO₂ saved per kg of paper recycled' }].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-green)', minWidth: 70 }}>{f.em}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input type="date" className="form-input" style={{ width: 180 }} value={startDate} onChange={e => { setStartDate(e.target.value); setHPage(1); }} />
            <span style={{ color: 'var(--text-muted)' }}>to</span>
            <input type="date" className="form-input" style={{ width: 180 }} value={endDate} onChange={e => { setEndDate(e.target.value); setHPage(1); }} />
            {(startDate || endDate) && <button className="btn btn-secondary btn-sm" onClick={() => { setStartDate(''); setEndDate(''); }}>✕ Clear filter</button>}
          </div>
          {hLoading ? <div className="flex-center" style={{ height: 200 }}><span className="spinner" /></div> : (
            <>
              {history.length === 0 ? <div className="empty-state"><div className="empty-state-icon">📋</div><p>No disposal logs yet</p></div> : (
                <div className="table-wrapper">
                  <table>
                    <thead><tr><th>Waste Item</th><th>Qty</th><th>Weight</th><th>CO₂ Saved</th><th>Method</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {history.map(d => {
                        // Extract waste item name - handle both object and string formats
                        let wasteName = 'Unknown';
                        if (typeof d.wasteId === 'object' && d.wasteId !== null) {
                          wasteName = d.wasteId.name || 'Unknown';
                        } else if (typeof d.wasteId === 'string') {
                          const nameMatch = d.wasteId.match(/name:\s*['"]([^'"]+)['"]/);
                          if (nameMatch) {
                            wasteName = nameMatch[1];
                          } else {
                            const foundItem = wasteItems.find(w => d.wasteId === w._id || d.wasteId.includes(w._id));
                            wasteName = foundItem ? foundItem.name : d.wasteId;
                          }
                        }
                        
                        return (
                          <tr key={d.id}>
                            <td style={{ fontWeight: 600 }}>{wasteName}</td>
                            <td>{d.quantity}</td>
                            <td>{d.weight} {d.unit}</td>
                            <td><span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>{d.co2Saved?.toFixed(3)} kg</span></td>
                            <td><span className="badge" style={{ background: `${COLORS[d.disposalMethod] || '#888'}22`, color: COLORS[d.disposalMethod] || '#888', border: `1px solid ${COLORS[d.disposalMethod] || '#888'}44` }}>{d.disposalMethod}</span></td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{new Date(d.timestamp).toLocaleDateString()}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '0.4rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>✏️</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d.id)}>🗑</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {hPagination && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary btn-sm" disabled={!hPagination.hasPrevPage} onClick={() => setHPage(p => p - 1)}>← Prev</button>
                  <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {hPagination.currentPage} of {hPagination.totalPages}</span>
                  <button className="btn btn-secondary btn-sm" disabled={!hPagination.hasNextPage} onClick={() => setHPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ── STATS ── */}
      {tab === 'stats' && stats && (
        <div>
          <div className="grid-3" style={{ marginBottom: '2rem' }}>
            <div className="stat-card"><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-green)' }}>{(stats.totalCo2Saved || stats.totalCo2 || 0).toFixed(2)} <span style={{ fontSize: '0.9rem' }}>kg</span></div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total CO₂ Saved</div></div>
            <div className="stat-card"><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-teal)' }}>{(stats.totalWeight || stats.weight || 0).toFixed(2)} <span style={{ fontSize: '0.9rem' }}>kg</span></div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total Weight</div></div>
            <div className="stat-card"><div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-lime)' }}>{stats.totalDisposals || stats.count || stats.total || 0}</div><div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Total Disposals</div></div>
          </div>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Disposal by Method</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={byMethod} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 13 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 13 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {byMethod.map((d, i) => <Cell key={i} fill={COLORS[d.name] || '#888'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {editModal && (
        <Modal title="Edit Disposal Log" onClose={() => setEditModal(null)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Quantity</label>
                <input type="number" className="form-input" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Weight</label>
                <input type="number" className="form-input" value={editForm.weight} onChange={e => setEditForm(f => ({ ...f, weight: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Unit</label>
              <select className="form-select" value={editForm.unit} onChange={e => setEditForm(f => ({ ...f, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select></div>
            <div className="form-group"><label className="form-label">Guideline</label>
              <textarea className="form-textarea" value={editForm.disposalGuideline} onChange={e => setEditForm(f => ({ ...f, disposalGuideline: e.target.value }))} /></div>
            <button className="btn btn-primary" onClick={saveEdit} disabled={eSaving}>
              {eSaving ? <span className="spinner" /> : 'Update'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
