import React, { useState, useEffect } from 'react';
import { Lock, RefreshCw, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OtpModal({ isOpen, email, devOtp, title = "2FA Verification Code", onVerify, onResend, onClose }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval = null;
    if (isOpen && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto focus next input
    if (element.value !== '' && element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendClick = async () => {
    setTimer(60);
    setError('');
    if (onResend) await onResend();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-navy-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative glow-cyan">
        
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-white text-center mb-1">{title}</h3>
        <p className="text-sm text-slate-400 text-center mb-4">
          We sent a 6-digit passcode to <span className="text-cyan-300 font-mono font-medium">{email}</span>
        </p>

        {/* Dev Mode OTP Badge */}
        {devOtp && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-5 text-center">
            <span className="text-xs uppercase font-bold text-amber-400 block mb-1">
              ⚡ Viva / Demo Mode Active
            </span>
            <span className="font-mono text-xl font-extrabold text-amber-300 tracking-widest">
              {devOtp}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Auto-generated for instant offline demo</p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input Boxes */}
          <div className="flex items-center justify-center gap-2">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onFocus={(e) => e.target.select()}
                className="w-11 h-13 text-center text-xl font-bold font-mono bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-lg text-white outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirm & Authenticate
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400 border-t border-navy-800 pt-4">
          <span>Didn't receive code?</span>
          <button
            onClick={handleResendClick}
            disabled={timer > 0}
            className="text-cyan-400 font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
          >
            {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
