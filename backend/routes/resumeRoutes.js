const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadResume,
  getResume,
  improveResume,
  optimizeForCompany,
  getLatexCode,
  saveLatexCode,
  generateLatexTemplate,
  tailorLatexToJob,
  getVersions,
  getVersionById,
  createVersion,
  updateVersion,
  deleteVersion,
  generateCoverLetter,
  optimizeResumeFromFeedback,
  rewriteSection,
  getATSScore,
  getTemplates
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter } = require('../middleware/rateLimiter');
const { aiCache } = require('../middleware/aiCache');

// Setup multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  }
});

router.post('/upload', protect, aiLimiter, injectAI, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);
router.post('/improve', protect, aiLimiter, aiCache, injectAI, improveResume);
router.post('/optimize', protect, aiLimiter, aiCache, injectAI, optimizeForCompany);
router.post('/optimize-from-feedback', protect, aiLimiter, aiCache, injectAI, optimizeResumeFromFeedback);
router.post('/rewrite-section', protect, aiLimiter, injectAI, rewriteSection);
router.post('/cover-letter', protect, aiLimiter, injectAI, generateCoverLetter);
router.post('/ats-score', protect, aiLimiter, injectAI, getATSScore);
router.get('/templates', protect, getTemplates);

// LaTeX Routes
router.get('/latex', protect, getLatexCode);
router.post('/latex', protect, saveLatexCode);
router.post('/latex/generate', protect, aiLimiter, injectAI, generateLatexTemplate);
router.post('/latex/tailor', protect, aiLimiter, injectAI, tailorLatexToJob);

// Versioning Routes
router.route('/versions')
  .get(protect, getVersions)
  .post(protect, createVersion);

router.route('/versions/:id')
  .get(protect, getVersionById)
  .put(protect, updateVersion)
  .delete(protect, deleteVersion);

module.exports = router;


