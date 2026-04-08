import { useEffect, useState } from 'react';
import { getCentres, getCentresByWasteType, searchCentres, createCentre, deleteCentre, updateCentre } from '../api/centresApi';
import useAuthStore from '../store/authStore';

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

const WASTE_TYPES = ['Plastic', 'Plastics', 'Paper', 'Glass', 'Metal', 'Organic', 'Electronic Waste', 'Hazardous Waste', 'solid waste'];

const emptyForm = {
  name: '', address: '',
  location: { type: 'Point', coordinates: [0, 0] },
  acceptedWasteTypes: [],
  operatingHours: '',
  maxCapacityKg: '',
  currentLoadKg: '',
};

export default function RecycleCentres() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterWaste, setFilterWaste] = useState('');
  const [selected, setSelected] = useState(null);

  const [cModal, setCModal] = useState(null); // null | 'new' | {obj}
  const [cForm, setCForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const load = () => {
    setLoading(true);
    getCentres().then(r => { setCentres(r.data.recyclingCenters || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return load();
    setSearching(true);
    try {
      const r = await searchCentres(searchQuery);
      setCentres(r.data.recyclingCenters || []);
    } finally { setSearching(false); }
  };

  const handleFilterWaste = async (wt) => {
    setFilterWaste(wt);
    if (!wt) return load();
    setLoading(true);
    getCentresByWasteType(wt).then(r => { setCentres(r.data.recyclingCenters || []); setLoading(false); });
  };

  const openNew = () => { setCForm(emptyForm); setCModal('new'); setErr(''); };
  const openEdit = (c) => {
    setCForm({
      name: c.name, address: c.address,
      location: c.location || { type: 'Point', coordinates: [0, 0] },
      acceptedWasteTypes: uniqueWasteTypes(c.acceptedWasteTypes),
      operatingHours: c.operatingHours || '',
      maxCapacityKg: c.maxCapacityKg || '',
      currentLoadKg: c.currentLoadKg || '',
    });
    setCModal(c); setErr('');
  };

  const saveCentre = async () => {
    setSaving(true); setErr('');
    try {
      const payload = { ...cForm, maxCapacityKg: Number(cForm.maxCapacityKg), currentLoadKg: Number(cForm.currentLoadKg) };
      if (cModal === 'new') await createCentre(payload);
      else await updateCentre(cModal.id, payload);
      setCModal(null); load();
    } catch (e) { setErr(e.response?.data?.message || e.response?.data?.error || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this recycling centre?')) return;
    await deleteCentre(id); load();
  };

  const toggleWasteType = (wt) => {
    setCForm(f => ({
      ...f, acceptedWasteTypes: f.acceptedWasteTypes.includes(wt)
        ? f.acceptedWasteTypes.filter(t => t !== wt)
        : [...f.acceptedWasteTypes, wt],
    }));
  };

  const capacityPct = (c) => c.maxCapacityKg > 0 ? Math.round((c.currentLoadKg / c.maxCapacityKg) * 100) : 0;
  const capColor = (pct) => pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--accent-green)';
  const uniqueWasteTypes = (types = []) => [...new Set(types.filter(Boolean))];

  return (
    <div>
      <div className="flex-between page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">📍 Recycle Centres</h1>
          <p className="page-subtitle">Find nearby recycling drop-off locations</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openNew}>+ Add Centre</button>}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: 260, gap: '0.5rem' }}>
          <input className="form-input" placeholder="🤖 AI search: e.g. plastic centres in Colombo"
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }} />
          <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
            {searching ? <span className="spinner" /> : '🔍'}
          </button>
          {searchQuery && <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); load(); }}>✕</button>}
        </div>
        <select className="form-select" style={{ width: 200 }} value={filterWaste} onChange={e => handleFilterWaste(e.target.value)}>
          <option value="">All waste types</option>
          {WASTE_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
      </div>

      {/* Centre cards */}
      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : centres.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">📍</div><p>No centres found</p></div>
      ) : (
        <div className="grid-2">
          {centres.map(c => {
            const pct = capacityPct(c);
            const wasteTypes = uniqueWasteTypes(c.acceptedWasteTypes);
            return (
              <div key={c.id} className="card" style={{ cursor: 'pointer', border: selected?.id === c.id ? '1px solid var(--accent-green)' : undefined }}
                onClick={() => setSelected(s => s?.id === c.id ? null : c)}>
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{c.name}</h3>
                  <span className="badge" style={{ background: `${capColor(pct)}22`, color: capColor(pct), border: `1px solid ${capColor(pct)}44` }}>
                    {pct}% full
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  📍 {c.address}
                </div>
                {c.operatingHours && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    🕐 {c.operatingHours}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {wasteTypes.map((wt, index) => <span key={`${c.id || c._id || c.name}-${wt}-${index}`} className="badge badge-teal">{wt}</span>)}
                </div>
                {/* Capacity bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Capacity</span><span>{c.currentLoadKg?.toLocaleString()} / {c.maxCapacityKg?.toLocaleString()} kg</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${capColor(pct)}, ${capColor(pct)}aa)` }} />
                  </div>
                </div>

                {selected?.id === c.id && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }} onClick={e => e.stopPropagation()}>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${c.location?.coordinates?.[1]},${c.location?.coordinates?.[0]}`}
                      target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">🗺 Directions</a>
                    {isManager && <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>}
                    {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>🗑 Delete</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      {cModal !== null && (
        <Modal title={cModal === 'new' ? 'Add Recycling Centre' : 'Edit Centre'} onClose={() => setCModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-input" value={cForm.name} onChange={e => setCForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Address</label>
              <input className="form-input" value={cForm.address} onChange={e => setCForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Longitude</label>
                <input type="number" step="any" className="form-input" value={cForm.location.coordinates[0]}
                  onChange={e => setCForm(f => ({ ...f, location: { ...f.location, coordinates: [parseFloat(e.target.value), f.location.coordinates[1]] } }))} /></div>
              <div className="form-group"><label className="form-label">Latitude</label>
                <input type="number" step="any" className="form-input" value={cForm.location.coordinates[1]}
                  onChange={e => setCForm(f => ({ ...f, location: { ...f.location, coordinates: [f.location.coordinates[0], parseFloat(e.target.value)] } }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Operating Hours</label>
              <input className="form-input" placeholder="e.g. Mon-Fri 08:00-18:00" value={cForm.operatingHours} onChange={e => setCForm(f => ({ ...f, operatingHours: e.target.value }))} /></div>
            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Max Capacity (kg)</label>
                <input type="number" className="form-input" value={cForm.maxCapacityKg} onChange={e => setCForm(f => ({ ...f, maxCapacityKg: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Current Load (kg)</label>
                <input type="number" className="form-input" value={cForm.currentLoadKg} onChange={e => setCForm(f => ({ ...f, currentLoadKg: e.target.value }))} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Accepted Waste Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {WASTE_TYPES.map(wt => (
                  <button key={wt} type="button"
                    className={`badge ${cForm.acceptedWasteTypes.includes(wt) ? 'badge-green' : 'badge-teal'}`}
                    onClick={() => toggleWasteType(wt)}
                    style={{ cursor: 'pointer', padding: '0.3rem 0.7rem' }}>
                    {cForm.acceptedWasteTypes.includes(wt) ? '✓ ' : ''}{wt}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={saveCentre} disabled={saving}>
              {saving ? <span className="spinner" /> : cModal === 'new' ? 'Create Centre' : 'Update Centre'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
