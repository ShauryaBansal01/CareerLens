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
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
