const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  voterId: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['voter', 'admin'], default: 'voter' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  // Tracks voting status per election: electionId -> true
  hasVoted: { type: Map, of: Boolean, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Voter', voterSchema);
