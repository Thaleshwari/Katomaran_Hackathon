import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { LoginPage, RegisterPage } from './AuthPages';
import { Dashboard } from './Dashboard';
import { UrlAnalytics } from './UrlAnalytics';
import { PublicStats } from './PublicStats';
import { ChatWidget } from './ChatWidget';
import './index.css';

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
  if (!user) return <Navigate to="/login" />;
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
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/stats/:shortUrl" element={<PublicStats />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics/:id"
              element={
                <ProtectedRoute>
                  <UrlAnalytics />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
