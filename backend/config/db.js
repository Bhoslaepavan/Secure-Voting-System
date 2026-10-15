const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/secure_voting_db';
    console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:[^:@]+@/, ':****@')}`);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('✅ Connected to MongoDB Instance Successfully');
  } catch (err) {
    console.warn('⚠️  Could not connect to MongoDB service on localhost:27017.');
    console.log('💡 TIP: Please ensure MongoDB Community Server is started, or set MONGO_URI in backend/.env');
  }
};

module.exports = connectDB;