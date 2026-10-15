import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { KeyRound, Search, ShieldCheck, AlertCircle, CheckCircle2, Link as LinkIcon } from 'lucide-react';

export default function ReceiptPage() {
  const [hashInput, setHashInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!hashInput.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await API.get(`/votes/receipt/${hashInput.trim()}`);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Receipt hash not found in the ledger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-lg glow-cyan">
          <KeyRound className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white">Cryptographic Receipt Verifier</h1>
        <p className="text-sm text-slate-400">
          Paste your vote receipt SHA-256 hash code below to verify block inclusion in the ledger.
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleSearch} className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 shadow-xl">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
          Vote Receipt Hash Code (SHA-256)
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            placeholder="e.g. 8f9b2a1c4e7d3f0a..."
            className="flex-1 bg-navy-800 border border-navy-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 rounded-xl py-3 px-4 text-sm text-white font-mono placeholder-slate-500 outline-none transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? 'Searching Ledger...' : (
              <>
                <Search className="w-4 h-4" /> Verify Inclusion
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" />
          <div>
            <h4 className="font-bold">Verification Failed</h4>
            <p className="text-xs text-rose-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {result && (
        <div className="bg-navy-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl glow-emerald animate-fade-in">
          <div className="flex items-center gap-3 text-emerald-400 border-b border-navy-800 pb-4">
            <CheckCircle2 className="w-8 h-8 shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-white">Cryptographic Proof Confirmed</h3>
              <p className="text-xs text-slate-400">Vote block exists and maintains mathematically unbroken ledger hash link</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
              <span className="text-slate-400 block mb-1">Block Ledger Height:</span>
              <span className="text-cyan-400 text-base font-bold">Block #{result.blockIndex}</span>
            </div>
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800">
              <span className="text-slate-400 block mb-1">Election Title:</span>
              <span className="text-white font-bold">{result.electionTitle}</span>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-1">
              <span className="text-slate-400 block text-[11px] uppercase font-bold">Block SHA-256 Current Hash (Receipt):</span>
              <p className="text-emerald-400 font-bold break-all">{result.receiptHash}</p>
            </div>

            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-1">
              <span className="text-slate-400 block text-[11px] uppercase font-bold flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-cyan-400" /> Linked Previous Block Hash:
              </span>
              <p className="text-slate-300 break-all">{result.previousHash}</p>
            </div>
          </div>

          <div className="p-4 bg-navy-950/60 rounded-xl border border-navy-800 text-xs text-slate-300">
            🔒 <strong>Audit Protocol:</strong> Your choice remains confidential while the mathematical validity of your vote is publicly verifiable by anyone holding this receipt.
          </div>
        </div>
      )}

    </div>
  );
}
