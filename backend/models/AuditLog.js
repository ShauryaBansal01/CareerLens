const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  action: {
    type: String,
    required: true,
  },
  resource: {
    type: String,
    required: true,
  },
  method: {
    type: String,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ip: String,
  userAgent: String,
  statusCode: Number,
}, {
  timestamps: true,
});

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
