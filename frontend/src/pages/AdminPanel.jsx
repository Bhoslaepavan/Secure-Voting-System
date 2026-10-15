import React, { useEffect, useState } from 'react';
import API from '../api/axiosInstance';
import { ShieldCheck, Plus, CheckCircle2, AlertCircle, RefreshCw, Lock, Radio, Database, Flame, FileCheck, Layers } from 'lucide-react';

export default function AdminPanel() {
  const [elections, setElections] = useState([]);
  const [selectedElectionId, setSelectedElectionId] = useState('');
  const [auditReport, setAuditReport] = useState(null);
  const [auditing, setAuditing] = useState(false);
  const [tampering, setTampering] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Create Election Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newElection, setNewElection] = useState({
    title: '',
    description: '',
    category: 'Student Body',
    startTime: '',
    endTime: '',
    candidates: [
      { name: '', party: '', symbol: '🚀', manifesto: '' },
      { name: '', party: '', symbol: '🛡️', manifesto: '' }
    ]
  });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    try {
      const res = await API.get('/elections');
      setElections(res.data);
      if (res.data.length > 0 && !selectedElectionId) {
        setSelectedElectionId(res.data[0]._id);
      }
    } catch (err) {
      setError('Failed to load elections.');
    }
  };

  const handleAuditChain = async () => {
    if (!selectedElectionId) return;
    setAuditing(true);
    setError('');
    setMessage('');
    try {
      const res = await API.get(`/votes/audit/${selectedElectionId}`);
      setAuditReport(res.data);
    } catch (err) {
      setError('Audit failed.');
    } finally {
      setAuditing(false);
    }
  };

  const handleSimulateTamper = async () => {
    if (!selectedElectionId) return;
    if (!window.confirm('⚠️ VIVA DEMO WARNING: This will intentionally alter a candidate vote in the DB without recalculating block hashes. Re-running audit will demonstrate cryptographic chain breakage. Proceed?')) {
      return;
    }
    setTampering(true);
    setError('');
    try {
      const res = await API.post('/votes/simulate-tamper', {
        electionId: selectedElectionId,
        blockIndex: 0
      });
      setMessage(`🔥 TAMPER SIMULATED: ${res.data.message}`);
      // Auto-re-audit to show instant break detection!
      await handleAuditChain();
    } catch (err) {
      setError(err.response?.data?.message || 'Tamper simulation failed.');
    } finally {
      setTampering(false);
    }
  };

  const handlePublishResults = async (id) => {
    try {
      await API.put(`/elections/${id}/publish`);
      setMessage('Election results published to voters successfully!');
      loadElections();
    } catch (err) {
      setError('Failed to publish results.');
    }
  };

  const handleCandidateChange = (index, field, value) => {
    const updated = [...newElection.candidates];
    updated[index][field] = value;
    setNewElection({ ...newElection, candidates: updated });
  };

  const addCandidateField = () => {
    setNewElection({
      ...newElection,
      candidates: [...newElection.candidates, { name: '', party: '', symbol: '⚡', manifesto: '' }]
    });
  };

  const handleCreateElectionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await API.post('/elections', newElection);
      setShowCreateModal(false);
      setMessage('New election created successfully!');
      loadElections();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create election.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div>
          <span className="text-xs uppercase font-extrabold text-amber-400 font-mono tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-4 h-4" /> Chief Commissioner Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Election Administration & Ledger Auditor</h1>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-navy-950 font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Election
        </button>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {/* VIVA DEMO TOOL & LEDGER AUDITOR */}
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl glow-cyan">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-navy-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Cryptographic Ledger Audit & Viva Tamper Tool
            </h2>
            <p className="text-xs text-slate-400">Verify SHA-256 hash-chain integrity or test malicious database tampering live</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={selectedElectionId}
              onChange={(e) => setSelectedElectionId(e.target.value)}
              className="bg-navy-800 border border-navy-600 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              {elections.map((e) => (
                <option key={e._id} value={e._id}>{e.title}</option>
              ))}
            </select>

            <button
              onClick={handleAuditChain}
              disabled={auditing}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : ''}`} /> Run Chain Audit
            </button>

            <button
              onClick={handleSimulateTamper}
              disabled={tampering}
              className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-50"
              title="Viva Demo: Alter vote in DB to demonstrate chain break"
            >
              <Flame className="w-3.5 h-3.5" /> Simulate Tamper
            </button>
          </div>
        </div>

        {/* Audit Report Results */}
        {auditReport && (
          <div className="space-y-4 font-mono text-xs">
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              auditReport.auditReport.valid
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
            }`}>
              <div className="flex items-center gap-3">
                {auditReport.auditReport.valid ? (
                  <CheckCircle2 className="w-7 h-7 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-7 h-7 shrink-0 text-rose-400" />
                )}
                <div>
                  <h4 className="text-base font-bold text-white">
                    {auditReport.auditReport.valid ? 'LEDGER INTEGRITY VERIFIED (PASSED)' : 'SECURITY ALERT: TAMPERING DETECTED!'}
                  </h4>
                  <p className="text-xs">{auditReport.auditReport.message || auditReport.auditReport.reason}</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-navy-950 rounded-lg border border-navy-800">
                Height: {auditReport.blocksCount} Block(s)
              </span>
            </div>

            {/* Block Inspector List */}
            <div className="bg-navy-950 rounded-2xl border border-navy-800 p-4 space-y-3 max-h-80 overflow-y-auto">
              <span className="text-xs uppercase font-bold text-slate-400 block">Block Chain Inspector:</span>
              {auditReport.blocksSummary.map((b) => (
                <div key={b.blockIndex} className="bg-navy-900 border border-navy-800 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-cyan-400 font-bold">
                    <span>Block Index #{b.blockIndex}</span>
                    <span className="text-slate-400 text-[10px]">{new Date(b.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-500">Prev Hash:</span> {b.previousHash.substring(0, 32)}...
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    <span className="text-slate-500">Curr Hash:</span> {b.currentHash.substring(0, 32)}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Elections Table */}
      <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
        <h3 className="text-xl font-bold text-white">Managed Elections</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-950 uppercase font-bold text-slate-400 border-b border-navy-800">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Candidates</th>
                <th className="p-3">Status / Publish</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800">
              {elections.map((e) => (
                <tr key={e._id} className="hover:bg-navy-800/40">
                  <td className="p-3 font-bold text-white">{e.title}</td>
                  <td className="p-3">{e.category}</td>
                  <td className="p-3">{e.candidates.length} Candidate(s)</td>
                  <td className="p-3">
                    {e.isPublished ? (
                      <span className="text-emerald-400 font-bold">Published</span>
                    ) : (
                      <button
                        onClick={() => handlePublishResults(e._id)}
                        className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg hover:bg-amber-500/30 transition"
                      >
                        Publish Results
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ELECTION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="bg-navy-900 border border-navy-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white">Create New Election</h3>

            <form onSubmit={handleCreateElectionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newElection.title}
                  onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                  placeholder="e.g. Student Senate Presidential Election"
                  className="w-full bg-navy-800 border border-navy-600 rounded-xl p-3 text-sm text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  required
                  value={newElection.description}
                  onChange={(e) => setNewElection({ ...newElection, description: e.target.value })}
                  placeholder="Brief summary of policy agenda or purpose"
                  className="w-full bg-navy-800 border border-navy-600 rounded-xl p-3 text-sm text-white outline-none h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newElection.startTime}
                    onChange={(e) => setNewElection({ ...newElection, startTime: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-600 rounded-xl p-3 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newElection.endTime}
                    onChange={(e) => setNewElection({ ...newElection, endTime: e.target.value })}
                    className="w-full bg-navy-800 border border-navy-600 rounded-xl p-3 text-sm text-white outline-none"
                  />
                </div>
              </div>

              {/* Candidate Fields */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-cyan-400 uppercase">Candidates (Minimum 2)</label>
                  <button type="button" onClick={addCandidateField} className="text-xs text-cyan-400 hover:underline">+ Add Candidate</button>
                </div>

                {newElection.candidates.map((c, idx) => (
                  <div key={idx} className="bg-navy-950 p-3 rounded-xl border border-navy-800 grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Candidate Name"
                      required
                      value={c.name}
                      onChange={(e) => handleCandidateChange(idx, 'name', e.target.value)}
                      className="bg-navy-800 border border-navy-700 rounded-lg p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Party / Affiliation"
                      required
                      value={c.party}
                      onChange={(e) => handleCandidateChange(idx, 'party', e.target.value)}
                      className="bg-navy-800 border border-navy-700 rounded-lg p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Symbol (Emoji)"
                      value={c.symbol}
                      onChange={(e) => handleCandidateChange(idx, 'symbol', e.target.value)}
                      className="bg-navy-800 border border-navy-700 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold rounded-xl text-xs"
                >
                  Create Election
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
