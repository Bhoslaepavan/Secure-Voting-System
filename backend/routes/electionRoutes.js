const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, electionController.getAllElections);
router.get('/:id', authMiddleware, electionController.getElectionById);
router.get('/:id/results', authMiddleware, electionController.getElectionResults);

// Admin-only endpoints
router.post('/', authMiddleware, adminMiddleware, electionController.createElection);
router.put('/:id/publish', authMiddleware, adminMiddleware, electionController.publishResults);

module.exports = router;
