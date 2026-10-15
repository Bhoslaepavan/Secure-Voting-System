import React from 'react';
import { CheckCircle, Award, FileText, UserCheck } from 'lucide-react';

export default function CandidateCard({ candidate, selected, onSelect, disabled }) {
  return (
    <div
      onClick={() => !disabled && onSelect(candidate._id)}
      className={`relative rounded-2xl p-5 border transition-all cursor-pointer ${
        selected
          ? 'bg-navy-800/90 border-cyan-400 ring-2 ring-cyan-400/40 glow-cyan'
          : 'bg-navy-900/60 border-navy-700 hover:border-navy-600 hover:bg-navy-800/40'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {selected && (
        <div className="absolute top-4 right-4 bg-cyan-400 text-navy-950 p-1.5 rounded-full shadow-md">
          <CheckCircle className="w-5 h-5 font-extrabold" />
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Photo / Symbol Avatar */}
        <div className="relative">
          {candidate.photoUrl ? (
            <img
              src={candidate.photoUrl}
              alt={candidate.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-navy-600"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-navy-800 border-2 border-navy-600 flex items-center justify-center text-3xl">
              {candidate.symbol || '🏛️'}
            </div>
          )}
          <span className="absolute -bottom-2 -right-1 bg-navy-900 border border-navy-700 text-xs px-2 py-0.5 rounded-full font-mono font-bold text-cyan-400">
            {candidate.symbol || '🏛️'}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className="text-lg font-bold text-white leading-tight">{candidate.name}</h4>
          <p className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
            {candidate.party}
          </p>

          {candidate.manifesto && (
            <div className="bg-navy-950/60 border border-navy-800 rounded-xl p-3 text-xs text-slate-300 flex items-start gap-2">
              <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="line-clamp-2 italic">{candidate.manifesto}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
