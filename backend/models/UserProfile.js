const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  duration: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

const educationSchema = new mongoose.Schema({
  institution: { type: String, default: '' },
  degree: { type: String, default: '' },
  duration: { type: String, default: '' }
}, { _id: false });

const projectSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  description: { type: String, default: '' },
  techStack: [{ type: String }]
}, { _id: false });

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true
  },
  basics: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    summary: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' }
  },
  skills: [{ type: String }],
  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema]
}, { timestamps: true });

module.exports = mongoose.model('UserProfile', userProfileSchema);
