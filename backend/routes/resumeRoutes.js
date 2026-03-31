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
  deleteVersion
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');

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

router.post('/upload', protect, upload.single('resume'), uploadResume);
router.get('/', protect, getResume);
router.post('/improve', protect, improveResume);
router.post('/optimize', protect, optimizeForCompany);

// LaTeX Routes
router.get('/latex', protect, getLatexCode);
router.post('/latex', protect, saveLatexCode);
router.post('/latex/generate', protect, generateLatexTemplate);
router.post('/latex/tailor', protect, tailorLatexToJob);

// Versioning Routes
router.route('/versions')
  .get(protect, getVersions)
  .post(protect, createVersion);

router.route('/versions/:id')
  .get(protect, getVersionById)
  .put(protect, updateVersion)
  .delete(protect, deleteVersion);

module.exports = router;


