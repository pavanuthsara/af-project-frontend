import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { identifyWaste } from '../api/aiApi';

export default function Identify() {
  const navigate = useNavigate();
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [drag, setDrag] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null); setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleIdentify = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const { data } = await identifyWaste(file);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Identification failed');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = {
    high: 'var(--accent-green)', medium: 'var(--warning)', low: 'var(--danger)',
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔍 AI Waste Identifier</h1>
        <p className="page-subtitle">Upload a photo of waste to get instant identification and disposal instructions</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Upload zone */}
        <div>
          <div
            className={`upload-zone${drag ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current.click()}
            style={{ cursor: 'pointer', minHeight: 260 }}
          >
            {preview ? (
              <img src={preview} alt="preview" style={{ maxHeight: 220, borderRadius: 12, objectFit: 'contain' }} />
            ) : (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📸</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Drop image here or click to upload</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>JPEG, JPG, PNG • Max 5MB</div>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/jpg,image/png" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />
          </div>

          {file && (
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" onClick={handleIdentify} disabled={loading}
                style={{ flex: 1, justifyContent: 'center' }}>
                {loading ? <><span className="spinner" /> Analysing…</> : '🤖 Identify Waste'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setPreview(null); setResult(null); }}>
                ✕ Clear
              </button>
            </div>
          )}

          {error && (
            <div className="error-msg" style={{ marginTop: '1rem' }}>
              {error}
              {error.includes('Not in our database') && (
                <div style={{ marginTop: '0.5rem' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate('/waste')}>Browse Waste Library</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Result */}
        <div>
          {loading && (
            <div className="card flex-center" style={{ height: 300, flexDirection: 'column', gap: '1rem' }}>
              <span className="spinner" style={{ width: 48, height: 48 }} />
              <div style={{ color: 'var(--text-muted)' }}>Gemini AI is analysing your image…</div>
            </div>
          )}

          {result && !loading && (
            <div className="card fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '2.5rem' }}>♻️</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', textTransform: 'capitalize' }}>{result.detectedLabel}</div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span className="badge" style={{ color: confidenceColor[result.confidence], background: `${confidenceColor[result.confidence]}22`, border: `1px solid ${confidenceColor[result.confidence]}44` }}>
                      ● {result.confidence} confidence
                    </span>
                    {result.category && <span className="badge badge-teal">{result.category.name}</span>}
                  </div>
                </div>
              </div>

              {result.disposalInstructions && (
                <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent-green)' }}>♻️ How to Dispose</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>{result.disposalInstructions}</div>
                </div>
              )}

              {result.category && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Category</div>
                  <div style={{ fontWeight: 600 }}>{result.category.name}</div>
                  {result.category.description && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{result.category.description}</div>}
                </div>
              )}

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/disposal', { state: { wasteId: result.category?._id, label: result.detectedLabel } })}
              >
                📋 Log This Disposal
              </button>
              <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                onClick={() => { setResult(null); setFile(null); setPreview(null); }}>
                🔄 Identify Another
              </button>
            </div>
          )}

          {!loading && !result && !file && (
            <div className="card" style={{ height: 300 }}>
              <div className="empty-state" style={{ paddingTop: '3.5rem' }}>
                <div className="empty-state-icon">🤖</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Powered by Gemini AI</div>
                <p style={{ fontSize: '0.875rem', maxWidth: 260, margin: '0 auto' }}>
                  Upload any waste item photo and our AI will identify it and give you proper disposal instructions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>📌 Tips for best results</h3>
        <div className="grid-3" style={{ gap: '1rem' }}>
          {[
            { icon: '💡', tip: 'Use a well-lit photo with the item clearly visible' },
            { icon: '📐', tip: 'Place the item against a plain background' },
            { icon: '🎯', tip: 'Include the full item — caps, labels, and all' },
          ].map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>{t.icon}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t.tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
