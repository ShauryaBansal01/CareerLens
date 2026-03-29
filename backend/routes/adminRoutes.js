const express = require('express');
const router = express.Router();
const { getAdminStats, addRole, deleteRole, addProject, deleteProject } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect);
router.use(admin); // All routes below require Admin privileges

router.get('/stats', getAdminStats);
router.post('/role', addRole);
router.delete('/role/:id', deleteRole);
router.post('/project', addProject);
router.delete('/project/:id', deleteProject);

module.exports = router;
