const mongoose = require('mongoose');

const aiUsageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'anthropic'],
    required: true
  },
  feature: {
    type: String,
    enum: ['resume_parsing', 'latex_generation', 'roadmap_generation', 'project_generation', 'skill_analysis', 'cover_letter'],
    required: true
  },
  promptTokens: {
    type: Number,
    default: 0
  },
  completionTokens: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  estimatedCostUSD: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Index for querying usage per user quickly
aiUsageSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AIUsage', aiUsageSchema);
