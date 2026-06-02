import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck, ArrowRight } from 'lucide-react';
import { Toast } from './Toast';
import { ThemeToggle } from './ThemeContext';

/* ─── Login Page ──────────────────────────────────────────────── */
export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const { login }    = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setToast({ message: 'Login failed! Please check your credentials.', type: 'error' });
    }
  };

  return (
    <div className="auth-container">
      {/* Theme toggle — top-right corner */}
      <ThemeToggle style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.6rem 1rem' }} />

      {toast && <div className="toast-container"><Toast {...toast} onClose={() => setToast(null)} /></div>}

      <div className="auth-card glass animate-scale">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--primary)' }}>
            <ShieldCheck size={32} color="white" />
          </div>
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Securely manage your shortened links</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="Your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Authenticating...' : <><LogIn size={20} /> Login</>}
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Create one <ArrowRight size={14} style={{ verticalAlign: 'middle' }} />
          </Link>
        </p>
      </div>
    </div>
  );
};

/* ─── Register Page ───────────────────────────────────────────── */
export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [toast, setToast]       = useState(null);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await register(username, email, password);
    setLoading(false);
    if (success) {
      setToast({ message: 'Registration successful! Redirecting to login...', type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setToast({ message: 'Registration failed! Try a different username.', type: 'error' });
    }
  };

  return (
    <div className="auth-container">
      {/* Theme toggle — top-right corner */}
      <ThemeToggle style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: '0.6rem 1rem' }} />

      {toast && <div className="toast-container"><Toast {...toast} onClose={() => setToast(null)} /></div>}

      <div className="auth-card glass animate-scale">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div className="glass" style={{ padding: '0.75rem', borderRadius: '12px', background: 'var(--secondary)' }}>
            <UserPlus size={32} color="white" />
          </div>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join Shortify to start simplifying links</p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="label">Username</label>
            <input
              type="text"
              className="input"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : <><UserPlus size={20} /> Register</>}
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: '1.5rem', marginBottom: 0 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
