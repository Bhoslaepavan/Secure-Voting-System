import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Vote, Award, Lock, LogOut, UserCheck, LayoutDashboard, KeyRound } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/60 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/login"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Veri<span className="text-cyan-400">Vote</span>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                  SHA-256 Chain
                </span>
              </span>
              <p className="text-[11px] text-slate-400 font-mono">Tamper-Evident Ledger</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/dashboard') ? 'bg-navy-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-navy-800/60 hover:text-white'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Elections
                </Link>

                <Link
                  to="/receipt-verify"
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    isActive('/receipt-verify') ? 'bg-navy-800 text-cyan-400 border border-cyan-500/30' : 'text-slate-300 hover:bg-navy-800/60 hover:text-white'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  Verify Receipt
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      isActive('/admin') ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-300'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Admin Panel & Audit
                  </Link>
                )}
              </>
            )}
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                    {user?.name}
                    {isAdmin && (
                      <span className="text-[10px] uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                        Admin
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{user?.voterId}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  Register Voter
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}
