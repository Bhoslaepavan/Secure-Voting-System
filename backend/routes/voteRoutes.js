const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.post('/cast', authMiddleware, voteController.castVote);
router.get('/receipt/:receiptHash', voteController.verifyReceipt);

// Admin ledger & transparency endpoints
router.get('/audit/:electionId', authMiddleware, voteController.auditLedger);
router.post('/simulate-tamper', authMiddleware, adminMiddleware, voteController.simulateTamperDemo);

module.exports = router;
