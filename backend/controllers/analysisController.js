const Resume = require('../models/Resume');
const Role = require('../models/Role');
const analysisService = require('../services/analysisService');

// @desc    Analyze user resume against a specific role
// @route   POST /api/analysis/analyze
// @access  Private
exports.analyzeSkills = async (req, res) => {
  try {
    const { roleId } = req.body;

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Target role not found.' });
    }

    const analysis = analysisService.calculateSkillGap(resume.extractedSkills || [], role.requiredSkills || []);

    // Full Job Readiness Score computation
    // Skills (50%) + Projects (20%) + Experience (20%) + Consistency (10%)
    // Mocking the non-skill parts for now as per instructions (will integrate Projects later)
    const experienceScore = resume.experience && resume.experience !== 'Not explicitly found' ? 20 : 5; 
    const projectsScore = 0; // To be implemented in Step 5
    const consistencyScore = 5; // Dummy value

    const totalJobReadinessScore = analysis.skillsWeightedScore + experienceScore + projectsScore + consistencyScore;

    res.status(200).json({
      role: role.roleName,
      analysis,
      scoring: {
        skillsScore: analysis.skillsWeightedScore,
        experienceScore,
        projectsScore,
        consistencyScore,
        totalJobReadinessScore
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available roles
// @route   GET /api/analysis/roles
// @access  Public
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed dummy roles (for testing)
// @route   POST /api/analysis/seed
// @access  Public
exports.seedRoles = async (req, res) => {
  try {
    await Role.deleteMany();
    const roles = await Role.insertMany([
      { roleName: 'Frontend Developer', requiredSkills: ['javascript', 'react', 'html', 'css', 'tailwind'] },
      { roleName: 'Backend Developer', requiredSkills: ['node.js', 'express', 'mongodb', 'javascript', 'sql'] },
      { roleName: 'Full Stack Developer', requiredSkills: ['javascript', 'react', 'node.js', 'express', 'mongodb', 'tailwind'] },
      { roleName: 'Data Scientist', requiredSkills: ['python', 'machine learning', 'sql', 'algorithms'] }
    ]);
    res.status(201).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
