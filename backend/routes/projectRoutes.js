const express = require('express');
const router = express.Router();
const { recommendProjects, seedProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');

router.post('/recommend', protect, injectAI, recommendProjects);
router.post('/seed', seedProjects);

module.exports = router;
