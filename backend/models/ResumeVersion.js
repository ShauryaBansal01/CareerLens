const mongoose = require('mongoose');

const resumeVersionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    default: 'Untitled Version'
  },
  targetCompany: {
    type: String,
    default: ''
  },
  targetJobDescription: {
    type: String,
    default: ''
  },
  rawLatexCode: {
    type: String,
    default: ''
  },
  isBaseResume: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['upload', 'ai-wizard', 'ai-optimized', 'ai-tailored', 'ai-section-edit', 'manual-edit'],
    default: 'manual-edit'
  }
}, { timestamps: true });

// Compound rather than a plain `user` index: the version list filters on user
// and sorts by updatedAt descending. With both fields in the index Mongo walks
// it in order and returns rows already sorted; with only `user` it would fetch
// every match and sort them in memory, which is also capped at 32MB.
resumeVersionSchema.index({ user: 1, updatedAt: -1 });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
