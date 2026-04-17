import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL || '';

function App() {
  const [qrcodes, setQrcodes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    name: '',
    destination_url: '',
    fg_color: '#000000',
    bg_color: '#ffffff',
  });

  // editing state: { id, destination_url }
  const [editing, setEditing] = useState({});

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/qrcodes/`);
      const data = await res.json();
      setQrcodes(data);
    } catch {
      setError('Could not load QR codes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.destination_url.trim()) {
      setError('Name and destination URL are required.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/qrcodes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'Failed to create QR code.');
        return;
      }
      setForm({ name: '', destination_url: '', fg_color: '#000000', bg_color: '#ffffff' });
      await fetchAll();
    } catch {
      setError('Network error. Check your connection.');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id) {
    const newUrl = editing[id];
    if (!newUrl) return;
    try {
      await fetch(`${API}/api/qrcodes/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_url: newUrl }),
      });
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchAll();
    } catch {
      setError('Failed to update.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this QR code?')) return;
    try {
      await fetch(`${API}/api/qrcodes/${id}/`, { method: 'DELETE' });
      await fetchAll();
    } catch {
      setError('Failed to delete.');
    }
  }

  return (
    <div className="app">
      <h1>QR Code Generator</h1>

      {/* Create form */}
      <div className="card">
        <h2>Create New QR Code</h2>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Name</label>
            <input
              placeholder="e.g. Menu Poster"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label>Destination URL</label>
            <input
              placeholder="https://example.com"
              value={form.destination_url}
              onChange={e => setForm(f => ({ ...f, destination_url: e.target.value }))}
            />
          </div>
          <div className="colors">
            <div className="form-group">
              <label>QR Color</label>
              <input
                type="color"
                value={form.fg_color}
                onChange={e => setForm(f => ({ ...f, fg_color: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Background</label>
              <input
                type="color"
                value={form.bg_color}
                onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))}
              />
            </div>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={creating}>
            {creating ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>

      {/* QR code list */}
      {loading ? (
        <p className="loading">Loading...</p>
      ) : qrcodes.length === 0 ? (
        <p className="empty">No QR codes yet. Create one above.</p>
      ) : (
        <div className="qr-grid">
          {qrcodes.map(qr => (
            <div key={qr.id} className="qr-card">
              {qr.qr_image && (
                <img src={qr.qr_image} alt={`QR for ${qr.name}`} />
              )}
              <h3>{qr.name}</h3>
              <span className="badge">{qr.scan_count} scan{qr.scan_count !== 1 ? 's' : ''}</span>
              <p className="meta">
                <a href={qr.destination_url} target="_blank" rel="noreferrer">
                  {qr.destination_url.length > 40
                    ? qr.destination_url.slice(0, 40) + '…'
                    : qr.destination_url}
                </a>
              </p>

              {/* Inline URL editor */}
              <div className="url-edit">
                <input
                  placeholder="New destination URL"
                  value={editing[qr.id] ?? ''}
                  onChange={e =>
                    setEditing(prev => ({ ...prev, [qr.id]: e.target.value }))
                  }
                />
                <div className="actions">
                  <button
                    className="btn btn-save"
                    onClick={() => handleUpdate(qr.id)}
                    disabled={!editing[qr.id]}
                  >
                    Save URL
                  </button>
                  <button className="btn btn-danger" onClick={() => handleDelete(qr.id)}>
                    Delete
                  </button>
                  <a
                    className="btn btn-primary"
                    href={qr.qr_image}
                    download={`${qr.short_code}.png`}
                    style={{ fontSize: '0.8rem', padding: '6px 12px', textDecoration: 'none' }}
                  >
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
