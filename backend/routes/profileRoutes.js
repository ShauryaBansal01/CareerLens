const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validate');

router.get('/', protect, getProfile);
router.put('/', protect, validate(schemas.profileUpdate), updateProfile);

module.exports = router;
