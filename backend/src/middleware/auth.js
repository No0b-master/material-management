const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Invalid Authorization header' });
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret);
    req.user = { id: payload.sub, role: payload.role, name: payload.name };
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function authorize(roles) {
  return (req, res, next) => {
    if (!roles || roles.length === 0) return next();
    if (!req.user) return res.status(401).json({ message: 'Unauthenticated' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  };
}

module.exports = { authenticate, authorize };
