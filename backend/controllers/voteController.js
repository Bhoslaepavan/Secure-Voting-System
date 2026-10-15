const Election = require('../models/Election');
const Voter = require('../models/Voter');
const VoteBlock = require('../models/VoteBlock');
const { addVoteBlock, verifyChain, simulateTamper } = require('../utils/ledger');

// CAST VOTE
exports.castVote = async (req, res) => {
  try {
    const voterId = req.voter.id;
    const { electionId, candidateId } = req.body;

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: 'Both electionId and candidateId are required.' });
    }

    // 1. Verify Election status
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Target election does not exist.' });
    }

    const now = new Date();
    if (now < new Date(election.startTime)) {
      return res.status(400).json({ message: 'Voting window has not opened yet for this election.' });
    }
    if (now > new Date(election.endTime)) {
      return res.status(400).json({ message: 'Voting for this election is now closed.' });
    }

    // Validate candidate option
    const validCandidate = election.candidates.id(candidateId);
    if (!validCandidate) {
      return res.status(400).json({ message: 'Invalid candidate selected.' });
    }

    // 2. Check Voter state (1 Vote Per Election Constraint)
    const voter = await Voter.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter account not found.' });
    }

    if (voter.hasVoted.get(electionId)) {
      return res.status(400).json({ message: 'SECURITY ALERT: You have already cast a ballot in this election!' });
    }

    // 3. Append to Immutable SHA-256 Hash-Chain Ledger (Decoupled Identity)
    const blockData = await addVoteBlock(electionId, candidateId);

    // 4. Update Voter hasVoted Status Map
    voter.hasVoted.set(electionId, true);
    await voter.save();

    res.status(201).json({
      message: 'Vote cast successfully and appended to SHA-256 tamper-evident ledger!',
      receiptHash: blockData.receiptHash,
      blockIndex: blockData.blockIndex,
      timestamp: blockData.timestamp,
      candidateName: validCandidate.name
    });
  } catch (err) {
    console.error('Cast vote error:', err);
    res.status(500).json({ message: 'Vote casting failed due to ledger error.' });
  }
};

// AUDIT LEDGER CHAIN INTEGRITY (ADMIN / TRANSPARENCY)
exports.auditLedger = async (req, res) => {
  try {
    const { electionId } = req.params;
    const auditReport = await verifyChain(electionId);
    
    // Also fetch block height
    const blocks = await VoteBlock.find({ electionId }).sort({ blockIndex: 1 });
    
    res.json({
      auditReport,
      blocksCount: blocks.length,
      blocksSummary: blocks.map(b => ({
        blockIndex: b.blockIndex,
        timestamp: b.timestamp,
        previousHash: b.previousHash,
        currentHash: b.currentHash
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete ledger audit.' });
  }
};

// VIVA DEMO TOOL: SIMULATE TAMPERING
exports.simulateTamperDemo = async (req, res) => {
  try {
    const { electionId, blockIndex } = req.body;
    const result = await simulateTamper(electionId, blockIndex || 0, 'FAKE_MALICIOUS_CANDIDATE_ID');
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// VERIFY RECEIPT HASH (VOTER TRANSPARENCY TOOL)
exports.verifyReceipt = async (req, res) => {
  try {
    const { receiptHash } = req.params;
    const block = await VoteBlock.findOne({ currentHash: receiptHash });
    
    if (!block) {
      return res.status(404).json({
        found: false,
        message: 'Receipt hash not found in the ledger. Check the hash code entered.'
      });
    }

    const election = await Election.findById(block.electionId);

    res.json({
      found: true,
      blockIndex: block.blockIndex,
      electionTitle: election ? election.title : 'Election',
      timestamp: block.timestamp,
      receiptHash: block.currentHash,
      previousHash: block.previousHash,
      message: 'Cryptographic proof verified! Your vote is securely recorded in the ledger.'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error verifying receipt hash.' });
  }
};
