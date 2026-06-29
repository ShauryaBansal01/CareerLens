const mongoose = require('mongoose');

const userAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,   // one record per user, always overwritten on re-run
  },
  roleId:   { type: String, required: true },
  roleName: { type: String, required: true },

  // Skill gap analysis (rich objects with proficiency/priority)
  analysis: {
    matchedSkills: { type: [mongoose.Schema.Types.Mixed], default: [] },
    missingSkills: { type: [mongoose.Schema.Types.Mixed], default: [] },
    matchPercentage: Number,
    skillsWeightedScore: Number,
    totalRequired: Number,
    categories: {
      languages:  { type: [String], default: [] },
      frameworks: { type: [String], default: [] },
      tools:      { type: [String], default: [] },
      concepts:   { type: [String], default: [] },
    },
    overallReadinessVerdict: { type: String, default: '' },
  },

  // Scoring breakdown
  scoring: {
    skillsScore:          Number,
    experienceScore:      Number,
    projectsScore:        Number,
    consistencyScore:     Number,
    totalJobReadinessScore: Number,
  },

  // AI-generated roadmap (3 phases)
  roadmap: {
    beginner:     { type: mongoose.Schema.Types.Mixed, default: [] },
    intermediate: { type: mongoose.Schema.Types.Mixed, default: [] },
    advanced:     { type: mongoose.Schema.Types.Mixed, default: [] },
  },
}, { timestamps: true });

module.exports = mongoose.model('UserAnalysis', userAnalysisSchema);
