const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Voter = require('../models/Voter');
const { generateOTP, sendOTPEmail } = require('../utils/otp');

// REGISTER VOTER
exports.register = async (req, res) => {
  try {
    const { name, email, phone, voterId, password, role } = req.body;

    if (!name || !email || !phone || !voterId || !password) {
      return res.status(400).json({ message: 'All fields (name, email, phone, voterId, password) are required.' });
    }

    const existingEmail = await Voter.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Voter with this email already exists.' });
    }

    const existingVoterId = await Voter.findOne({ voterId });
    if (existingVoterId) {
      return res.status(400).json({ message: 'Voter ID is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const newVoter = await Voter.create({
      name,
      email,
      phone,
      voterId,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'voter',
      isVerified: false,
      otp,
      otpExpiry
    });

    await sendOTPEmail(email, otp, 'Registration Account Verification');

    res.status(201).json({
      message: 'Registration initiated! Please enter the OTP sent to your email to verify your account.',
      email: newVoter.email,
      // For effortless dev/testing demonstration, return devOtp
      devOtp: otp
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed due to server error.' });
  }
};

// VERIFY REGISTRATION OTP
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(404).json({ message: 'Voter account not found.' });
    }

    if (voter.isVerified) {
      return res.status(400).json({ message: 'Account is already verified. Please proceed to login.' });
    }

    if (voter.otp !== otp || !voter.otpExpiry || new Date() > voter.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired OTP code.' });
    }

    voter.isVerified = true;
    voter.otp = null;
    voter.otpExpiry = null;
    await voter.save();

    res.json({ message: 'Account verified successfully! You can now log in.' });
  } catch (err) {
    res.status(500).json({ message: 'OTP verification failed.' });
  }
};

// INITIATE LOGIN (STEP 1: PASSWORD CHECK -> GENERATE 2FA OTP)
exports.loginStep1 = async (req, res) => {
  try {
    const { email, password } = req.body;

    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(401).json({ message: 'Invalid email or password credentials.' });
    }

    const isMatch = await bcrypt.compare(password, voter.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password credentials.' });
    }

    if (!voter.isVerified) {
      // Re-send verification OTP
      const otp = generateOTP();
      voter.otp = otp;
      voter.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await voter.save();
      await sendOTPEmail(email, otp, 'Account Verification');

      return res.status(403).json({
        message: 'Account not verified. A new verification OTP has been generated.',
        requiresVerification: true,
        email: voter.email,
        devOtp: otp
      });
    }

    // Generate 2FA Login OTP
    const otp = generateOTP();
    voter.otp = otp;
    voter.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await voter.save();

    await sendOTPEmail(email, otp, '2FA Login Security');

    res.json({
      message: '2FA Passcode generated! Please enter the 6-digit OTP code to complete login.',
      requires2FA: true,
      email: voter.email,
      devOtp: otp
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed due to server error.' });
  }
};

// COMPLETE LOGIN (STEP 2: VERIFY 2FA OTP -> ISSUE JWT)
exports.loginStep2Verify2FA = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    if (voter.otp !== otp || !voter.otpExpiry || new Date() > voter.otpExpiry) {
      return res.status(400).json({ message: 'Invalid or expired 2FA OTP code.' });
    }

    // Clear OTP
    voter.otp = null;
    voter.otpExpiry = null;
    await voter.save();

    // Issue JWT Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_super_secret_jwt_key_2026';
    const token = jwt.sign(
      { id: voter._id, email: voter.email, role: voter.role, name: voter.name, voterId: voter.voterId },
      jwtSecret,
      { expiresIn: '30m' }
    );

    res.json({
      message: 'Authentication successful!',
      token,
      voter: {
        id: voter._id,
        name: voter.name,
        email: voter.email,
        voterId: voter.voterId,
        role: voter.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: '2FA authentication failed.' });
  }
};

// RESEND OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'Verification' } = req.body;
    const voter = await Voter.findOne({ email });
    if (!voter) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    const otp = generateOTP();
    voter.otp = otp;
    voter.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await voter.save();

    await sendOTPEmail(email, otp, purpose);

    res.json({
      message: 'New OTP dispatched successfully.',
      devOtp: otp
    });
  } catch (err) {
    res.status(500).json({ message: 'Resending OTP failed.' });
  }
};

// GET CURRENT USER PROFILE & VOTING MAP STATUS
exports.getProfile = async (req, res) => {
  try {
    const voter = await Voter.findById(req.voter.id).select('-passwordHash -otp');
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    res.json(voter);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};
