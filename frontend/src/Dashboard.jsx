import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { Link2, Copy, BarChart3, Clock, ExternalLink, LogOut, Trash2, Plus, Zap } from 'lucide-react';
import { Toast } from './Toast';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUrls();
  }, []);

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
      await api.post('/urls/shorten', { OriginalUrl: originalUrl });
      setOriginalUrl('');
      showToast('URL shortened successfully!');
      fetchUrls();
    } catch (error) {
      console.error('Shortening failed:', error);
      showToast('Failed to shorten URL', 'error');
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
    const fullUrl = window.location.origin.includes('localhost') 
      ? `http://localhost:8080/s/${text}` 
      : `${window.location.origin}/s/${text}`;
    
    navigator.clipboard.writeText(fullUrl);
    showToast('Link copied to clipboard!');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
      
      <nav className="navbar glass animate-fade">
        <a href="/" className="logo">
          <div className="glass" style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary)' }}>
            <Link2 size={24} color="white" />
          </div>
          <span style={{ background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Linkyfy</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="glass" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)' }}></div>
            {user?.username}
          </div>
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
          <p>Linkyfy is the premium URL shortener for modern creators. Shorten, track, and manage your links with elegance.</p>
        </section>

        <section className="url-form-container animate-slide" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleShorten} className="url-form glass">
            <input 
              type="url" 
              className="input" 
              placeholder="Paste your long URL here..." 
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ width: 'auto' }} disabled={loading}>
              {loading ? 'Shortening...' : <><Plus size={20} /> Shorten Now</>}
            </button>
          </form>
        </section>

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
                    <td>
                      <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', title: url.originalUrl }}>
                        {url.originalUrl}
                      </div>
                    </td>
                    <td>
                      <span className="url-link" style={{ fontWeight: 500 }}>{url.shortUrl}</span>
                    </td>
                    <td>
                      <span className="badge">{url.clickCount} clicks</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#94a3b8' }}>
                        <Clock size={14} /> {new Date(url.createdDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => copyToClipboard(url.shortUrl)} className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Copy to clipboard">
                          <Copy size={16} />
                        </button>
                        <a href={`http://localhost:8080/s/${url.shortUrl}`} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.5rem', borderRadius: '8px' }} title="Open link">
                          <ExternalLink size={16} />
                        </a>
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
