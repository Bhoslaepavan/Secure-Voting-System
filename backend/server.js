const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const electionRoutes = require('./routes/electionRoutes');
const voteRoutes = require('./routes/voteRoutes');

const Voter = require('./models/Voter');
const Election = require('./models/Election');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // Allows local dev frontend seamlessly
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/votes', voteRoutes);

// Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Secure Online Voting Platform Backend',
    ledgerAlgorithm: 'SHA-256 Hash-Chain',
    timestamp: new Date()
  });
});

// Auto-seed default admin & voter accounts and mock election if DB is empty
const seedInitialData = async () => {
  try {
    const voterCount = await Voter.countDocuments();
    if (voterCount === 0) {
      console.log('🌱 Seeding initial demo Admin & Voter accounts...');
      
      const adminPasswordHash = await bcrypt.hash('admin123', 10);
      const voterPasswordHash = await bcrypt.hash('voter123', 10);

      const admin = await Voter.create({
        name: 'Chief Election Commissioner (Admin)',
        email: 'admin@voting.gov',
        phone: '+1 800 555 0199',
        voterId: 'ADMIN-2026-001',
        passwordHash: adminPasswordHash,
        role: 'admin',
        isVerified: true
      });

      const voter1 = await Voter.create({
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+1 555 012 3456',
        voterId: 'VOTER-8849-001',
        passwordHash: voterPasswordHash,
        role: 'voter',
        isVerified: true
      });

      const voter2 = await Voter.create({
        name: 'Bob Smith',
        email: 'bob@example.com',
        phone: '+1 555 987 6543',
        voterId: 'VOTER-8849-002',
        passwordHash: voterPasswordHash,
        role: 'voter',
        isVerified: true
      });

      console.log('✅ Accounts Created:');
      console.log('  👑 Admin: admin@voting.gov | Password: admin123');
      console.log('  👤 Voter: alice@example.com | Password: voter123');
      console.log('  👤 Voter: bob@example.com   | Password: voter123');

      // Create initial active election
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      await Election.create({
        title: 'National Technology Council Presidential Election 2026',
        description: 'Vote for the visionary leader to steer innovation, artificial intelligence regulation, and digital democracy policies.',
        category: 'National Policy',
        startTime: now,
        endTime: nextWeek,
        isPublished: false,
        createdBy: admin._id,
        candidates: [
          {
            name: 'Dr. Sarah Vance',
            party: 'Cyber Progress Alliance',
            symbol: '🚀',
            manifesto: 'Promoting open source AI standards, quantum security research, and nationwide digital rights guarantees.',
            photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'
          },
          {
            name: 'Marcus Sterling',
            party: 'Digital Sovereignty Union',
            symbol: '🛡️',
            manifesto: 'Focusing on data privacy legislation, ethical computing guidelines, and decentralized grid architecture.',
            photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'
          },
          {
            name: 'Elena Rostova',
            party: 'Tech Innovation Coalition',
            symbol: '⚡',
            manifesto: 'Investing in renewable data centers, green computing initiatives, and STEM education grants.',
            photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400'
          }
        ]
      });

      console.log('✅ Demo Election Seeded Successfully!');
    }
  } catch (err) {
    console.warn('Data seeding skipped/failed:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  seedInitialData();
  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 SECURE VOTING BACKEND RUNNING ON PORT ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🔐 Tamper-Evident Ledger Engine Active (SHA-256)`);
    console.log(`==================================================\n`);
  });
});
