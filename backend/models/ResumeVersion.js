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
  }
}, { timestamps: true });

module.exports = mongoose.model('ResumeVersion', resumeVersionSchema);
