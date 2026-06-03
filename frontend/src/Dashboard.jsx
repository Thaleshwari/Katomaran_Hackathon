import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Link2, Copy, BarChart3, Clock, ExternalLink, LogOut, Trash2, Plus, Zap, QrCode, X, Download, Activity, Edit, Upload, Calendar, Search, Filter, ArrowUpDown, TrendingUp, ShieldCheck } from 'lucide-react';
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

const getShortBaseUrl = () => {
  return import.meta.env.VITE_SHORT_BASE_URL || getBackendBaseUrl();
};

const getFullShortUrl = (shortUrl) => {
  return `${getShortBaseUrl()}/s/${shortUrl}`;
};

const getDomain = (urlStr) => {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, '');
  } catch (e) {
    return urlStr;
  }
};

const getIconBorderColor = (domain) => {
  const hash = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'rgba(16, 185, 129, 0.4)',
    'rgba(249, 115, 22, 0.4)',
    'rgba(14, 165, 233, 0.4)',
    'rgba(212, 175, 55, 0.4)'
  ];
  return colors[hash % colors.length];
};

const getRemainingDays = (expiryDate) => {
  if (!expiryDate) return 'No expiry';
  const diffTime = new Date(expiryDate) - new Date();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Expired';
  return `${diffDays} days`;
};

const Sparkline = ({ urlId, clickCount }) => {
  const hash = urlId ? urlId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
  const points = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const x = (i * 120) / (count - 1);
    const factor = (hash + i * 17) % 20;
    const y = 10 + factor + (i === count - 1 ? -6 : 0);
    points.push(`${x},${y}`);
  }
  const pathD = `M ${points.join(' L ')}`;
  const strokeColor = hash % 2 === 0 ? '#D4AF37' : '#10B981';
  return (
    <div style={{ width: '120px', height: '40px', display: 'flex', alignItems: 'center' }}>
      <svg width="120" height="40" viewBox="0 0 120 40">
        <defs>
          <linearGradient id={`grad-${urlId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={`${pathD} L 120,40 L 0,40 Z`}
          fill={`url(#grad-${urlId})`}
        />
      </svg>
    </div>
  );
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
  const [csvFileName, setCsvFileName] = useState('');

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const [qrEntry, setQrEntry] = useState(null);
  const [editEntry, setEditEntry] = useState(null);
  
  // Search, Filter & Sort States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
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
    if (!text) setCsvFileName('');
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
    setCsvFileName(file.name);
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
      setCsvFileName('');
      setParsedRows([]);
      fetchUrls();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to process bulk URLs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculations for overview statistics
  const totalLinks = urls.length;
  const totalClicks = urls.reduce((sum, u) => sum + (u.clickCount || 0), 0);
  const activeLinks = urls.filter(u => {
    return !u.expiryDate || new Date(u.expiryDate) >= new Date();
  }).length;
  const activePercentage = totalLinks > 0 ? ((activeLinks / totalLinks) * 100).toFixed(1) : '0.0';
  
  const expiringSoonCount = urls.filter(u => {
    if (!u.expiryDate) return false;
    const diff = new Date(u.expiryDate) - new Date();
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  }).length;

  // Search, filter and sort URLs
  const filteredAndSortedUrls = urls
    .filter((url) => {
      // 1. Search term filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        url.originalUrl.toLowerCase().includes(searchLower) ||
        (url.customAlias && url.customAlias.toLowerCase().includes(searchLower)) ||
        url.shortUrl.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;

      // 2. Status filter
      const isExpired = url.expiryDate && new Date(url.expiryDate) < new Date();
      if (filterOption === 'active') {
        return !isExpired;
      } else if (filterOption === 'expired') {
        return isExpired;
      } else if (filterOption === 'expiring') {
        if (!url.expiryDate) return false;
        const diff = new Date(url.expiryDate) - new Date();
        const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return diffDays > 0 && diffDays <= 30;
      }
      return true;
    })
    .sort((a, b) => {
      // 3. Sorting
      if (sortOption === 'newest') {
        return new Date(b.createdDate) - new Date(a.createdDate);
      } else if (sortOption === 'oldest') {
        return new Date(a.createdDate) - new Date(b.createdDate);
      } else if (sortOption === 'clicks-desc') {
        return b.clickCount - a.clickCount;
      } else if (sortOption === 'clicks-asc') {
        return a.clickCount - b.clickCount;
      }
      return 0;
    });

  const handleCreateLinkClick = () => {
    setActiveTab('single');
    const element = document.querySelector('.url-form-container');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        const input = document.getElementById('long-url-input');
        if (input) input.focus();
      }, 500);
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
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} title="Logout">
            <LogOut size={16} /> <span className="logout-btn-text">Logout</span>
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
                  id="long-url-input"
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>OR upload CSV file:</span>
                  <label className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.65rem 1.25rem', fontSize: '0.85rem' }}>
                    <Upload size={16} /> Choose CSV File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {csvFileName && (
                    <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
                      Selected: {csvFileName}
                    </span>
                  )}
                </div>

                {parsedRows.length > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '1rem', textAlign: 'left' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, margin: '0 0 0.5rem 0' }}>Parsed Links Preview ({parsedRows.length}):</p>
                    <div style={{ maxHeight: 150, overflowY: 'auto', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {parsedRows.map((r, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--glass-border)', paddingBottom: '0.25rem' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}>{r.originalUrl}</span>
                          <span style={{ color: 'var(--primary)' }}>{r.customAlias || '(will generate short URL)'}</span>
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

                  {bulkSuccessSummary.results.length > 0 && (
                    <div style={{ margin: '0.75rem 0', background: 'rgba(0,0,0,0.15)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--text-muted)' }}>Generated Short URLs:</p>
                      <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {bulkSuccessSummary.results.map((r, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.03)', paddingBottom: '0.2rem', fontSize: '0.75rem', gap: '1rem' }}>
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%', color: 'var(--text-muted)' }}>{r.originalUrl}</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 500 }}>/{r.customAlias || r.shortUrl}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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

        {/* ─── Links List Section ─────────────────────────────── */}
        <section className="url-list-container animate-slide" style={{ animationDelay: '0.2s' }}>
          
          {/* Header Row: Title on Left, Controls on Right */}
          <div className="dashboard-header-row">
            <div className="dashboard-title-section">
              <h2 className="dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                Your Links <span style={{ color: '#D4AF37' }}>✨</span>
              </h2>
              <p className="dashboard-subtitle">Manage • Analyze • Share</p>
            </div>

            <div className="search-filter-actions-group">
              <div className="search-input-wrapper">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input search-input"
                />
              </div>

              {/* Filter Dropdown */}
              <div className="dropdown-container">
                <button
                  onClick={() => {
                    setShowFilterDropdown(!showFilterDropdown);
                    setShowSortDropdown(false);
                  }}
                  className={`btn btn-filter ${filterOption !== 'all' ? 'active-filter' : ''}`}
                  title="Filter links"
                >
                  <Filter size={16} /> <span style={{ marginLeft: '0.25rem' }}>Filter</span>
                </button>
                {showFilterDropdown && (
                  <div className="dropdown-menu">
                    <button
                      onClick={() => {
                        setFilterOption('all');
                        setShowFilterDropdown(false);
                      }}
                      className={filterOption === 'all' ? 'active' : ''}
                    >
                      All Links
                    </button>
                    <button
                      onClick={() => {
                        setFilterOption('active');
                        setShowFilterDropdown(false);
                      }}
                      className={filterOption === 'active' ? 'active' : ''}
                    >
                      Active Only
                    </button>
                    <button
                      onClick={() => {
                        setFilterOption('expired');
                        setShowFilterDropdown(false);
                      }}
                      className={filterOption === 'expired' ? 'active' : ''}
                    >
                      Expired Only
                    </button>
                    <button
                      onClick={() => {
                        setFilterOption('expiring');
                        setShowFilterDropdown(false);
                      }}
                      className={filterOption === 'expiring' ? 'active' : ''}
                    >
                      Expiring Soon
                    </button>
                  </div>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="dropdown-container">
                <button
                  onClick={() => {
                    setShowSortDropdown(!showSortDropdown);
                    setShowFilterDropdown(false);
                  }}
                  className="btn btn-sort"
                  title="Sort links"
                >
                  <ArrowUpDown size={16} /> <span style={{ marginLeft: '0.25rem' }}>Sort</span>
                </button>
                {showSortDropdown && (
                  <div className="dropdown-menu">
                    <button
                      onClick={() => {
                        setSortOption('newest');
                        setShowSortDropdown(false);
                      }}
                      className={sortOption === 'newest' ? 'active' : ''}
                    >
                      Newest Created
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('oldest');
                        setShowSortDropdown(false);
                      }}
                      className={sortOption === 'oldest' ? 'active' : ''}
                    >
                      Oldest Created
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('clicks-desc');
                        setShowSortDropdown(false);
                      }}
                      className={sortOption === 'clicks-desc' ? 'active' : ''}
                    >
                      Most Clicked
                    </button>
                    <button
                      onClick={() => {
                        setSortOption('clicks-asc');
                        setShowSortDropdown(false);
                      }}
                      className={sortOption === 'clicks-asc' ? 'active' : ''}
                    >
                      Least Clicked
                    </button>
                  </div>
                )}
              </div>

              <button onClick={handleCreateLinkClick} className="btn btn-create-link" title="Create a new link">
                <Plus size={16} /> <span style={{ marginLeft: '0.25rem' }}>Create Link</span>
              </button>
            </div>
          </div>

          {/* Overview Cards Row */}
          <div className="dashboard-overview-grid">
            {/* Card 1: Total Links */}
            <div className="overview-card">
              <div className="overview-card-left">
                <div className="overview-icon-box gold">
                  <Link2 size={20} />
                </div>
                <div className="overview-info">
                  <span className="overview-label">Total Links</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{totalLinks}</span>
                  </div>
                  <span className="overview-subtext">All time</span>
                </div>
              </div>
              <div className="overview-card-right">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M 0,18 C 12,18 12,4 24,4 C 36,4 36,15 48,15 L 60,4" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
            </div>

            {/* Card 2: Total Clicks */}
            <div className="overview-card">
              <div className="overview-card-left">
                <div className="overview-icon-box gold">
                  <TrendingUp size={20} />
                </div>
                <div className="overview-info">
                  <span className="overview-label">Total Clicks</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{totalClicks.toLocaleString()}</span>
                    {totalClicks > 0 && (
                      <span className="overview-trend up" style={{ marginLeft: '0.25rem' }}>
                        ↑ 18.7%
                      </span>
                    )}
                  </div>
                  <span className="overview-subtext">vs last 7 days</span>
                </div>
              </div>
              <div className="overview-card-right">
                <svg width="60" height="24" viewBox="0 0 60 24">
                  <path d="M 0,20 Q 15,15 30,8 T 60,3" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="15" cy="18" r="1.5" fill="#D4AF37" />
                  <circle cx="30" cy="8" r="1.5" fill="#D4AF37" />
                  <circle cx="45" cy="6" r="1.5" fill="#D4AF37" />
                  <circle cx="60" cy="3" r="1.5" fill="#D4AF37" />
                </svg>
              </div>
            </div>

            {/* Card 3: Active Links */}
            <div className="overview-card">
              <div className="overview-card-left" style={{ width: '100%' }}>
                <div className="overview-icon-box green">
                  <ShieldCheck size={20} />
                </div>
                <div className="overview-info" style={{ flex: 1 }}>
                  <span className="overview-label">Active Links</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{activeLinks}</span>
                  </div>
                  <span className="overview-subtext">{activePercentage}% of total</span>
                  <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)', marginTop: '0.4rem', overflow: 'hidden' }}>
                    <div style={{ width: `${activePercentage}%`, height: '100%', background: '#10B981', borderRadius: '2px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Expiring Soon */}
            <div className="overview-card">
              <div className="overview-card-left">
                <div className="overview-icon-box orange">
                  <Clock size={20} />
                </div>
                <div className="overview-info">
                  <span className="overview-label">Expiring Soon</span>
                  <div className="overview-value-row">
                    <span className="overview-value">{expiringSoonCount}</span>
                  </div>
                  <span className="overview-subtext" style={{ color: expiringSoonCount > 0 ? '#F97316' : undefined }}>Within 30 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Links list area */}
          <div className="table-wrapper" style={{ background: 'transparent', border: 'none', boxShadow: 'none' }}>
            {filteredAndSortedUrls.length > 0 ? (
              <>
                <div className="link-cards-header">
                  <div className="header-col-left">Original URL / Short Link</div>
                  <div className="header-col-clicks">Clicks</div>
                  <div className="header-col-dates">Status & Timeline</div>
                  <div className="header-col-actions">Actions</div>
                </div>
                <div className="link-cards-list">
                  {filteredAndSortedUrls.map((url, index) => {
                    const domain = getDomain(url.originalUrl);
                    const remainingDays = getRemainingDays(url.expiryDate);
                    const isExpired = url.expiryDate && new Date(url.expiryDate) < new Date();
                    return (
                      <div key={url.id} className="link-card-row glass animate-fade" style={{ animationDelay: `${0.1 + index * 0.03}s` }}>
                        {/* Left Section: Favicon & Domain Details */}
                        <div className="card-left-section">
                          <div className="domain-icon-wrapper" style={{ borderColor: getIconBorderColor(domain) }}>
                            <img 
                              src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`} 
                              alt={domain}
                              className="domain-icon"
                              onError={(e) => { e.target.src = 'https://www.google.com/s2/favicons?sz=64&domain=google.com'; }}
                            />
                          </div>
                          <div className="domain-info">
                            <div className="domain-title-row">
                              <span className="domain-name">{domain}</span>
                              <a href={getFullShortUrl(url.customAlias || url.shortUrl)} target="_blank" rel="noreferrer" className="external-link-arrow" title="Open original link">
                                <ExternalLink size={14} />
                              </a>
                            </div>
                            <div className="original-url-text" title={url.originalUrl}>
                              {url.originalUrl}
                            </div>
                            {url.customAlias ? (
                              <div className="alias-badge-wrapper" onClick={() => copyToClipboard(url.customAlias)} title="Copy Alias">
                                <span className="alias-badge">{url.customAlias}</span>
                                <Copy size={10} className="alias-copy-icon" />
                              </div>
                            ) : (
                              <div className="alias-badge-wrapper" onClick={() => copyToClipboard(url.shortUrl)} title="Copy Short URL">
                                <span className="alias-badge">{url.shortUrl}</span>
                                <Copy size={10} className="alias-copy-icon" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Clicks Counter */}
                        <div className="card-clicks-section">
                          <div className="clicks-pill">
                            <div className="clicks-icon-box">
                              <BarChart3 size={18} className="clicks-icon" />
                            </div>
                            <div className="clicks-data">
                              <span className="clicks-count">{url.clickCount}</span>
                              <span className="clicks-label">Clicks</span>
                            </div>
                          </div>
                        </div>

                        {/* Date Meta Info */}
                        <div className="card-meta-section">
                          <div className="meta-item">
                            <Calendar size={14} className="meta-icon" />
                            <div className="meta-texts">
                              <span className="meta-label">Created</span>
                              <span className="meta-value">{new Date(url.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          </div>
                          <div className="meta-item">
                            <Clock size={14} className="meta-icon" />
                            <div className="meta-texts">
                              <span className="meta-label">Expires in</span>
                              <span className="meta-value" style={{ color: isExpired ? 'var(--error)' : 'var(--success)' }}>
                                {remainingDays}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Large & Small Action Row */}
                        <div className="card-actions-section">
                          <div className="action-row-primary">
                            <button onClick={() => copyToClipboard(url.customAlias || url.shortUrl)} className="btn btn-primary action-btn-copy" title="Copy to clipboard">
                              <Copy size={14} /> Copy
                            </button>
                            <a href={getFullShortUrl(url.customAlias || url.shortUrl)} target="_blank" rel="noreferrer" className="btn btn-secondary action-btn-open" title="Open link">
                              <ExternalLink size={14} /> Open
                            </a>
                          </div>
                          <div className="action-row-secondary">
                            <button
                              onClick={() => navigate(`/analytics/${url.id}`)}
                              className="btn btn-secondary action-icon-btn"
                              title="View Private Analytics"
                              style={{ color: 'var(--secondary)' }}
                            >
                              <Activity size={14} />
                            </button>
                            <button
                              onClick={() => navigate(`/stats/${url.customAlias || url.shortUrl}`)}
                              className="btn btn-secondary action-icon-btn"
                              title="View Public Stats"
                              style={{ color: 'var(--success)' }}
                            >
                              <BarChart3 size={14} />
                            </button>
                            <button
                              onClick={() => setQrEntry(url)}
                              className="btn btn-secondary action-icon-btn"
                              title="View QR Code"
                              style={{ color: 'var(--primary)' }}
                            >
                              <QrCode size={14} />
                            </button>
                            <button
                              onClick={() => setEditEntry(url)}
                              className="btn btn-secondary action-icon-btn"
                              title="Edit Link Details"
                              style={{ color: 'var(--primary)' }}
                            >
                              <Edit size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(url.id)} 
                              className="btn btn-secondary action-icon-btn action-delete" 
                              title="Delete link"
                              style={{ color: 'var(--error)' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="glass" style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <Link2 size={48} style={{ opacity: 0.2 }} />
                  <p>No links match your search or filter criteria. Create one or try a different filter!</p>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
