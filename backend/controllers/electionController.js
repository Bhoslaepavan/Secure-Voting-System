const Election = require('../models/Election');
const VoteBlock = require('../models/VoteBlock');

// GET ALL ELECTIONS
exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch elections.' });
  }
};

// GET ELECTION BY ID
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found.' });
    }

    // Calculate turnout metrics (Total votes in ledger so far)
    const voteCount = await VoteBlock.countDocuments({ electionId: election._id });
    
    res.json({
      ...election.toObject(),
      totalTurnout: voteCount
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch election details.' });
  }
};

// CREATE ELECTION (ADMIN ONLY)
exports.createElection = async (req, res) => {
  try {
    const { title, description, category, startTime, endTime, candidates } = req.body;

    if (!title || !startTime || !endTime || !candidates || candidates.length < 2) {
      return res.status(400).json({ message: 'Title, startTime, endTime, and at least 2 candidates are required.' });
    }

    const election = await Election.create({
      title,
      description,
      category: category || 'General',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      candidates,
      createdBy: req.voter.id
    });

    res.status(201).json({
      message: 'Election created successfully!',
      election
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create election.' });
  }
};

// PUBLISH RESULTS (ADMIN ONLY)
exports.publishResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found.' });
    }

    election.isPublished = true;
    await election.save();

    res.json({ message: 'Election results published successfully!', election });
  } catch (err) {
    res.status(500).json({ message: 'Failed to publish results.' });
  }
};

// GET ELECTION RESULTS (TALLIES)
// Decoupled counting from VoteBlock ledger
exports.getElectionResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found.' });
    }

    const now = new Date();
    const isClosed = now > new Date(election.endTime);

    // Results visible if admin published OR voting period has ended
    if (!election.isPublished && !isClosed && req.voter?.role !== 'admin') {
      return res.status(403).json({
        message: 'Live tallies are hidden during active voting window to prevent bias. Check back after election closes or when published.'
      });
    }

    const blocks = await VoteBlock.find({ electionId: election._id });
    
    // Tally votes per candidate
    const tallyMap = {};
    election.candidates.forEach(c => {
      tallyMap[c._id.toString()] = {
        candidateId: c._id,
        name: c.name,
        party: c.party,
        symbol: c.symbol,
        votes: 0
      };
    });

    blocks.forEach(block => {
      if (tallyMap[block.candidateId]) {
        tallyMap[block.candidateId].votes += 1;
      }
    });

    const results = Object.values(tallyMap);
    const totalVotes = blocks.length;

    // Calculate percentage
    const formattedResults = results.map(r => ({
      ...r,
      percentage: totalVotes > 0 ? ((r.votes / totalVotes) * 100).toFixed(1) : 0
    }));

    res.json({
      electionTitle: election.title,
      isClosed,
      isPublished: election.isPublished,
      totalVotes,
      results: formattedResults
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compile election results.' });
  }
};
