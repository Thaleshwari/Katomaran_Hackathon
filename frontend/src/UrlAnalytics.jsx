import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from './api';
import {
  ArrowLeft, Link2, BarChart3, Clock, MousePointerClick,
  Calendar, TrendingUp, ExternalLink, Copy, Zap
} from 'lucide-react';
import { Toast } from './Toast';
import { useTheme, ThemeToggle } from './ThemeContext';

/* ─── Helpers ─────────────────────────────────────────────────── */
const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const fmtFull = (iso) =>
  new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

/* ─── Bar Chart (pure CSS) ────────────────────────────────────── */
const BarChart = ({ timeline }) => {
  if (!timeline || timeline.length === 0) return null;
  const max = Math.max(...timeline.map(d => d.clicks), 1);
  const showLabel = (i) => i % 5 === 0 || i === timeline.length - 1;

  return (
    <div className="analytics-chart-wrap">
      <div className="analytics-chart">
        {timeline.map((day, i) => {
          const pct = (day.clicks / max) * 100;
          return (
            <div key={day.date} className="analytics-bar-col">
              <div className="analytics-bar-tooltip">
                <strong>{day.clicks}</strong> click{day.clicks !== 1 ? 's' : ''}<br />
                {fmtDate(day.date)}
              </div>
              <div className="analytics-bar-track">
                <div
                  className="analytics-bar-fill"
                  style={{ height: `${Math.max(pct, day.clicks > 0 ? 4 : 0)}%` }}
                />
              </div>
              <span className="analytics-bar-label">
                {showLabel(i) ? fmtDate(day.date) : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Stat Card ───────────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="analytics-stat-card glass">
    <div className="analytics-stat-icon" style={{ background: accent }}>
      <Icon size={20} color="#fff" />
    </div>
    <div>
      <p className="analytics-stat-value">{value}</p>
      <p className="analytics-stat-label">{label}</p>
    </div>
  </div>
);

/* ─── Analytics Page ──────────────────────────────────────────── */
export const UrlAnalytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [toast, setToast]   = useState(null);

  const { theme } = useTheme();

  // ── Fetch analytics ──
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/urls/${id}/analytics`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  const copyShortUrl = () => {
    navigator.clipboard.writeText(`http://localhost:8080/s/${data.url.shortUrl}`);
    setToast({ message: 'Short URL copied!', type: 'success' });
  };

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="auth-container">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="qr-spinner" style={{ width: 48, height: 48 }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading analytics…</p>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="auth-container">
        <div className="glass" style={{ padding: '2rem', textAlign: 'center', maxWidth: 400 }}>
          <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" style={{ width: 'auto' }} onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { url, stats, timeline } = data;
  const peakDay  = timeline.reduce((best, d) => d.clicks > best.clicks ? d : best, { clicks: 0, date: null });
  const avgClicks = (stats.allTime / 30).toFixed(1);

  return (
    <div className="dashboard-container">
      {toast && <div className="toast-container"><Toast {...toast} onClose={() => setToast(null)} /></div>}

      {/* ── Navbar ── */}
      <nav className="navbar glass animate-fade">
        {/* Left: Logo */}
        <a href="/" className="logo" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'var(--primary)', display: 'flex' }}>
            <Link2 size={24} color="white" />
          </div>
          <span className="logo-text">Shortify</span>
        </a>

        {/* Right: Theme toggle + Back */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ThemeToggle />
          <button
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} /> Dashboard
          </button>
        </div>
      </nav>

      <main className="main-content" style={{ maxWidth: 960 }}>

        {/* ── Page Header — two-column layout ── */}
        <section className="analytics-page-header animate-slide">

          {/* Left: title + badge */}
          <div className="analytics-header-left">
            <div className="analytics-badge">
              <BarChart3 size={13} /> Analytics Report
            </div>
            <h1 className="analytics-page-title">Link Performance</h1>
            <p className="analytics-page-subtitle">
              Tracking the last 30 days of activity for your shortened link.
            </p>
            <div className="analytics-created-info">
              <Calendar size={13} />
              <span>Created {fmtFull(url.createdDate)}</span>
            </div>
          </div>

          {/* Right: URL info card */}
          <div className="glass analytics-url-card-v2">
            <p className="analytics-url-card-label">Original URL</p>
            <p className="analytics-url-original" title={url.originalUrl}>{url.originalUrl}</p>

            <div className="analytics-url-divider" />

            <p className="analytics-url-card-label">Short Link</p>
            <span className="url-link analytics-short-link">localhost:8080/s/{url.shortUrl}</span>

            <div className="analytics-url-actions">
              <button
                onClick={copyShortUrl}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              >
                <Copy size={14} /> Copy Link
              </button>
              <a
                href={`http://localhost:8080/s/${url.shortUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
              >
                <ExternalLink size={14} /> Open Link
              </a>
            </div>
          </div>
        </section>

        {/* ── Stat Cards ── */}
        <section className="analytics-stats-grid animate-slide" style={{ animationDelay: '0.1s' }}>
          <StatCard icon={MousePointerClick} label="Total Clicks"    value={stats.allTime.toLocaleString()}        accent="linear-gradient(135deg,#8b5cf6,#6d28d9)" />
          <StatCard icon={Zap}               label="Clicks Today"    value={stats.today.toLocaleString()}           accent="linear-gradient(135deg,#f472b6,#ec4899)" />
          <StatCard icon={TrendingUp}        label="Last 7 Days"     value={stats.lastSevenDays.toLocaleString()}   accent="linear-gradient(135deg,#3b82f6,#2563eb)" />
          <StatCard icon={Clock}             label="Avg / Day (30d)" value={avgClicks}                              accent="linear-gradient(135deg,#10b981,#059669)" />
        </section>

        {/* ── Bar Chart ── */}
        <section className="glass animate-slide" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '2rem', animationDelay: '0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart3 size={20} style={{ color: 'var(--primary)' }} /> Clicks — Last 30 Days
            </h2>
            {peakDay.date && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Peak: <strong style={{ color: 'var(--primary)' }}>{peakDay.clicks} clicks</strong> on {fmtDate(peakDay.date)}
              </span>
            )}
          </div>
          {stats.allTime === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
              <MousePointerClick size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
              <p>No clicks yet. Share your link to start tracking!</p>
            </div>
          ) : (
            <BarChart timeline={timeline} />
          )}
        </section>

        {/* ── Daily Breakdown Table ── */}
        <section className="glass animate-slide" style={{ padding: '1.75rem', borderRadius: '16px', marginBottom: '3rem', animationDelay: '0.3s' }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} /> Daily Breakdown
          </h2>
          <div className="table-wrapper" style={{ maxHeight: 320, overflowY: 'auto', borderRadius: '10px' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clicks</th>
                  <th>Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {[...timeline].reverse().map((day) => {
                  const pct = stats.allTime > 0 ? ((day.clicks / stats.allTime) * 100).toFixed(1) : 0;
                  return (
                    <tr key={day.date}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{fmtFull(day.date)}</td>
                      <td>
                        <span className="badge" style={{
                          background: day.clicks > 0 ? 'rgba(139,92,246,0.15)' : 'rgba(100,116,139,0.1)',
                          color: day.clicks > 0 ? 'var(--primary)' : 'var(--text-muted)'
                        }}>
                          {day.clicks}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--glass-border)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,var(--primary),var(--secondary))', borderRadius: 99, transition: 'width 0.6s ease' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: 36 }}>{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};
