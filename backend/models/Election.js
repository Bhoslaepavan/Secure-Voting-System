const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  symbol: { type: String, default: '🏛️' },
  manifesto: { type: String, default: '' },
  photoUrl: { type: String, default: '' }
});

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General' },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  candidates: [candidateSchema],
  isPublished: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Voter' }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
