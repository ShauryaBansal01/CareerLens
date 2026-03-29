const express = require('express');
const router = express.Router();
const { analyzeSkills, getRoles, seedRoles } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');

router.post('/analyze', protect, analyzeSkills);
router.get('/roles', getRoles);
router.post('/seed', seedRoles); // for adding dummy roles easily

module.exports = router;
