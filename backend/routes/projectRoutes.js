const express = require('express');
const router = express.Router();
const { recommendProjects, seedProjects } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, recommendProjects);
router.post('/seed', seedProjects);

module.exports = router;
