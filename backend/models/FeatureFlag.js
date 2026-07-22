const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  userIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  description: String,
}, { timestamps: true });

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
