const express = require('express');
const { getAPIKeys, saveAPIKey, deleteAPIKey } = require('../controllers/apiKeyController');
const { protect } = require('../middleware/authMiddleware'); // assuming standard protect middleware exists
const { auditLogger } = require('../middleware/auditLogger');

const router = express.Router();

router.use(protect);
router.use(auditLogger('api-key'));

router.route('/')
  .get(getAPIKeys)
  .post(saveAPIKey);

router.route('/:id')
  .delete(deleteAPIKey);

module.exports = router;
