import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import Timer from '../components/Timer';
import { Vote, CheckCircle2, Award, Clock, ArrowRight, ShieldCheck, Users, Lock, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { user, hasVotedMap, fetchProfile } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await fetchProfile();
      const res = await API.get('/elections');
      setElections(res.data);
    } catch (err) {
      setError('Failed to fetch elections listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-navy-700/80 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden glow-cyan">
        <div className="absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> SHA-256 Encrypted Identity & Ballot Protocol
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Welcome, <span className="text-cyan-400">{user?.name}</span>
            </h1>
            <p className="text-sm text-slate-300">
              Your identity is verified under Voter ID <span className="font-mono text-cyan-300 bg-navy-950 px-2 py-0.5 rounded border border-navy-700">{user?.voterId}</span>. All votes cast are mathematically bound to an immutable block chain.
            </p>
          </div>

          <Link
            to="/receipt-verify"
            className="shrink-0 px-5 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 border border-navy-600 text-sm font-semibold text-cyan-400 hover:text-white transition flex items-center gap-2 shadow-md"
          >
            <Lock className="w-4 h-4" /> Verify Vote Receipt
          </Link>
        </div>
      </div>

      {/* Elections Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Vote className="w-6 h-6 text-cyan-400" /> Active & Scheduled Elections
            </h2>
            <p className="text-xs text-slate-400">Select an active election to cast your tamper-proof vote</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-navy-900/50 border border-navy-800 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : elections.length === 0 ? (
          <div className="bg-navy-900 border border-navy-800 rounded-3xl p-12 text-center text-slate-400">
            <Vote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-white">No Elections Available Currently</p>
            <p className="text-xs text-slate-400">Check back soon or ask your election commissioner.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {elections.map((election) => {
              const hasVoted = hasVotedMap[election._id] || user?.hasVoted?.[election._id];
              const now = new Date();
              const isOpen = now >= new Date(election.startTime) && now <= new Date(election.endTime);
              const isEnded = now > new Date(election.endTime);

              return (
                <div
                  key={election._id}
                  className="bg-navy-900/80 border border-navy-700/80 rounded-3xl p-6 sm:p-7 flex flex-col justify-between glass-card-hover relative"
                >
                  <div className="space-y-4">
                    
                    {/* Header Badges */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs uppercase font-extrabold tracking-wider px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {election.category || 'General Election'}
                      </span>
                      
                      {isOpen ? (
                        <Timer endTime={election.endTime} />
                      ) : isEnded ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Closed
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Upcoming
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">{election.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-2">{election.description}</p>
                    </div>

                    {/* Candidates Preview */}
                    <div className="bg-navy-950/60 border border-navy-800/80 rounded-2xl p-3.5 space-y-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Candidates ({election.candidates.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {election.candidates.map((c) => (
                          <div
                            key={c._id}
                            className="bg-navy-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-navy-700 flex items-center gap-1.5"
                          >
                            <span>{c.symbol}</span>
                            <span className="font-medium">{c.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-6 pt-4 border-t border-navy-800/80 flex items-center justify-between gap-4">
                    <div>
                      {hasVoted ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                          <CheckCircle2 className="w-4 h-4" /> Ballot Locked & Chain Recorded
                        </div>
                      ) : isOpen ? (
                        <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1">
                          ● Voting Open Now
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {isEnded ? 'Voting Period Expired' : 'Scheduled Election'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEnded || election.isPublished ? (
                        <Link
                          to={`/results/${election._id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-cyan-400 border border-cyan-500/30 transition flex items-center gap-1.5"
                        >
                          <Award className="w-4 h-4" /> View Results
                        </Link>
                      ) : null}

                      {!hasVoted && isOpen && (
                        <Link
                          to={`/vote/${election._id}`}
                          className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-md shadow-cyan-500/20 transition flex items-center gap-1.5"
                        >
                          Cast Vote <ChevronRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
