import { useEffect, useState } from 'react';
import { getCategories, getItems, createCategory, updateCategory, deleteCategory, createItem, deleteItem, updateItem } from '../api/wasteApi';
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

export default function WasteLibrary() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const [tab, setTab] = useState('categories');

  // Categories
  const [cats, setCats] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catModal, setCatModal] = useState(null); // null | 'new' | {edit obj}

  // Items
  const [items, setItems] = useState([]);
  const [itemLoading, setItemLoading] = useState(true);
  const [itemModal, setItemModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null); // null | { type, id, name }
  const [search, setSearch] = useState('');
  const [filterRecyclable, setFilterRecyclable] = useState('');
  const [filterHazardous, setFilterHazardous] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Forms
  const [catForm, setCatForm] = useState({ name: '', description: '', recyclable: true, hazardous: false, compostable: false });
  const [itemForm, setItemForm] = useState({ name: '', description: '', category: '' });
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState('');

  const loadCats = () => {
    setCatLoading(true);
    getCategories({ page: 1, limit: 50 }).then(r => { setCats(r.data.data || []); setCatLoading(false); });
  };
  const loadItems = () => {
    setItemLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (filterRecyclable) params.recyclable = filterRecyclable;
    if (filterHazardous) params.hazardous = filterHazardous;
    getItems(params).then(r => { setItems(r.data.data || []); setPagination(r.data.pagination); setItemLoading(false); });
  };

  useEffect(() => { loadCats(); }, []);
  useEffect(() => { loadItems(); }, [page, search, filterRecyclable, filterHazardous]);

  // Category CRUD
  const openNewCat = () => { setCatForm({ name: '', description: '', recyclable: true, hazardous: false, compostable: false }); setCatModal('new'); setFormErr(''); };
  const openEditCat = (c) => { setCatForm({ name: c.name, description: c.description, recyclable: c.recyclable, hazardous: c.hazardous, compostable: c.compostable }); setCatModal(c); setFormErr(''); };
  const saveCat = async () => {
    setSaving(true); setFormErr('');
    try {
      if (catModal === 'new') await createCategory(catForm);
      else await updateCategory(catModal._id, catForm);
      setCatModal(null); loadCats();
    } catch (e) { setFormErr(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };
  const deleteCat = async (id) => {
    await deleteCategory(id); loadCats();
  };

  // Item CRUD
  const openNewItem = () => { setItemForm({ name: '', description: '', category: cats[0]?._id || '' }); setItemModal('new'); setFormErr(''); };
  const openEditItem = (item) => { setItemForm({ name: item.name, description: item.description, category: item.category?._id || item.category || '' }); setItemModal(item); setFormErr(''); };
  const saveItem = async () => {
    setSaving(true); setFormErr('');
    try {
      if (itemModal === 'new') await createItem(itemForm);
      else await updateItem(itemModal._id, itemForm);
      setItemModal(null); loadItems();
    } catch (e) { setFormErr(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };
  const deleteItem2 = async (id) => {
    await deleteItem(id); loadItems();
  };

  const openDeleteModal = (type, entity) => {
    setDeleteModal({ type, id: entity._id, name: entity.name });
    setFormErr('');
  };

  const confirmDelete = async () => {
    if (!deleteModal) return;

    setSaving(true);
    try {
      if (deleteModal.type === 'category') await deleteCat(deleteModal.id);
      if (deleteModal.type === 'item') await deleteItem2(deleteModal.id);
      setDeleteModal(null);
    } catch (e) {
      setFormErr(e.response?.data?.error || 'Error');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex-between page-header">
        <div>
          <h1 className="page-title">♻️ Waste Library</h1>
          <p className="page-subtitle">Browse all waste categories and items</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={tab === 'categories' ? openNewCat : openNewItem}>
            + Add {tab === 'categories' ? 'Category' : 'Item'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['categories', 'items'].map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
            {t === 'categories' ? '🗂 Categories' : '🔬 Items'}
          </button>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      {tab === 'categories' && (
        catLoading ? <div className="flex-center" style={{ height: 200 }}><span className="spinner" /></div> :
        <div className="grid-3">
          {cats.map(c => (
            <div key={c._id} className="card" style={{ position: 'relative' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{c.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{c.description}</div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {c.recyclable && <span className="badge badge-green">♻️ Recyclable</span>}
                {c.hazardous && <span className="badge badge-red">☣️ Hazardous</span>}
                {c.compostable && <span className="badge badge-lime">🌱 Compostable</span>}
              </div>
              {isAdmin && (
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => openEditCat(c)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal('category', c)}>🗑 Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── ITEMS ── */}
      {tab === 'items' && (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <input className="form-input" placeholder="🔍 Search items…" style={{ flex: 1, minWidth: 200 }}
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Recyclability</label>
              <select className="form-select" style={{ width: 150 }} value={filterRecyclable} onChange={e => { setFilterRecyclable(e.target.value); setPage(1); }}>
                <option value="">All</option>
                <option value="true">Recyclable</option>
                <option value="false">Non-recyclable</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Hazard Level</label>
              <select className="form-select" style={{ width: 150 }} value={filterHazardous} onChange={e => { setFilterHazardous(e.target.value); setPage(1); }}>
                <option value="">All</option>
                <option value="true">Hazardous</option>
                <option value="false">Non-hazardous</option>
              </select>
            </div>
          </div>
          {itemLoading ? <div className="flex-center" style={{ height: 200 }}><span className="spinner" /></div> : (
            <>
              <div className="table-wrapper">
                <table>
                  <thead><tr><th>Name</th><th>Category</th><th>Flags</th>{isAdmin && <th>Actions</th>}</tr></thead>
                  <tbody>
                    {items.map(item => {
                      const itemCategory = typeof item.category === 'object'
                        ? item.category
                        : cats.find(c => c._id === item.category);

                      return (
                        <tr key={item._id}>
                          <td>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.description}</div>
                          </td>
                          <td><span className="badge badge-teal">{itemCategory?.name || 'Unknown'}</span></td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                              {itemCategory?.recyclable && <span className="badge badge-green">♻️ Recyclable</span>}
                              {itemCategory?.hazardous && <span className="badge badge-red">☣️ Hazardous</span>}
                              {itemCategory?.compostable && <span className="badge badge-lime">🌱 Compostable</span>}
                            </div>
                          </td>
                          {isAdmin && (
                            <td>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-secondary btn-sm" onClick={() => openEditItem(item)}>✏️</button>
                                <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal('item', item)}>🗑</button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pagination && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                  <button className="btn btn-secondary btn-sm" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>← Prev</button>
                  <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button className="btn btn-secondary btn-sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next →</button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Category modal */}
      {catModal !== null && (
        <Modal title={catModal === 'new' ? 'New Category' : 'Edit Category'} onClose={() => setCatModal(null)}>
          {formErr && <div className="error-msg" style={{ marginBottom: '1rem' }}>{formErr}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-input" value={catForm.name} onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={catForm.description} onChange={e => setCatForm(f => ({ ...f, description: e.target.value }))} /></div>
            {['recyclable', 'hazardous', 'compostable'].map(key => (
              <label key={key} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input type="checkbox" checked={catForm[key]} onChange={e => setCatForm(f => ({ ...f, [key]: e.target.checked }))}
                  style={{ accentColor: 'var(--accent-green)' }} />
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
            ))}
            <button className="btn btn-primary" onClick={saveCat} disabled={saving} style={{ marginTop: '0.5rem' }}>
              {saving ? <span className="spinner" /> : catModal === 'new' ? 'Create' : 'Update'}
            </button>
          </div>
        </Modal>
      )}

      {/* Item modal */}
      {itemModal !== null && (
        <Modal title={itemModal === 'new' ? 'New Waste Item' : 'Edit Item'} onClose={() => setItemModal(null)}>
          {formErr && <div className="error-msg" style={{ marginBottom: '1rem' }}>{formErr}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group"><label className="form-label">Name</label>
              <input className="form-input" value={itemForm.name} onChange={e => setItemForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Description</label>
              <textarea className="form-textarea" value={itemForm.description} onChange={e => setItemForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-select" value={itemForm.category} onChange={e => setItemForm(f => ({ ...f, category: e.target.value }))}>
                {cats.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select></div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Item flags are inherited from the selected category.
            </div>
            <button className="btn btn-primary" onClick={saveItem} disabled={saving} style={{ marginTop: '0.5rem' }}>
              {saving ? <span className="spinner" /> : itemModal === 'new' ? 'Create' : 'Update'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete confirmation modal */}
      {deleteModal !== null && (
        <Modal title={`Delete ${deleteModal.type === 'category' ? 'Category' : 'Item'}`} onClose={() => setDeleteModal(null)}>
          {formErr && <div className="error-msg" style={{ marginBottom: '1rem' }}>{formErr}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {deleteModal.type === 'category'
                ? `Delete "${deleteModal.name}" and all items under it? This action cannot be undone.`
                : `Delete "${deleteModal.name}"? This action cannot be undone.`}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn btn-secondary" onClick={() => setDeleteModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
