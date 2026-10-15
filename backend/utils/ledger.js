const crypto = require('crypto');
const VoteBlock = require('../models/VoteBlock');

const GENESIS_HASH = '0'.repeat(64);

/**
 * Computes a SHA-256 hash for a block payload.
 */
function computeHash({ blockIndex, electionId, candidateId, timestamp, previousHash, nonce = 0 }) {
  const payload = `${blockIndex}-${electionId}-${candidateId}-${new Date(timestamp).toISOString()}-${previousHash}-${nonce}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Appends a new vote block to the election hash-chain.
 */
async function addVoteBlock(electionId, candidateId) {
  const blocks = await VoteBlock.find({ electionId }).sort({ blockIndex: 1 });
  const blockIndex = blocks.length;
  
  let previousHash = GENESIS_HASH;
  if (blockIndex > 0) {
    previousHash = blocks[blockIndex - 1].currentHash;
  }

  const timestamp = new Date();
  const currentHash = computeHash({
    blockIndex,
    electionId,
    candidateId,
    timestamp,
    previousHash
  });

  const newBlock = await VoteBlock.create({
    blockIndex,
    electionId,
    candidateId,
    timestamp,
    previousHash,
    currentHash
  });

  return {
    receiptHash: newBlock.currentHash,
    blockIndex: newBlock.blockIndex,
    timestamp: newBlock.timestamp
  };
}

/**
 * Verifies the integrity of the ledger for a specific election.
 * Returns detailed status, broken block details, and chain stats.
 */
async function verifyChain(electionId) {
  const blocks = await VoteBlock.find({ electionId }).sort({ blockIndex: 1 });
  
  if (blocks.length === 0) {
    return {
      valid: true,
      totalBlocks: 0,
      message: 'Ledger is empty (Genesis state)'
    };
  }

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    // Check 1: Previous hash link consistency
    if (block.previousHash !== expectedPrevHash) {
      return {
        valid: false,
        totalBlocks: blocks.length,
        brokenAtBlock: block.blockIndex,
        brokenBlockId: block._id,
        reason: `Previous hash mismatch at Block #${block.blockIndex}. Expected '${expectedPrevHash.substring(0, 16)}...', but found '${block.previousHash.substring(0, 16)}...'`
      };
    }

    // Check 2: Current hash re-computation integrity
    const recomputedHash = computeHash({
      blockIndex: block.blockIndex,
      electionId: block.electionId,
      candidateId: block.candidateId,
      timestamp: block.timestamp,
      previousHash: block.previousHash,
      nonce: block.nonce || 0
    });

    if (recomputedHash !== block.currentHash) {
      return {
        valid: false,
        totalBlocks: blocks.length,
        brokenAtBlock: block.blockIndex,
        brokenBlockId: block._id,
        reason: `Data tampering detected at Block #${block.blockIndex}! Stored hash '${block.currentHash.substring(0, 16)}...' does not match calculated payload hash '${recomputedHash.substring(0, 16)}...'`
      };
    }

    expectedPrevHash = block.currentHash;
  }

  return {
    valid: true,
    totalBlocks: blocks.length,
    lastBlockHash: expectedPrevHash,
    message: `Ledger audit passed successfully! All ${blocks.length} block hashes are mathematically valid.`
  };
}

/**
 * Viva Demo Feature: Intentionally tampers with a vote block to demonstrate hash-chain failure.
 */
async function simulateTamper(electionId, targetBlockIndex = 0, fakeCandidateId = 'FAKE_CANDIDATE_TAMPERED') {
  const block = await VoteBlock.findOne({ electionId, blockIndex: targetBlockIndex });
  if (!block) {
    throw new Error(`Block index ${targetBlockIndex} not found for election`);
  }

  // Mutate candidate choice directly without recalculating currentHash
  block.candidateId = fakeCandidateId;
  await block.save();

  return {
    tamperedBlockIndex: targetBlockIndex,
    newCandidateId: fakeCandidateId,
    message: `Block #${targetBlockIndex} candidateId altered directly in DB! Re-run verification to see chain break.`
  };
}

module.exports = {
  computeHash,
  addVoteBlock,
  verifyChain,
  simulateTamper,
  GENESIS_HASH
};
