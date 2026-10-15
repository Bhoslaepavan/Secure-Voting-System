const rateLimit = require('express-rate-limit');

// Rate limiting to defend against OTP brute forcing & login spamming
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 requests per window
  message: { message: 'Too many OTP requests from this IP. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Max 20 authentication attempts
  message: { message: 'Too many authentication attempts. Please try again later.' }
});

module.exports = { otpRateLimiter, authRateLimiter };
