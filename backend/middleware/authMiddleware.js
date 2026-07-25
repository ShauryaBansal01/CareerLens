const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = header.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select('-password');

    // Guard: user was deleted or token references a non-existent account
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    return next();
  } catch (error) {
    // Expected for expired/tampered tokens — log at debug level, not as an error.
    console.warn('[auth] token verification failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// 403, not 401: the caller *is* authenticated, they just lack permission.
// Returning 401 here makes the frontend interceptor attempt a pointless
// token refresh on what is really an authorization failure.
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Not authorized as an admin' });
};

module.exports = { protect, admin };
