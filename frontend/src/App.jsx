import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LoginPage, RegisterPage } from './AuthPages';
import { Dashboard } from './Dashboard';
import { UrlAnalytics } from './UrlAnalytics';
import { PublicStats } from './PublicStats';
import { ChatWidget } from './ChatWidget';
import { LandingPage } from './LandingPage';
import './index.css';

/* ── Redirect logged-in users straight to dashboard ── */
const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

/* ── Block unauthenticated users from dashboard ── */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="auth-container">
        <div className="animate-pulse" style={{ color: 'var(--primary)', fontWeight: 600 }}>
          Verifying Identity...
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={
              <PublicOnlyRoute><LandingPage /></PublicOnlyRoute>
            } />

            {/* Auth pages — redirect to dashboard if already logged in */}
            <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
            <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />

            {/* Public stats — no auth required */}
            <Route path="/stats/:shortUrl" element={<PublicStats />} />

            {/* Protected pages */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/analytics/:id" element={
              <ProtectedRoute><UrlAnalytics /></ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
