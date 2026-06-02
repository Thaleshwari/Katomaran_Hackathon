import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Link2, Copy, BarChart3, Clock, ExternalLink, LogOut, Trash2, Plus, Zap, QrCode, X, Download, Activity, Edit, Upload, Calendar } from 'lucide-react';
import { Toast } from './Toast';
import { useTheme, ThemeToggle } from './ThemeContext';

/* ─── CSV Parser Helper ─────────────────────────────────────── */
const parseCSV = (text) => {
  const lines = text.split(/\r?\n/);
  const result = [];
  
  const hasHeader = lines[0] && (lines[0].toLowerCase().includes('url') || lines[0].toLowerCase().includes('original'));
  const startIndex = hasHeader ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length > 0 && cols[0]) {
      result.push({
        originalUrl: cols[0],
        customAlias: cols[1] || '',
        expiryDate: cols[2] || '',
      });
    }
  }
  return result;
};

/* ─── Edit Modal ────────────────────────────────────────────── */
const EditModal = ({ urlEntry, onClose, onSaveSuccess }) => {
  const [originalUrl, setOriginalUrl] = useState(urlEntry.originalUrl);
  const [customAlias, setCustomAlias] = useState(urlEntry.customAlias || '');
  const [expiryDate, setExpiryDate] = useState(
    urlEntry.expiryDate ? new Date(urlEntry.expiryDate).toISOString().slice(0, 16) : ''
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.put(`/urls/${urlEntry.id}`, {
        originalUrl,
        customAlias: customAlias.trim() || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      });
      onSaveSuccess('Link updated successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update link details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal glass animate-scale" style={{ maxWidth: '480px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="qr-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--primary)', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}>
              <Edit size={18} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Edit Link Details</h3>
          </div>
          <button className="qr-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '100%', marginTop: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Destination URL</label>
            <input
              type="url"
              className="input"
              value={originalUrl}
              onChange={e => setOriginalUrl(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Custom Alias (Optional)</label>
            <input
              type="text"
              className="input"
              placeholder="e.g. summer-promo"
              value={customAlias}
              onChange={e => setCustomAlias(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          {error && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0, textAlign: 'left' }}>{error}</p>}

          <div className="qr-modal-actions" style={{ marginTop: '0.5rem' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── QR Code Modal ─────────────────────────────────────────── */
const QrModal = ({ urlEntry, onClose }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQr = async () => {
      try {
        const res = await api.get(`/urls/${urlEntry.id}/qrcode`);
        setQrData(res.data);
      } catch {
        setError('Failed to generate QR code');
      } finally {
        setLoading(false);
      }
    };
    fetchQr();
  }, [urlEntry.id]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrData.qrCode;
    link.download = `qr-${urlEntry.shortUrl}.png`;
    link.click();
  };

  return (
    <div className="qr-overlay" onClick={onClose}>
      <div className="qr-modal glass animate-scale" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="qr-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'var(--primary)', borderRadius: '8px', padding: '0.4rem', display: 'flex' }}>
              <QrCode size={18} color="#fff" />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>QR Code</h3>
          </div>
          <button className="qr-close-btn" onClick={onClose} title="Close">
            <X size={18} />
          </button>
        </div>

        {/* Short URL label */}
        <div className="qr-url-label">
          <span className="url-link">/{urlEntry.shortUrl}</span>
        </div>

        {/* QR image area */}
        <div className="qr-image-area">
          {loading && (
            <div className="qr-loading">
              <div className="qr-spinner" />
              <span>Generating QR Code…</span>
            </div>
          )}
          {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}
          {qrData && (
            <div className="qr-img-wrapper">
              <img src={qrData.qrCode} alt="QR Code" className="qr-img" />
            </div>
          )}
        </div>

        {/* Original URL truncated */}
        {qrData && (
          <p className="qr-original-url" title={urlEntry.originalUrl}>
            {urlEntry.originalUrl.length > 55
              ? urlEntry.originalUrl.slice(0, 55) + '…'
              : urlEntry.originalUrl}
          </p>
        )}

        {/* Actions */}
        <div className="qr-modal-actions">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Close
          </button>
          {qrData && (
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDownload}>
              <Download size={16} /> Download PNG
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const getBackendBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

const getFullShortUrl = (shortUrl) => {
  return `${getBackendBaseUrl()}/s/${shortUrl}`;
};

/* ─── Dashboard ─────────────────────────────────────────────── */
export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'bulk'

  // Bulk States
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccessSummary, setBulkSuccessSummary] = useState(null);

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [qrEntry, setQrEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchUrls(); }, []);

  const fetchUrls = async () => {
    try {
      const response = await api.get('/urls/myurls');
      setUrls(response.data);
    } catch (error) {
      console.error('Failed to fetch URLs:', error);
      showToast('Failed to load links', 'error');
    } finally {
      setFetching(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleShorten = async (e) => {
    e.preventDefault();
    if (!originalUrl) return;
    setLoading(true);
    try {
      await api.post('/urls/shorten', {
        OriginalUrl: originalUrl,
        customAlias: customAlias.trim() || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
      });
      setOriginalUrl('');
      setCustomAlias('');
      setExpiryDate('');
      showToast('URL shortened successfully!');
      fetchUrls();
    } catch (error) {
      console.error('Shortening failed:', error);
      showToast(error.response?.data?.message || 'Failed to shorten URL', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await api.delete(`/urls/${id}`);
      showToast('Link deleted successfully');
      fetchUrls();
    } catch (error) {
      console.error('Deletion failed:', error);
      showToast('Failed to delete link', 'error');
    }
  };

  const copyToClipboard = (text) => {
    const fullUrl = getFullShortUrl(text);
    navigator.clipboard.writeText(fullUrl);
    showToast('Link copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCsvChange = (text) => {
    setCsvText(text);
    try {
      const parsed = parseCSV(text);
      setParsedRows(parsed);
      setBulkError(null);
    } catch (err) {
      setBulkError('Failed to parse CSV text');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      handleCsvChange(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (parsedRows.length === 0) {
      showToast('No valid URLs found in CSV', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/urls/bulk', { urls: parsedRows });
      const { results, errors } = res.data;

      if (results.length > 0) {
        showToast(`Successfully shortened ${results.length} URLs!`);
      }
      if (errors.length > 0) {
        showToast(`Failed to shorten ${errors.length} URLs`, 'error');
      }

      setBulkSuccessSummary({ results, errors });
      setCsvText('');
      setParsedRows([]);
      fetchUrls();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to process bulk URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="auth-container">
        <div className="animate-pulse" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
          Initializing Your Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {toast && <div className="toast-container"><Toast {...toast} onClose={() => setToast(null)} /></div>}
      {qrEntry && <QrModal urlEntry={qrEntry} onClose={() => setQrEntry(null)} />}
      {editEntry && <EditModal urlEntry={editEntry} onClose={() => setEditEntry(null)} onSaveSuccess={(msg) => { showToast(msg); fetchUrls(); }} />}

      <nav className="navbar glass animate-fade">
        <a href="/" className="logo">
          <div className="glass" style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary)' }}>
            <Link2 size={24} color="white" />
          </div>
          <span style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Shortify</span>
        </a>
        <div className="nav-actions">
          <div className="user-badge glass">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
            {user?.username}
          </div>
          <ThemeToggle style={{ whiteSpace: 'nowrap'}}/>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      <main className="main-content">
        <section className="hero animate-slide">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '9999px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
            <Zap size={14} fill="var(--primary)" /> Premium Link Shortening
          </div>
          <h1>Simplify Your Links,<br/>Amplify Your Reach</h1>
          <p>Shortify is the premium URL shortener for modern creators. Shorten, track, and manage your links with elegance.</p>
        </section>

        {/* ─── Mode Tabs ────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }} className="animate-slide">
          <button
            onClick={() => { setActiveTab('single'); setBulkSuccessSummary(null); }}
            className={`btn ${activeTab === 'single' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.55rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} /> Single Link
          </button>
          <button
            onClick={() => { setActiveTab('bulk'); setBulkSuccessSummary(null); }}
            className={`btn ${activeTab === 'bulk' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ width: 'auto', padding: '0.55rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Upload size={16} /> Bulk Upload (CSV)
          </button>
        </div>

        {/* ─── Single Link Section ─────────────────────────────── */}
        {activeTab === 'single' && (
          <section className="url-form-container animate-slide" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleShorten} className="url-form glass" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1.25rem', padding: '1.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }} className="responsive-form-row">
                <input
                  type="url"
                  className="input"
                  placeholder="Paste your long URL here..."
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  required
                  style={{ flex: 1, margin: 0 }}
                />
                <button type="submit" className="btn btn-primary" style={{ width: 'auto', padding: '0 2rem' }} disabled={loading}>
                  {loading ? 'Shortening...' : <><Plus size={20} /> Shorten</>}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <button
                  type="button"
                  className="btn-text"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.875rem', padding: 0, fontWeight: 500 }}
                >
                  {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options (Alias, Expiry)'}
                </button>
              </div>

              {showAdvanced && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }} className="responsive-advanced-options">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Custom Alias (Optional)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. summer-sale"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left' }}>Expiry Date (Optional)</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      style={{ margin: 0 }}
                    />
                  </div>
                </div>
              )}
            </form>
          </section>
        )}

        {/* ─── Bulk Upload Section ────────────────────────────── */}
        {activeTab === 'bulk' && (
          <section className="url-form-container animate-slide" style={{ animationDelay: '0.1s' }}>
            <div className="glass" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Paste CSV Content</label>
                  <textarea
                    className="input"
                    rows={4}
                    placeholder={`originalUrl,customAlias,expiryDate\nhttps://google.com,google-search,2026-12-31T23:59\nhttps://github.com,github-code,`}
                    value={csvText}
                    onChange={(e) => handleCsvChange(e.target.value)}
                    style={{ fontFamily: 'monospace', fontSize: '0.85rem', width: '100%', padding: '0.75rem', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR upload CSV file:</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}
                  />
                </div>

                {parsedRows.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Parsed Links Preview ({parsedRows.length}):</p>
                    <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {parsedRows.map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '0.25rem' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{r.originalUrl}</span>
                          <span style={{ color: 'var(--primary)' }}>{r.customAlias || '(no alias)'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {bulkError && <p style={{ color: 'var(--error)', fontSize: '0.85rem', margin: 0, textAlign: 'left' }}>{bulkError}</p>}

                <button type="submit" className="btn btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }} disabled={loading || parsedRows.length === 0}>
                  {loading ? 'Processing...' : `Bulk Shorten ${parsedRows.length} Links`}
                </button>
              </form>

              {bulkSuccessSummary && (
                <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px solid var(--glass-border)', borderRadius: '10px', textAlign: 'left', background: 'rgba(255, 255, 255, 0.01)' }}>
                  <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem' }}>Bulk Result Summary</h4>
                  <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--success)' }}>
                    ✓ {bulkSuccessSummary.results.length} URLs shortened successfully.
                  </p>
                  {bulkSuccessSummary.errors.length > 0 && (
                    <div>
                      <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: 'var(--error)' }}>
                        ✗ {bulkSuccessSummary.errors.length} rows encountered errors:
                      </p>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {bulkSuccessSummary.errors.map((e, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>
                            Row #{e.index + 1}: {e.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ─── Links List Table ───────────────────────────────── */}
        <section className="url-list-container animate-slide" style={{ animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <BarChart3 size={24} className="text-primary" /> Your Links
            </h2>
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{urls.length} Total Links</span>
          </div>

          <div className="table-wrapper glass">
            <table>
              <thead>
                <tr>
                  <th>Original URL</th>
                  <th>Short Link</th>
                  <th>Clicks</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {urls.length > 0 ? urls.map((url, index) => (
                  <tr key={url.id} className="animate-fade" style={{ animationDelay: `${0.3 + index * 0.05}s` }}>
                    <td data-label="Original URL">
                      <div className="original-url-text" title={url.originalUrl}>
                        {url.originalUrl}
                      </div>
                    </td>
                    <td data-label="Short Link">
                      <a href={getFullShortUrl(url.customAlias || url.shortUrl)} target="_blank" rel="noreferrer" className="url-link" style={{ fontWeight: 500 }}>
                        {url.customAlias || url.shortUrl}
                      </a>
                      {url.customAlias && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Alias: {url.customAlias}
                        </div>
                      )}
                      {url.expiryDate && (
                        <div style={{ fontSize: '0.7rem', color: new Date(url.expiryDate) < new Date() ? 'var(--error)' : 'var(--success)', marginTop: '0.15rem' }}>
                          Exp: {new Date(url.expiryDate).toLocaleDateString()} {new Date(url.expiryDate) < new Date() && '(Expired)'}
                        </div>
                      )}
                    </td>
                    <td data-label="Clicks">
                      <span className="badge">{url.clickCount} clicks</span>
                    </td>
                    <td data-label="Created">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                        <Clock size={14} /> {new Date(url.createdDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => copyToClipboard(url.customAlias || url.shortUrl)} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Copy to clipboard">
                          <Copy size={16} />
                        </button>
                        <a href={getFullShortUrl(url.customAlias || url.shortUrl)} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Open link">
                          <ExternalLink size={16} />
                        </a>
                        <button
                          onClick={() => navigate(`/analytics/${url.id}`)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--secondary)' }}
                          title="View Private Analytics"
                        >
                          <Activity size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/stats/${url.customAlias || url.shortUrl}`)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--success)' }}
                          title="View Public Stats"
                        >
                          <BarChart3 size={16} />
                        </button>
                        <button
                          onClick={() => setQrEntry(url)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}
                          title="View QR Code"
                        >
                          <QrCode size={16} />
                        </button>
                        <button
                          onClick={() => setEditEntry(url)}
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--primary)' }}
                          title="Edit Link Details"
                        >
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(url.id)} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px', color: 'var(--error)' }} title="Delete link">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Link2 size={48} style={{ opacity: 0.2 }} />
                        <p>No links shortened yet. Start by pasting a URL above!</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
