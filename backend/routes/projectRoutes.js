const express = require('express');
const router = express.Router();
const { recommendProjects, seedProjects } = require('../controllers/projectController');
const { protect, admin } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter } = require('../middleware/rateLimiter');

router.post('/recommend', protect, aiLimiter, injectAI, recommendProjects);
router.post('/seed', protect, admin, seedProjects);

module.exports = router;
