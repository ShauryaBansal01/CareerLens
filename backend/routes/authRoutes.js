const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, sendOtp, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');

router.post('/send-otp', validate(schemas.sendOtp), sendOtp);
router.post('/register', validate(schemas.register), registerUser);
router.post('/login', validate(schemas.login), loginUser);
router.post('/forgot-password', validate(schemas.sendOtp), forgotPassword);
router.post('/reset-password', validate(schemas.resetPassword), resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
