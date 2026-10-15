const mongoose = require('mongoose');

// Decoupled Vote Storage: Notice NO voter identity (voterId, name, email) is recorded here!
// This satisfies ballot secrecy & anonymity while preserving tamper-evidence.
const voteBlockSchema = new mongoose.Schema({
  blockIndex: { type: Number, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidateId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  previousHash: { type: String, required: true },
  currentHash: { type: String, required: true },
  nonce: { type: Number, default: 0 } // Demonstrates proof-of-work/block header standard
}, { timestamps: true });

// Ensure fast index lookup
voteBlockSchema.index({ electionId: 1, blockIndex: 1 });

module.exports = mongoose.model('VoteBlock', voteBlockSchema);
