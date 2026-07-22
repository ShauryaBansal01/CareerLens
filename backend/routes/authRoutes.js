const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, sendOtp, forgotPassword, resetPassword, refreshToken, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');
const { auditLogger } = require('../middleware/auditLogger');

router.post('/send-otp', validate(schemas.sendOtp), sendOtp);
router.post('/register', validate(schemas.register), auditLogger('register'), registerUser);
router.post('/login', validate(schemas.login), loginUser);
router.post('/forgot-password', validate(schemas.sendOtp), forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), auditLogger('reset-password'), resetPassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
