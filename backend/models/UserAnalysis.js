const mongoose = require('mongoose');

const userAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

// One analysis per (user, role) rather than per user. `user` alone used to be
// unique, which meant analysing a second role silently destroyed the first and
// forced a billed re-run to get it back.
//
// NOTE: if a deployment already has UserAnalysis documents, the old single-field
// unique index on `user` must be dropped for this to take effect —
// `db.useranalyses.dropIndex('user_1')`. Mongoose creates new indexes but never
// removes ones it no longer declares.
userAnalysisSchema.index({ user: 1, roleId: 1 }, { unique: true });

module.exports = mongoose.model('UserAnalysis', userAnalysisSchema);
