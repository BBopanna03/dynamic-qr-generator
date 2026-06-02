import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const API = process.env.REACT_APP_API_URL || '';

const CARD_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
];

function getToken()    { return localStorage.getItem('token'); }
function getUsername() { return localStorage.getItem('username') || 'there'; }

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function AuthForm({ onLogin }) {
  const [mode, setMode]               = useState('login');
  const [form, setForm]               = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPw]     = useState(false);
  const [showConfirm,  setShowCf]     = useState(false);
  const [error,   setError]           = useState('');
  const [success, setSuccess]         = useState('');
  const [loading, setLoading]         = useState(false);

  function switchMode(m) {
    setMode(m); setError(''); setSuccess('');
    setForm({ username: '', email: '', password: '', confirm: '' });
    setShowPw(false); setShowCf(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'register') {
      if (form.password.length < 6)            { setError('Password must be at least 6 characters.'); return; }
      if (form.password !== form.confirm)       { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        const res  = await fetch(`${API}/api/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username, email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Registration failed.'); return; }
        setSuccess('🎉 Account created! Please sign in to continue.');
        switchMode('login');
        return;
      }

      const res  = await fetch(`${API}/api/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || 'Invalid username or password.'); return; }
      localStorage.setItem('token',    data.access);
      localStorage.setItem('refresh',  data.refresh);
      localStorage.setItem('username', form.username);
      onLogin(data.access);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const pwMatch    = form.confirm && form.confirm === form.password;
  const pwMismatch = form.confirm && form.confirm !== form.password;

  return (
    <div className="auth-wrap">
      <div className="auth-blob auth-blob-1" />
      <div className="auth-blob auth-blob-2" />
      <div className="auth-card">
        <div className="auth-logo">⚡</div>
        <h1 className="auth-title">QR Studio</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Welcome back!'
            : 'Join teams, creators & businesses already using QR Studio.'}
        </p>

        <div className="auth-tabs">
          <button className={`auth-tab${mode === 'login'    ? ' active' : ''}`} onClick={() => switchMode('login')}>Sign In</button>
          <button className={`auth-tab${mode === 'register' ? ' active' : ''}`} onClick={() => switchMode('register')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Username</label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="e.g. acme_corp"
              required autoComplete="username"
            />
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Email <span className="label-optional">(optional)</span></label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label>Password</label>
            <div className="input-eye">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                required
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button type="button" className="eye-btn" onClick={() => setShowPw(v => !v)} title="Toggle visibility">
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-eye">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter your password"
                  required
                  autoComplete="new-password"
                  className={pwMismatch ? 'input-error' : pwMatch ? 'input-success' : ''}
                />
                <button type="button" className="eye-btn" onClick={() => setShowCf(v => !v)} title="Toggle visibility">
                  {showConfirm ? '🙈' : '👁️'}
                </button>
              </div>
              {pwMismatch && <p className="field-msg field-error">✗ Passwords do not match</p>}
              {pwMatch    && <p className="field-msg field-success">✓ Passwords match</p>}
            </div>
          )}

          {error   && <p className="form-alert form-alert-error">{error}</p>}
          {success && <p className="form-alert form-alert-success anim-pop">{success}</p>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading
              ? <><span className="btn-spinner" /> Please wait…</>
              : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login'
            ? <>New here? <button className="link-btn" onClick={() => switchMode('register')}>Create a free account</button></>
            : <>Already have an account? <button className="link-btn" onClick={() => switchMode('login')}>Sign in</button></>}
        </p>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function MainApp({ onLogout }) {
  const [qrcodes, setQrcodes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState('');
  const [form, setForm]         = useState({ name: '', destination_url: '', fg_color: '#000000', bg_color: '#ffffff' });
  const [editing, setEditing]   = useState({});
  const username = getUsername();

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/qrcodes/`, { headers: authHeaders() });
      if (res.status === 401) { onLogout(); return; }
      setQrcodes(await res.json());
    } catch {
      setError('Could not load QR codes. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.destination_url.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/qrcodes/`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(form),
      });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) { const err = await res.json(); setError(err.error || 'Failed to generate QR code.'); return; }
      setForm({ name: '', destination_url: '', fg_color: '#000000', bg_color: '#ffffff' });
      await fetchAll();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setCreating(false);
    }
  }

  async function handleUpdate(id) {
    const newUrl = editing[id];
    if (!newUrl) return;
    try {
      const res = await fetch(`${API}/api/qrcodes/${id}/`, {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ destination_url: newUrl }),
      });
      if (res.status === 401) { onLogout(); return; }
      setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
      await fetchAll();
    } catch { setError('Failed to update destination URL.'); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this QR code? This cannot be undone.')) return;
    try {
      const res = await fetch(`${API}/api/qrcodes/${id}/`, { method: 'DELETE', headers: authHeaders() });
      if (res.status === 401) { onLogout(); return; }
      await fetchAll();
    } catch { setError('Failed to delete.'); }
  }

  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="app">

      {/* ── Top Bar ── */}
      <header className="top-bar">
        <div className="top-brand">
          <span className="brand-icon">⚡</span>
          <span className="brand-name">QR Studio</span>
        </div>
        <div className="top-right">
          <span className="top-user">👤 {username}</span>
          <button className="btn btn-signout" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="main-content">

        {/* ── Hero ── */}
        <section className="hero">
          <h1 className="hero-title">Create Smart QR Codes</h1>
          <p className="hero-sub">For menus, docs, portfolios, campaigns — and everything in between.</p>
        </section>

        {/* ── Create Card ── */}
        <div className="create-card">
          <div className="create-card-header">
            <span className="create-icon">✦</span>
            <div>
              <h2>Generate a New QR Code</h2>
              <p className="create-desc">Link to any URL — websites, PDFs, menus, social profiles, and more.</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label>Campaign / Label <span className="req">*</span></label>
                <input
                  placeholder="e.g. Restaurant Menu, Event Flyer, Product Page"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label>Destination URL <span className="req">*</span></label>
                <input
                  placeholder="https://your-link-here.com"
                  value={form.destination_url}
                  onChange={e => setForm(f => ({ ...f, destination_url: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-row colors-row">
              <div className="form-group">
                <label>QR Color</label>
                <div className="color-pick">
                  <input type="color" value={form.fg_color} onChange={e => setForm(f => ({ ...f, fg_color: e.target.value }))} />
                  <span className="color-hex">{form.fg_color}</span>
                </div>
              </div>
              <div className="form-group">
                <label>Background</label>
                <div className="color-pick">
                  <input type="color" value={form.bg_color} onChange={e => setForm(f => ({ ...f, bg_color: e.target.value }))} />
                  <span className="color-hex">{form.bg_color}</span>
                </div>
              </div>
              <div className="form-group preview-group">
                <label>Preview</label>
                <div className="color-preview-box" style={{ background: form.bg_color }}>
                  <div className="color-preview-dot" style={{ background: form.fg_color }} />
                </div>
              </div>
            </div>

            {error && <p className="form-alert form-alert-error">{error}</p>}

            <button className="btn btn-primary btn-generate" type="submit" disabled={creating}>
              {creating
                ? <><span className="btn-spinner" /> Generating…</>
                : '⚡ Generate QR Code'}
            </button>
          </form>
        </div>

        {/* ── Library ── */}
        <div className="library-header">
          <h2 className="library-title">Your QR Library</h2>
          <span className="library-badge">{qrcodes.length} code{qrcodes.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="skeleton-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : qrcodes.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎯</span>
            <h3>Your QR library is empty</h3>
            <p>Generate your first QR code above — it only takes a few seconds.</p>
          </div>
        ) : (
          <div className="qr-grid">
            {qrcodes.map((qr, i) => (
              <div key={qr.id} className="qr-card" style={{ animationDelay: `${i * 0.07}s` }}>
                <div className="qr-card-top" style={{ background: CARD_GRADIENTS[i % CARD_GRADIENTS.length] }}>
                  {qr.qr_image && <img src={qr.qr_image} alt={`QR for ${qr.name}`} />}
                </div>
                <div className="qr-card-body">
                  <h3 className="qr-name">{qr.name}</h3>
                  <div className="qr-meta-row">
                    <span className="scan-badge">🔍 {qr.scan_count} scan{qr.scan_count !== 1 ? 's' : ''}</span>
                    <span className="qr-date">{fmtDate(qr.created_at)}</span>
                  </div>
                  <p className="qr-dest">
                    <a href={qr.destination_url} target="_blank" rel="noreferrer">
                      {qr.destination_url.length > 38 ? qr.destination_url.slice(0, 38) + '…' : qr.destination_url}
                    </a>
                  </p>
                  <div className="url-edit">
                    <input
                      placeholder="Redirect to a new URL…"
                      value={editing[qr.id] ?? ''}
                      onChange={e => setEditing(prev => ({ ...prev, [qr.id]: e.target.value }))}
                    />
                    <div className="card-actions">
                      <button className="btn btn-save"   onClick={() => handleUpdate(qr.id)} disabled={!editing[qr.id]}>Update</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(qr.id)}>Delete</button>
                      <a      className="btn btn-dl"     href={qr.qr_image} download={`${qr.short_code}.png`}>↓ PNG</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(getToken());
  function handleLogin(t)  { setToken(t); }
  function handleLogout()  {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('username');
    setToken(null);
  }
  if (!token) return <AuthForm onLogin={handleLogin} />;
  return <MainApp onLogout={handleLogout} />;
}
