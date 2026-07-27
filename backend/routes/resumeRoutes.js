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
  previewTemplate,
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
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const injectAI = require('../middleware/injectAI');
const { aiLimiter, userLimiter } = require('../middleware/rateLimiter');
const { aiCache } = require('../middleware/aiCache');
const { validate, schemas } = require('../middleware/validate');

// Setup multer memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'));
    }
  }
});

// Every route below is authenticated. Mounting the per-user limiter after
// protect means it keys on req.user.id instead of the shared proxy IP.
router.use(protect, userLimiter);

router.post('/upload', aiLimiter, injectAI, upload.single('resume'), uploadResume);
router.get('/', getResume);
router.post('/improve', aiLimiter, aiCache, injectAI, improveResume);
router.post('/optimize', aiLimiter, validate(schemas.optimizeForCompany), aiCache, injectAI, optimizeForCompany);
router.post('/optimize-from-feedback', aiLimiter, validate(schemas.optimizeResumeFromFeedback), aiCache, injectAI, optimizeResumeFromFeedback);
router.post('/rewrite-section', aiLimiter, validate(schemas.rewriteSection), injectAI, rewriteSection);
router.post('/cover-letter', aiLimiter, validate(schemas.coverLetter), injectAI, generateCoverLetter);
router.post('/ats-score', aiLimiter, injectAI, getATSScore);

// LaTeX Routes
router.get('/latex', getLatexCode);
router.post('/latex', saveLatexCode);
router.post('/latex/generate', aiLimiter, injectAI, generateLatexTemplate);
router.post('/latex/preview', previewTemplate);
router.post('/latex/tailor', aiLimiter, validate(schemas.tailorLatexToJob), injectAI, tailorLatexToJob);

// Versioning Routes
router.route('/versions')
  .get(getVersions)
  .post(createVersion);

router.route('/versions/:id')
  .get(getVersionById)
  .put(updateVersion)
  .delete(deleteVersion);

module.exports = router;


