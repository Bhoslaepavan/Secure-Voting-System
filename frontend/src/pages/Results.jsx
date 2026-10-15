import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api/axiosInstance';
import { Award, Users, BarChart3, ArrowLeft, Lock, CheckCircle2, Trophy } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#00b4d8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function Results() {
  const { id: electionId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [electionId]);

  const loadResults = async () => {
    try {
      const res = await API.get(`/elections/${electionId}/results`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load election results.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-cyan-400 font-semibold">
        Compiling Decoupled Ledger Vote Counts...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-navy-900 border border-navy-700 rounded-2xl text-center">
        <Lock className="w-12 h-12 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Live Tallies Restricted</h3>
        <p className="text-sm text-slate-300 mb-4">{error}</p>
        <Link to="/dashboard" className="px-4 py-2 bg-cyan-500 text-navy-950 font-bold rounded-xl text-xs">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Find winner
  const sorted = [...(data?.results || [])].sort((a, b) => b.votes - a.votes);
  const winner = sorted[0];

  const chartData = data?.results.map((r) => ({
    name: r.name,
    value: r.votes
  })) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="w-4 h-4" /> Certified Ledger Results
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{data?.electionTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Total Audited Votes Cast: <span className="font-mono text-cyan-300 font-bold">{data?.totalVotes} Block(s)</span>
            </p>
          </div>

          <div className="bg-navy-950 px-4 py-2 rounded-xl border border-navy-700 text-xs font-semibold text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Chain Audit Verified
          </div>
        </div>
      </div>

      {/* Winner Spotlight */}
      {winner && winner.votes > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border border-amber-500/30 rounded-3xl p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">Projected Election Winner</span>
              <h3 className="text-2xl font-extrabold text-white">{winner.name}</h3>
              <p className="text-xs text-amber-300 font-semibold">{winner.party} • {winner.votes} votes ({winner.percentage}%)</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Breakdown & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Candidate Progress List */}
        <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 space-y-5 shadow-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" /> Vote Share Breakdown
          </h3>

          <div className="space-y-4">
            {sorted.map((candidate, idx) => (
              <div key={candidate.candidateId} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    <span>{candidate.symbol}</span> {candidate.name}
                    <span className="text-[10px] text-slate-400 font-normal">({candidate.party})</span>
                  </span>
                  <span className="font-mono text-cyan-300 font-bold">
                    {candidate.votes} votes ({candidate.percentage}%)
                  </span>
                </div>
                
                {/* Custom Progress Bar */}
                <div className="w-full h-3 bg-navy-950 rounded-full overflow-hidden border border-navy-800">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${candidate.percentage}%`,
                      backgroundColor: COLORS[idx % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recharts Pie Visualization */}
        <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 flex flex-col items-center justify-center shadow-xl">
          <h3 className="text-lg font-bold text-white mb-4">Vote Share Distribution</h3>
          {data?.totalVotes > 0 ? (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', borderColor: '#2a365c', borderRadius: '12px' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12">No votes recorded yet for this election.</p>
          )}
        </div>

      </div>

    </div>
  );
}
