const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  extractedSkills: [{
    type: String
  }],
  education: {
    type: String
  },
  experience: {
    type: String
  },
  rawText: {
    type: String
  },
  rawLatexCode: {
    type: String,
    default: ""
  },

  // Layout facts about the *uploaded* PDF, populated only when pdf-service is
  // configured. pdf-parse cannot produce these — it returns a flat string with
  // no glyph geometry — so they stay null on the fallback path.
  sourceLayout: {
    pageCount:   { type: Number, default: null },
    columnCount: { type: Number, default: null },
    hasImages:   { type: Boolean, default: false },
    warnings:    { type: [String], default: [] },
    extractedBy: { type: String, default: null },
  },
}, { timestamps: true });

// `Resume.findOne({ user })` is the single hottest query in the app — it runs on
// essentially every authenticated page load and from twelve call sites. Without
// this index that is a full collection scan, so read latency grows linearly with
// total users rather than staying flat.
resumeSchema.index({ user: 1 });

module.exports = mongoose.model('Resume', resumeSchema);
