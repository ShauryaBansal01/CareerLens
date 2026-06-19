const express = require('express');
const router = express.Router();
const { generateRoadmap, seedRoadmaps } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');

router.post('/generate', protect, injectAI, generateRoadmap);
router.post('/seed', seedRoadmaps);

module.exports = router;
