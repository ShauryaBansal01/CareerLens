const express = require('express');
const router = express.Router();
const { generateRoadmap, seedRoadmaps } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/generate', protect, aiLimiter, injectAI, generateRoadmap);
router.post('/seed', seedRoadmaps);

module.exports = router;
