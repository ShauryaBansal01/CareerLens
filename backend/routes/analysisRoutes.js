const express = require('express');
const router = express.Router();
const { analyzeSkills, getLatestAnalysis, getRoles, seedRoles } = require('../controllers/analysisController');
const { protect, admin } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter, userLimiter } = require('../middleware/rateLimiter');

router.post('/analyze', protect, aiLimiter, injectAI, analyzeSkills);
// Was implemented but never routed — lets the dashboard reload a persisted
// analysis instead of paying for a re-run.
router.get('/latest', protect, userLimiter, getLatestAnalysis);
router.get('/roles', getRoles);
router.post('/seed', protect, admin, seedRoles);

module.exports = router;
