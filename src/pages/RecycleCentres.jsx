import { useEffect, useState } from 'react';
import {
  getCentres,
  getCentresByWasteType,
  searchCentres,
  createCentre,
  deleteCentre,
  updateCentre,
} from '../api/centresApi';
import { getCategories } from '../api/wasteApi';
import useAuthStore from '../store/authStore';

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const tone = toast.type === 'error'
    ? { bg: 'rgba(239,68,68,0.14)', border: 'rgba(239,68,68,0.28)', color: 'var(--danger)', title: 'Error' }
    : { bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.28)', color: 'var(--accent-green)', title: 'Success' };

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 1200, width: 'min(360px, calc(100vw - 2rem))' }}>
      <div className="fade-in" style={{
        background: tone.bg,
        border: `1px solid ${tone.border}`,
        borderRadius: 14,
        boxShadow: '0 18px 40px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(10px)',
        padding: '0.95rem 1rem',
      }}>
        <div className="flex-between" style={{ gap: '0.75rem', alignItems: 'flex-start' }}>
          <div>
            <div style={{ color: tone.color, fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.2rem' }}>{tone.title}</div>
            <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.45 }}>{toast.message}</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>X</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.2rem' }}>{title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>X</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Cancel', onConfirm, onCancel, busy }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && !busy && onCancel()}>
      <div className="modal-box" style={{ maxWidth: 460 }}>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem' }}>{title}</h2>
          <button className="btn btn-secondary btn-sm" onClick={onCancel} disabled={busy}>X</button>
        </div>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy} style={{ justifyContent: 'center', minWidth: 120 }}>
            {busy ? <span className="spinner" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const emptyForm = {
  name: '',
  address: '',
  location: { type: 'Point', coordinates: [0, 0] },
  acceptedWasteTypes: [],
  operatingHours: '',
  maxCapacityKg: '',
  currentLoadKg: '',
};

const getCentreId = (centre) => centre?.id || centre?._id || '';
const uniqueWasteTypes = (types = []) => [...new Set(types.filter(Boolean))];
const capacityPct = (centre) => centre.maxCapacityKg > 0 ? Math.round((centre.currentLoadKg / centre.maxCapacityKg) * 100) : 0;
const capColor = (pct) => pct >= 90 ? 'var(--danger)' : pct >= 70 ? 'var(--warning)' : 'var(--accent-green)';

function validateCentre(payload, validWasteTypes) {
  if (!payload.name?.trim()) return 'Name is required.';
  if (!payload.address?.trim()) return 'Address is required.';
  if (payload.location?.type !== 'Point') return 'Location type must be Point.';
  if (!Array.isArray(payload.location?.coordinates) || payload.location.coordinates.length !== 2) {
    return 'Location coordinates must be [lng, lat].';
  }

  const [lng, lat] = payload.location.coordinates;
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return 'Longitude and latitude must be valid numbers.';
  if (payload.acceptedWasteTypes.length === 0) return 'Select at least one accepted waste type.';
  if (validWasteTypes.length === 0) return 'Waste type list is unavailable. Add categories before saving.';
  if (payload.acceptedWasteTypes.some(type => !validWasteTypes.includes(type))) {
    return 'Selected waste types must match the backend category names.';
  }
  if (!Number.isFinite(payload.maxCapacityKg) || payload.maxCapacityKg < 1) return 'Max capacity must be at least 1 kg.';
  if (!Number.isFinite(payload.currentLoadKg) || payload.currentLoadKg < 0) return 'Current load must be 0 or greater.';
  if (payload.currentLoadKg > payload.maxCapacityKg) return 'Current load cannot exceed max capacity.';

  return '';
}

export default function RecycleCentres() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager' || user?.role === 'admin';

  const [centres, setCentres] = useState([]);
  const [wasteTypes, setWasteTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filterWaste, setFilterWaste] = useState('');
  const [selected, setSelected] = useState(null);
  const [pageErr, setPageErr] = useState('');

  const [cModal, setCModal] = useState(null);
  const [cForm, setCForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [deletingId, setDeletingId] = useState('');

  const showToast = (message, type = 'success') => setToast({ message, type });

  const load = async () => {
    setLoading(true);
    setPageErr('');
    try {
      const r = await getCentres();
      setCentres(r.data.recyclingCenters || []);
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.error || 'Failed to load recycle centres.';
      setCentres([]);
      setPageErr(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadWasteTypes = async () => {
    try {
      const r = await getCategories({ page: 1, limit: 100 });
      const raw = r.data?.categories || r.data?.data || [];
      const names = [...new Set(raw.map(category => category?.name).filter(Boolean))];
      setWasteTypes(names);
    } catch {
      setWasteTypes([]);
    }
  };

  useEffect(() => {
    load();
    loadWasteTypes();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return load();

    setSearching(true);
    setPageErr('');
    try {
      const r = await searchCentres(searchQuery);
      setCentres(r.data.recyclingCenters || []);
      showToast(`Found ${r.data.recyclingCenters?.length || 0} recycle centre${(r.data.recyclingCenters?.length || 0) !== 1 ? 's' : ''}.`);
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.error || 'Search failed.';
      setCentres([]);
      setPageErr(message);
      showToast(message, 'error');
    } finally {
      setSearching(false);
    }
  };

  const handleFilterWaste = async (wasteType) => {
    setFilterWaste(wasteType);
    if (!wasteType) return load();

    setLoading(true);
    setPageErr('');
    try {
      const r = await getCentresByWasteType(wasteType);
      setCentres(r.data.recyclingCenters || []);
      showToast(`Showing ${r.data.recyclingCenters?.length || 0} centre${(r.data.recyclingCenters?.length || 0) !== 1 ? 's' : ''} for ${wasteType}.`);
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.error || 'Failed to filter recycle centres.';
      setCentres([]);
      setPageErr(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setCForm(emptyForm);
    setCModal('new');
    setErr('');
  };

  const openEdit = (centre) => {
    setCForm({
      name: centre.name || '',
      address: centre.address || '',
      location: centre.location || { type: 'Point', coordinates: [0, 0] },
      acceptedWasteTypes: uniqueWasteTypes(centre.acceptedWasteTypes),
      operatingHours: centre.operatingHours || '',
      maxCapacityKg: centre.maxCapacityKg ?? '',
      currentLoadKg: centre.currentLoadKg ?? '',
    });
    setCModal(centre);
    setErr('');
  };

  const saveCentre = async () => {
    setSaving(true);
    setErr('');

    try {
      const payload = {
        ...cForm,
        location: {
          type: 'Point',
          coordinates: [Number(cForm.location.coordinates[0]), Number(cForm.location.coordinates[1])],
        },
        acceptedWasteTypes: uniqueWasteTypes(cForm.acceptedWasteTypes),
        maxCapacityKg: Number(cForm.maxCapacityKg),
        currentLoadKg: Number(cForm.currentLoadKg),
      };

      const validationError = validateCentre(payload, wasteTypes);
      if (validationError) {
        setErr(validationError);
        return;
      }

      if (cModal === 'new') await createCentre(payload);
      else await updateCentre(getCentreId(cModal), payload);

      setCModal(null);
      showToast(cModal === 'new' ? 'Recycle centre created successfully.' : 'Recycle centre updated successfully.');
      load();
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.error || 'Error';
      setErr(message);
      showToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setPageErr('');
    try {
      await deleteCentre(id);
      setConfirmState(null);
      showToast('Recycle centre deleted successfully.');
      load();
    } catch (e) {
      const message = e.response?.data?.message || e.response?.data?.error || 'Failed to delete recycle centre.';
      setPageErr(message);
      showToast(message, 'error');
    } finally {
      setDeletingId('');
    }
  };

  const toggleWasteType = (wasteType) => {
    setCForm(form => ({
      ...form,
      acceptedWasteTypes: form.acceptedWasteTypes.includes(wasteType)
        ? form.acceptedWasteTypes.filter(type => type !== wasteType)
        : [...form.acceptedWasteTypes, wasteType],
    }));
  };

  return (
    <div>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {confirmState && (
        <ConfirmDialog
          title="Delete Recycle Centre"
          message={`Delete "${confirmState.name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          onCancel={() => {
            if (!deletingId) setConfirmState(null);
          }}
          onConfirm={() => handleDelete(confirmState.id)}
          busy={deletingId === confirmState.id}
        />
      )}

      <div className="flex-between page-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Recycle Centres</h1>
          <p className="page-subtitle">Find nearby recycling drop-off locations</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openNew}>+ Add Centre</button>}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flex: 1, minWidth: 260, gap: '0.5rem' }}>
          <input
            className="form-input"
            placeholder="AI search: e.g. plastic centres in Colombo"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn btn-primary" onClick={handleSearch} disabled={searching}>
            {searching ? <span className="spinner" /> : 'Search'}
          </button>
          {searchQuery && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setSearchQuery(''); load(); }}>
              Clear
            </button>
          )}
        </div>
        <select className="form-select" style={{ width: 220 }} value={filterWaste} onChange={e => handleFilterWaste(e.target.value)}>
          <option value="">All waste types</option>
          {wasteTypes.map(wasteType => <option key={wasteType} value={wasteType}>{wasteType}</option>)}
        </select>
      </div>

      {pageErr && <div className="error-msg" style={{ marginBottom: '1rem' }}>{pageErr}</div>}

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><span className="spinner" style={{ width: 36, height: 36 }} /></div>
      ) : centres.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon">[ ]</div><p>No centres found</p></div>
      ) : (
        <div className="grid-2">
          {centres.map(centre => {
            const pct = capacityPct(centre);
            const centreId = getCentreId(centre);
            const centreWasteTypes = uniqueWasteTypes(centre.acceptedWasteTypes);
            const isSelected = getCentreId(selected) === centreId;

            return (
              <div
                key={centreId || centre.name}
                className="card"
                style={{ cursor: 'pointer', border: isSelected ? '1px solid var(--accent-green)' : undefined }}
                onClick={() => setSelected(current => getCentreId(current) === centreId ? null : centre)}
              >
                <div className="flex-between" style={{ marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{centre.name}</h3>
                  <span className="badge" style={{ background: `${capColor(pct)}22`, color: capColor(pct), border: `1px solid ${capColor(pct)}44` }}>
                    {pct}% full
                  </span>
                </div>

                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {centre.address}
                </div>

                {centre.operatingHours && (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {centre.operatingHours}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {centreWasteTypes.map((wasteType, index) => (
                    <span key={`${centreId || centre.name}-${wasteType}-${index}`} className="badge badge-teal">{wasteType}</span>
                  ))}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    <span>Capacity</span>
                    <span>{centre.currentLoadKg?.toLocaleString()} / {centre.maxCapacityKg?.toLocaleString()} kg</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${capColor(pct)}, ${capColor(pct)}aa)` }} />
                  </div>
                </div>

                {isSelected && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }} onClick={e => e.stopPropagation()}>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${centre.location?.coordinates?.[1]},${centre.location?.coordinates?.[0]}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Directions
                    </a>
                    {isManager && <button className="btn btn-secondary btn-sm" onClick={() => openEdit(centre)}>Edit</button>}
                    {isAdmin && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => setConfirmState({ id: centreId, name: centre.name || 'this recycle centre' })}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {cModal !== null && (
        <Modal title={cModal === 'new' ? 'Add Recycling Centre' : 'Edit Centre'} onClose={() => setCModal(null)}>
          {err && <div className="error-msg" style={{ marginBottom: '1rem' }}>{err}</div>}
          {wasteTypes.length === 0 && (
            <div className="error-msg" style={{ marginBottom: '1rem' }}>
              No waste categories are available. Add categories first before creating or updating a recycle centre.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-input" value={cForm.name} onChange={e => setCForm(form => ({ ...form, name: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={cForm.address} onChange={e => setCForm(form => ({ ...form, address: e.target.value }))} />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={cForm.location.coordinates[0]}
                  onChange={e => setCForm(form => ({
                    ...form,
                    location: { ...form.location, coordinates: [e.target.value, form.location.coordinates[1]] },
                  }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={cForm.location.coordinates[1]}
                  onChange={e => setCForm(form => ({
                    ...form,
                    location: { ...form.location, coordinates: [form.location.coordinates[0], e.target.value] },
                  }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Operating Hours</label>
              <input
                className="form-input"
                placeholder="e.g. Mon-Fri 08:00-18:00"
                value={cForm.operatingHours}
                onChange={e => setCForm(form => ({ ...form, operatingHours: e.target.value }))}
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Max Capacity (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={cForm.maxCapacityKg}
                  onChange={e => setCForm(form => ({ ...form, maxCapacityKg: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Load (kg)</label>
                <input
                  type="number"
                  className="form-input"
                  value={cForm.currentLoadKg}
                  onChange={e => setCForm(form => ({ ...form, currentLoadKg: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Accepted Waste Types</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {wasteTypes.map(wasteType => (
                  <button
                    key={wasteType}
                    type="button"
                    className={`badge ${cForm.acceptedWasteTypes.includes(wasteType) ? 'badge-green' : 'badge-teal'}`}
                    onClick={() => toggleWasteType(wasteType)}
                    style={{ cursor: 'pointer', padding: '0.3rem 0.7rem' }}
                  >
                    {cForm.acceptedWasteTypes.includes(wasteType) ? 'Selected: ' : ''}{wasteType}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" onClick={saveCentre} disabled={saving || wasteTypes.length === 0}>
              {saving ? <span className="spinner" /> : cModal === 'new' ? 'Create Centre' : 'Update Centre'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
