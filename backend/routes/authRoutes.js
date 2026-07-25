const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, sendOtp, forgotPassword, resetPassword, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');
const { auditLogger } = require('../middleware/auditLogger');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/send-otp', otpLimiter, validate(schemas.sendOtp), sendOtp);
router.post('/register', authLimiter, validate(schemas.register), auditLogger('register'), registerUser);
router.post('/login', authLimiter, validate(schemas.login), loginUser);
router.post('/forgot-password', otpLimiter, validate(schemas.sendOtp), forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), auditLogger('reset-password'), resetPassword);
router.post('/refresh-token', authLimiter, validate(schemas.refreshToken), refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
