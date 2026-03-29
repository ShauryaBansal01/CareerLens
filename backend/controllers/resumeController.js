const Resume = require('../models/Resume');
const pdfParse = require('pdf-parse');

// Predefined lists of skills to look for in the text
const PREDEFINED_SKILLS = [
  'javascript', 'python', 'java', 'c++', 'react', 'node.js', 'express', 
  'mongodb', 'sql', 'html', 'css', 'aws', 'docker', 'machine learning', 
  'data structures', 'algorithms', 'git', 'typescript', 'tailwind'
];

// @desc    Upload & Parse Resume
// @route   POST /api/resume/upload
// @access  Private
exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse PDF buffer
    const data = await pdfParse(req.file.buffer);
    const rawText = data.text;
    const lowerText = rawText.toLowerCase();

    // Very basic extraction logic
    const extractedSkills = PREDEFINED_SKILLS.filter(skill => 
      lowerText.includes(skill)
    );

    // Dummy extraction for education and experience (can be improved)
    // Here we just indicate some extracted text context or dummy data for now
    const education = lowerText.includes('bachelor') ? 'Bachelor Degree found' : 'Not explicitly found';
    const experience = lowerText.includes('experience') ? 'Experience section found' : 'Not explicitly found';

    // Save or update to DB
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (resume) {
      resume.extractedSkills = extractedSkills;
      resume.education = education;
      resume.experience = experience;
      resume.rawText = rawText;
      resume = await resume.save();
    } else {
      resume = await Resume.create({
        user: req.user.id,
        extractedSkills,
        education,
        experience,
        rawText
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing resume' });
  }
};

// @desc    Get user resume data
// @route   GET /api/resume/
// @access  Private
exports.getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
