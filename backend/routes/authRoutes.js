const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { otpRateLimiter, authRateLimiter } = require('../middleware/rateLimiter');

router.post('/register', authRateLimiter, authController.register);
router.post('/verify-registration-otp', otpRateLimiter, authController.verifyRegistrationOtp);

router.post('/login/step1', authRateLimiter, authController.loginStep1);
router.post('/login/step2', otpRateLimiter, authController.loginStep2Verify2FA);
router.post('/resend-otp', otpRateLimiter, authController.resendOtp);

router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;
