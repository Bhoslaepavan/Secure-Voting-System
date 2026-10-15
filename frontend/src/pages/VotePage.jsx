import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import CandidateCard from '../components/CandidateCard';
import confetti from 'canvas-confetti';
import { ShieldCheck, CheckCircle2, AlertCircle, Lock, ArrowLeft, ArrowRight, KeyRound, Copy, Check } from 'lucide-react';

export default function VotePage() {
  const { id: electionId } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();

  const [election, setElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [step, setStep] = useState(1); // 1: Verify, 2: Select, 3: Confirm, 4: Receipt
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadElection();
  }, [electionId]);

  const loadElection = async () => {
    try {
      const res = await API.get(`/elections/${electionId}`);
      setElection(res.data);
    } catch (err) {
      setError('Failed to load election details.');
    } finally {
      setLoading(false);
    }
  };

  const handleCastVoteSubmit = async () => {
    if (!selectedCandidate) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await API.post('/votes/cast', {
        electionId,
        candidateId: selectedCandidate
      });

      setReceipt(res.data);
      setStep(4);
      await fetchProfile(); // Refresh hasVoted map

      // Trigger Confetti Celebration for successful cryptographic vote lock
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit vote. Check election rules.');
      setStep(2);
    } finally {
      setSubmitting(false);
    }
  };

  const copyReceiptHash = () => {
    if (receipt?.receiptHash) {
      navigator.clipboard.writeText(receipt.receiptHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-cyan-400 font-semibold">
        Verifying Cryptographic Credentials...
      </div>
    );
  }

  if (error && !election) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-navy-900 border border-rose-500/30 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Error Loading Election</h3>
        <p className="text-sm text-slate-300 mb-4">{error}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-navy-800 text-white rounded-xl text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      
      {/* Back button */}
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Active Elections
      </Link>

      {/* Stepper Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-navy-800 -translate-y-1/2 z-0" />
          
          {[
            { s: 1, title: "1. Identity Check" },
            { s: 2, title: "2. Select Candidate" },
            { s: 3, title: "3. Cryptographic Lock" },
            { s: 4, title: "4. Proof Receipt" }
          ].map((item) => (
            <div key={item.s} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                  step === item.s
                    ? 'bg-cyan-500 text-navy-950 ring-4 ring-cyan-500/30 shadow-lg glow-cyan'
                    : step > item.s
                    ? 'bg-emerald-500 text-navy-950'
                    : 'bg-navy-800 text-slate-500 border border-navy-700'
                }`}
              >
                {step > item.s ? <CheckCircle2 className="w-5 h-5" /> : item.s}
              </div>
              <span className="text-[11px] font-semibold text-slate-300 hidden sm:block">
                {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-10 shadow-2xl relative glow-cyan">

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* STEP 1: VERIFY IDENTITY & ELIGIBILITY */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Verify Voter Credentials</h2>
              <p className="text-sm text-slate-400">Confirm your biometric/digital ID before accessing the secret ballot</p>
            </div>

            <div className="bg-navy-950 border border-navy-800 rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-navy-800 pb-2">
                <span className="text-slate-400">Voter Name:</span>
                <span className="text-white font-bold">{user?.name}</span>
              </div>
              <div className="flex justify-between border-b border-navy-800 pb-2">
                <span className="text-slate-400">Government Voter ID:</span>
                <span className="text-cyan-400 font-bold">{user?.voterId}</span>
              </div>
              <div className="flex justify-between border-b border-navy-800 pb-2">
                <span className="text-slate-400">Target Election:</span>
                <span className="text-white font-bold">{election?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Ballot Encryption:</span>
                <span className="text-emerald-400 font-bold">SHA-256 Decoupled Standard</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 font-extrabold rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2"
            >
              Proceed to Ballot Selection <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP 2: SELECT CANDIDATE */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">Cast Your Vote</h2>
              <p className="text-xs text-slate-400">Choose one candidate. Your identity will NOT be attached to your vote block.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {election?.candidates.map((candidate) => (
                <CandidateCard
                  key={candidate._id}
                  candidate={candidate}
                  selected={selectedCandidate === candidate._id}
                  onSelect={(id) => setSelectedCandidate(id)}
                />
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-navy-800">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
              >
                Back
              </button>
              <button
                disabled={!selectedCandidate}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-navy-950 font-extrabold shadow-lg shadow-cyan-500/20 transition disabled:opacity-40"
              >
                Review & Confirm Selection
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CONFIRM & LOCK BALLOT */}
        {step === 3 && (
          <div className="space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-white">Final Ballot Lock Confirmation</h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Once submitted, your vote block will be hashed into the tamper-evident ledger. This action is <strong>irreversible</strong>.
            </p>

            <div className="bg-navy-950 border border-navy-800 rounded-2xl p-5 max-w-md mx-auto space-y-2 text-left">
              <span className="text-xs uppercase font-bold text-slate-400">Selected Candidate Choice:</span>
              {election?.candidates.filter(c => c._id === selectedCandidate).map(c => (
                <div key={c._id} className="flex items-center gap-3 pt-1">
                  <span className="text-3xl">{c.symbol}</span>
                  <div>
                    <h4 className="text-lg font-bold text-white">{c.name}</h4>
                    <p className="text-xs text-cyan-400 font-semibold">{c.party}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 pt-4">
              <button
                disabled={submitting}
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-navy-800 border border-navy-700 transition"
              >
                Change Selection
              </button>
              <button
                disabled={submitting}
                onClick={handleCastVoteSubmit}
                className="px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-navy-950 font-extrabold shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Locking Block into Ledger...' : 'Confirm & Append to Ledger'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: PROOF RECEIPT DISPLAY */}
        {step === 4 && receipt && (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-3xl font-extrabold text-white">Vote Cast & Sealed!</h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto">
              Your vote has been assigned to Block index <span className="font-mono text-cyan-400 font-bold">#{receipt.blockIndex}</span>. Below is your cryptographic receipt hash.
            </p>

            <div className="bg-navy-950 border border-cyan-500/40 rounded-2xl p-6 max-w-xl mx-auto space-y-4 text-left glow-emerald">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" /> Official SHA-256 Receipt Hash
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(receipt.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="bg-navy-900 border border-navy-700 rounded-xl p-4 font-mono text-xs text-emerald-400 break-all select-all flex items-center justify-between gap-2">
                <span>{receipt.receiptHash}</span>
                <button
                  onClick={copyReceiptHash}
                  className="p-2 bg-navy-800 hover:bg-navy-700 text-slate-200 rounded-lg shrink-0 transition"
                  title="Copy Receipt Hash"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                ℹ️ <strong>Ballot Secrecy Guarantee:</strong> This receipt proves your vote block is in the ledger without storing or exposing your candidate choice.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-white font-bold text-xs border border-navy-700 transition"
              >
                Return to Dashboard
              </Link>
              <Link
                to="/receipt-verify"
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold text-xs shadow-md transition"
              >
                Test Receipt Lookup
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
