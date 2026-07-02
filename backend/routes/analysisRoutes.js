const express = require('express');
const router = express.Router();
const { analyzeSkills, getRoles, seedRoles } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/analyze', protect, aiLimiter, injectAI, analyzeSkills);
router.get('/roles', getRoles);
router.post('/seed', seedRoles); // for adding dummy roles easily

module.exports = router;
