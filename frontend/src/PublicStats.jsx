import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, BarChart3, ShieldCheck, Link2, Share2, Check, LogIn, LayoutDashboard } from 'lucide-react';
import api from './api';
import { ThemeToggle } from './ThemeContext';
import { useAuth } from './AuthContext';

export const PublicStats = () => {
  const { shortUrl } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy public stats URL:', err);
    }
  };

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/urls/public/${shortUrl}/stats`);
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load public statistics. Make sure the link is correct.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicStats();
  }, [shortUrl]);

  if (loading) {
    return (
      <div className="auth-container">
        <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Fetching Public Statistics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="auth-container">
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
          <p style={{ color: 'var(--error)', margin: 0 }}>{error}</p>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/login')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const { url, timeline } = data;

  const fmtFull = (iso) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  // Calculate chart bars
  const maxClicks = Math.max(...timeline.map((d) => d.clicks), 1);

  return (
    <div className="dashboard-container" style={{ minHeight: '100vh' }}>
      <nav className="navbar glass animate-fade">
        <a href="/" className="logo">
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary)', display: 'flex' }}>
            <Link2 size={24} color="white" />
          </div>
          <span className="logo-text">Shortify</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          {user ? (
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/')} title="Go to Dashboard">
              <LayoutDashboard size={16} /> <span className="login-btn-text">Dashboard</span>
            </button>
          ) : (
            <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/login')} title="Login / Signup">
              <LogIn size={16} /> <span className="login-btn-text">Login / Signup</span>
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <section className="analytics-page-header animate-slide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
          <div>
            <div className="analytics-badge">
              <ShieldCheck size={14} /> Public Stats Page
            </div>
            <h1 className="analytics-page-title">Link Performance</h1>
            <p className="analytics-page-subtitle">
              Public performance report for this shortened link.
            </p>
            <div className="analytics-created-info">
              <Calendar size={13} />
              <span>Created {fmtFull(url.createdDate)}</span>
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ 
              width: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.6rem 1.2rem',
              fontSize: '0.9rem',
              background: copied ? 'linear-gradient(180deg, #10B981 0%, #059669 100%)' : undefined,
              borderColor: copied ? '#10B981' : undefined,
              color: copied ? '#FFFFFF' : undefined
            }}
            onClick={handleShare}
            title="Copy Public Stats URL to share"
          >
            {copied ? (
              <>
                <Check size={16} /> Link Copied!
              </>
            ) : (
              <>
                <Share2 size={16} /> Share Report
              </>
            )}
          </button>

          <div className="glass analytics-url-card-v2">
            <p className="analytics-url-card-label">Original Destination</p>
            <p className="analytics-url-original" title={url.originalUrl}>{url.originalUrl}</p>

            <div className="analytics-url-divider" />

            <p className="analytics-url-card-label">Short Code / Custom Alias</p>
            <span className="url-link analytics-short-link" style={{ fontSize: '1.1rem' }}>
              {url.customAlias || url.shortUrl}
            </span>

            <div className="analytics-url-divider" />

            <p className="analytics-url-card-label">Total Clicks</p>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
              {url.clickCount.toLocaleString()} clicks
            </span>
          </div>
        </section>

        {/* ── Trend Chart ── */}
        <section className="glass animate-slide" style={{ padding: '2rem', borderRadius: '16px', marginBottom: '2rem', animationDelay: '0.2s' }}>
          <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} className="text-primary" /> Daily Click Trend (Last 30 Days)
          </h2>

          <div className="analytics-chart-wrap">
            <div className="analytics-chart">
              {timeline.map((day) => {
                const pct = (day.clicks / maxClicks) * 100;
                return (
                  <div key={day.date} className="analytics-bar-col">
                    <div className="analytics-bar-tooltip">
                      <strong>{day.clicks} Clicks</strong>
                      <br />
                      <span style={{ fontSize: '0.65rem' }}>{day.date}</span>
                    </div>
                    <div className="analytics-bar-track">
                      <div className="analytics-bar-fill" style={{ height: `${pct}%` }} />
                    </div>
                    <span className="analytics-bar-label">{day.date.slice(8, 10)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
