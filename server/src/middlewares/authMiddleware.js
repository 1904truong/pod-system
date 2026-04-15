const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  let token = null;

  if (typeof authHeader === 'string' && authHeader.trim()) {
    token = authHeader.trim();
    // Support both "Bearer <token>" and raw token
    while (/^Bearer\s+/i.test(token)) token = token.replace(/^Bearer\s+/i, '');
  }

  if (token === 'null' || token === 'undefined') token = null;

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pod_system_super_secret_key_change_me_in_production');
    req.user = decoded.user;
    next();
  } catch {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
