import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import OtpModal from '../components/OtpModal';
import { Lock, Mail, ShieldCheck, KeyRound, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 2FA state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const { setAuthData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Validate Email + Password -> Generates 2FA OTP
      const res = await API.post('/auth/login/step1', { email, password });
      
      if (res.data.requires2FA || res.data.requiresVerification) {
        setDevOtp(res.data.devOtp || '');
        setShowOtpModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (otpCode) => {
    const res = await API.post('/auth/login/step2', {
      email,
      otp: otpCode
    });

    setShowOtpModal(false);
    setAuthData(res.data.token, res.data.voter);

    if (res.data.voter.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative glow-cyan">
        
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 border border-cyan-500/30 text-navy-950 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-cyan-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Voter Sign In</h2>
          <p className="text-sm text-slate-400 mt-1">2-Factor Authenticated Access Portal</p>
        </div>

        {location.state?.message && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {location.state.message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Registered Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voter@example.com"
                className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Account Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : (
                <>
                  Authenticate & Request 2FA OTP <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Quick Logins */}
        <div className="mt-8 pt-6 border-t border-navy-800">
          <p className="text-xs uppercase font-bold text-slate-400 text-center mb-3">⚡ Quick Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => { setEmail('alice@example.com'); setPassword('voter123'); }}
              className="p-2 bg-navy-800 hover:bg-navy-700 rounded-lg text-slate-300 hover:text-white border border-navy-700 transition"
            >
              👤 Alice (Voter)
            </button>
            <button
              onClick={() => { setEmail('admin@voting.gov'); setPassword('admin123'); }}
              className="p-2 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg text-amber-300 border border-amber-500/30 transition"
            >
              👑 Admin User
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register new voter
          </Link>
        </p>

      </div>

      {/* 2FA OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        email={email}
        devOtp={devOtp}
        title="Enter 2FA Security Passcode"
        onVerify={handleVerify2FA}
        onClose={() => setShowOtpModal(false)}
      />
    </div>
  );
}
