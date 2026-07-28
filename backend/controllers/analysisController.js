const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const Role = require('../models/Role');
const UserAnalysis = require('../models/UserAnalysis');
const analysisService = require('../services/analysisService');
const { seedRoles: upsertRoleCatalogue } = require('../services/roleSeedService');

// @desc    Analyze user resume against a specific role
// @route   POST /api/analysis/analyze
// @access  Private
exports.analyzeSkills = async (req, res) => {
  try {
    const { roleId } = req.body;

    // Without this, a malformed id throws a CastError and surfaces as a 500.
    if (!mongoose.Types.ObjectId.isValid(roleId)) {
      return res.status(400).json({ message: 'A valid roleId is required.' });
    }

    const resume = await Resume.findOne({ user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found. Please upload a resume first.' });
    }

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Target role not found.' });
    }

    const analysis = await analysisService.calculateSkillGapAI(req.ai, resume.extractedSkills || [], role.requiredSkills || []);

    const experienceScore = resume.experience && resume.experience !== 'Not explicitly found' ? 20 : 5;
    const projectsScore = 0;
    const consistencyScore = 5;
    const totalJobReadinessScore = analysis.skillsWeightedScore + experienceScore + projectsScore + consistencyScore;

    const scoring = { skillsScore: analysis.skillsWeightedScore, experienceScore, projectsScore, consistencyScore, totalJobReadinessScore };

    // â”€â”€ Persist so the page can reload without paying for a re-run â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // Keyed on (user, roleId): analysing a second role adds a record rather
    // than overwriting the first, so switching back to a role you've already
    // run is a free read instead of another billed AI call.
    await UserAnalysis.findOneAndUpdate(
      { user: req.user.id, roleId: roleId.toString() },
      // `roadmap` resets on purpose: it is derived from the missing skills of
      // a specific run, so a fresh analysis invalidates it.
      { user: req.user.id, roleId: roleId.toString(), roleName: role.roleName, analysis, scoring, roadmap: {} },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(200).json({ role: role.roleName, roleId: roleId.toString(), analysis, scoring });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a persisted analysis for the logged-in user. With `?roleId=`,
//          returns that role's analysis; otherwise the most recent one.
//          This is the free read that keeps `/analyze` from being re-billed.
// @route   GET /api/analysis/latest
// @access  Private
exports.getLatestAnalysis = async (req, res) => {
  try {
    const { roleId } = req.query;
    const filter = { user: req.user.id };

    if (roleId) {
      if (!mongoose.Types.ObjectId.isValid(roleId)) {
        return res.status(400).json({ message: 'A valid roleId is required.' });
      }
      filter.roleId = roleId.toString();
    }

    // A user can hold one analysis per role now, so "latest" needs an explicit
    // sort rather than whatever findOne happens to return first.
    const result = await UserAnalysis.findOne(filter).sort({ updatedAt: -1 });
    if (!result) return res.status(404).json({ message: 'No analysis found' });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List the roles this user has already analysed, newest first.
//          Lets the UI show which roles are cached before spending an AI call.
// @route   GET /api/analysis/history
// @access  Private
exports.getAnalysisHistory = async (req, res) => {
  try {
    const records = await UserAnalysis.find({ user: req.user.id })
      .select('roleId roleName scoring.totalJobReadinessScore analysis.matchPercentage updatedAt')
      .sort({ updatedAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all available roles
// @route   GET /api/analysis/roles
// @access  Public
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({}).sort({ roleName: 1 });
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed / refresh the target-role catalogue. Idempotent — safe to
//          re-run on every deploy. See services/roleSeedService.js.
// @route   POST /api/analysis/seed
// @access  Admin only
exports.seedRoles = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production' && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Not authorized in production' });
    }
    const summary = await upsertRoleCatalogue();
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
