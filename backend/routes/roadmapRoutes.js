const express = require('express');
const router = express.Router();
const { generateRoadmap, seedRoadmaps } = require('../controllers/roadmapController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateRoadmap);
router.post('/seed', seedRoadmaps);

module.exports = router;
