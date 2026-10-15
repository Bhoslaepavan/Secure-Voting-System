import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VotePage from './pages/VotePage';
import ReceiptPage from './pages/ReceiptPage';
import Results from './pages/Results';
import AdminPanel from './pages/AdminPanel';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-navy-950 flex items-center justify-center text-cyan-400 font-mono text-sm">Authenticating Session...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// Admin Only Route Wrapper
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-navy-950 flex items-center justify-center text-cyan-400 font-mono text-sm">Validating Admin Token...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-navy-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/vote/:id"
                element={
                  <ProtectedRoute>
                    <VotePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/receipt-verify"
                element={<ReceiptPage />}
              />

              <Route
                path="/results/:id"
                element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                }
              />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>

          {/* Global Footer */}
          <footer className="border-t border-navy-800 bg-navy-900/60 py-6 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="font-mono text-cyan-400/80">
                🛡️ VeriVote — SHA-256 Tamper-Evident Voting System Spec v1.0
              </span>
              <span className="text-slate-400">
                Decoupled Identity • 2FA OTP • Immutable Ledger Audit
              </span>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}
