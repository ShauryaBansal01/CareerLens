const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');
const { userLimiter } = require('../middleware/rateLimiter');

// Mounted after protect so the limiter keys on the user, not the shared IP.
router.use(protect, userLimiter);

router.get('/', getProfile);
router.put('/', validate(schemas.profileUpdate), updateProfile);

module.exports = router;
