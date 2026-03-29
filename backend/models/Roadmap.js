const mongoose = require('mongoose');

const roadmapSchema = new mongoose.Schema({
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  levels: {
    beginner: [String],
    intermediate: [String],
    advanced: [String]
  }
}, { timestamps: true });

module.exports = mongoose.model('Roadmap', roadmapSchema);
