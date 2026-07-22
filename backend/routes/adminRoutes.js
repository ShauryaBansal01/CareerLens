const express = require('express');
const router = express.Router();
const { getAdminStats, addRole, deleteRole, addProject, deleteProject, getFeatureFlags, getFeatureFlag, updateFeatureFlag } = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');
const { auditLogger } = require('../middleware/auditLogger');

router.use(protect);
router.use(admin); // All routes below require Admin privileges
router.use(auditLogger('admin'));

router.get('/stats', getAdminStats);
router.post('/role', addRole);
router.delete('/role/:id', deleteRole);
router.post('/project', addProject);
router.delete('/project/:id', deleteProject);

// Feature flags (read requires auth, write requires admin)
router.get('/feature-flags', getFeatureFlags);
router.get('/feature-flags/:name', getFeatureFlag);
router.put('/feature-flags/:name', admin, updateFeatureFlag);

module.exports = router;
