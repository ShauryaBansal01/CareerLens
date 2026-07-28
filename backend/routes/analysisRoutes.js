const express = require('express');
const router = express.Router();
const { analyzeSkills, getLatestAnalysis, getAnalysisHistory, getRoles, seedRoles } = require('../controllers/analysisController');
const { protect, admin } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter, userLimiter } = require('../middleware/rateLimiter');

router.post('/analyze', protect, aiLimiter, injectAI, analyzeSkills);
// The free reads. These are what keep `/analyze` — the billed AI call above —
// strictly user-initiated instead of firing on every page load.
router.get('/latest', protect, userLimiter, getLatestAnalysis);
router.get('/history', protect, userLimiter, getAnalysisHistory);
router.get('/roles', getRoles);
router.post('/seed', protect, admin, seedRoles);

module.exports = router;
