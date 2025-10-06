const jwt = require('jsonwebtoken');
const env = require('../config/env');

function issueTokens(user) {
  const payload = { sub: user.id, role: user.role, name: user.name };
  const accessToken = jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });
  const refreshToken = jwt.sign({ sub: user.id }, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });
  return { accessToken, refreshToken };
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.jwt.refreshSecret);
}

module.exports = { issueTokens, verifyRefreshToken };
