const mongoose = require('mongoose');
const crypto = require('crypto');

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  tokenHash: {
    type: String,
    required: true,
  },
  family: {
    type: String,
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  revoked: {
    type: Boolean,
    default: false,
  },
  replacedBy: {
    type: String,
    default: null,
  },
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ family: 1, user: 1 });

refreshTokenSchema.statics.hashToken = function (token) {
  return crypto.createHash('sha256').update(token).digest('hex');
};

refreshTokenSchema.statics.generateFamily = function () {
  return crypto.randomBytes(16).toString('hex');
};

refreshTokenSchema.statics.generateToken = function () {
  return crypto.randomBytes(48).toString('hex');
};

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
