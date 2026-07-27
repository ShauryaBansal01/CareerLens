const AuditLog = require('../models/AuditLog');

function auditLogger(action) {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        AuditLog.create({
          user: req.user?._id || req.user?.id,
          action,
          resource: req.originalUrl,
          method: req.method,
          details: {
            body: sanitizeBody(req.body),
            params: req.params,
            query: req.query,
          },
          ip: req.ip || req.connection?.remoteAddress,
          userAgent: req.headers['user-agent'],
          statusCode: res.statusCode,
        }).catch((err) => console.error('Audit log error:', err.message));
      }

      return originalJson(data);
    };

    next();
  };
}

const REDACTED_FIELDS = [
  'password',
  'newPassword',
  'confirmPassword',
  'token',
  'refreshToken',
  'key',
  'apiKey',
  'secret',
  // OTPs are short-lived credentials — the audit log is exactly the place a
  // reset code must not end up.
  'otp',
];

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  for (const field of REDACTED_FIELDS) {
    delete sanitized[field];
  }
  return sanitized;
}

module.exports = { auditLogger };
