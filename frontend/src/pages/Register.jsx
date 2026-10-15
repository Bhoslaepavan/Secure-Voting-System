import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import OtpModal from '../components/OtpModal';

import {
  UserPlus,
  Lock,
  Mail,
  Phone,
  CreditCard,
  User,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    voterId: '',
    password: '',
    role: 'voter'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/register', formData);

      setDevOtp(res.data.devOtp || '');
      setShowOtpModal(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed. Check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (otpCode) => {
    try {
      await API.post('/auth/verify-registration-otp', {
        email: formData.email,
        otp: otpCode
      });

      setShowOtpModal(false);

      navigate('/login', {
        state: {
          message: 'Registration verified! Please log in.'
        }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'OTP verification failed.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6">

      {/* Registration Card */}
      <div className="max-w-lg w-full bg-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-10 shadow-2xl relative glow-cyan">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-7 h-7" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Voter Registration
          </h2>

          <p className="text-sm text-slate-400 mt-1">
            Enroll into the tamper-evident digital voting registry
          </p>

        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">

            <AlertCircle className="w-5 h-5 shrink-0" />

            <span>{error}</span>

          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>

            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>

            <div className="relative">

              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alice Johnson"
                className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
              />

            </div>

          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Email */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>

              <div className="relative">

                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="voter@example.com"
                  className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />

              </div>

            </div>

            {/* Phone */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>

              <div className="relative">

                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555 019 2831"
                  className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none transition"
                />

              </div>

            </div>

          </div>

          {/* Voter ID + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Voter ID */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Voter ID / Gov Reg #
              </label>

              <div className="relative">

                {/* FIXED: CreditCard instead of IdCard */}
                <CreditCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type="text"
                  name="voterId"
                  required
                  value={formData.voterId}
                  onChange={handleChange}
                  placeholder="VOTER-2026-XXXX"
                  className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-500 font-mono outline-none transition"
                />

              </div>

            </div>

            {/* Role */}
            <div>

              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Role Type
              </label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 px-4 text-sm text-white outline-none transition"
              >

                <option value="voter">
                  Standard Voter
                </option>

                <option value="admin">
                  Administrator / Auditor
                </option>

              </select>

            </div>

          </div>

          {/* Password */}
          <div>

            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">

              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                type="password"
                name="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                className="w-full bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition"
              />

            </div>

          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >

            {loading ? (
              'Processing Registration...'
            ) : (
              <>
                Register & Verify OTP

                <ArrowRight className="w-5 h-5" />
              </>
            )}

          </button>

        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-xs text-slate-400">

          Already registered?{' '}

          <Link
            to="/login"
            className="text-cyan-400 font-semibold hover:underline"
          >
            Sign in to your account
          </Link>

        </p>

      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        email={formData.email}
        devOtp={devOtp}
        title="Registration OTP Verification"
        onVerify={handleVerifyOtp}
        onClose={() => setShowOtpModal(false)}
      />

    </div>
  );
}