const express = require('express');
const router = express.Router();
const { analyzeSkills, getRoles, seedRoles } = require('../controllers/analysisController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');

router.post('/analyze', protect, injectAI, analyzeSkills);
router.get('/roles', getRoles);
router.post('/seed', seedRoles); // for adding dummy roles easily

module.exports = router;
