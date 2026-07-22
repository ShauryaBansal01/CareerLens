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

function sanitizeBody(body) {
  if (!body) return {};
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.key;
  delete sanitized.apiKey;
  delete sanitized.secret;
  return sanitized;
}

module.exports = { auditLogger };
