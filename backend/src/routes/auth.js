const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const knex = require('../config/db');
const { issueTokens, verifyRefreshToken } = require('../services/jwtService');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();

router.post('/login',
  [body('username').isString().notEmpty(), body('password').isString().notEmpty()],
  handleValidation,
  async (req, res) => {
    const { username, password } = req.body;
    const user = await knex('users').where({ username }).first();
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const tokens = issueTokens(user);
    res.json({ user: { id: user.id, role: user.role, name: user.name }, ...tokens });
  }
);

router.post('/refresh', [body('refreshToken').isString().notEmpty()], handleValidation, async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await knex('users').where({ id: payload.sub }).first();
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    const tokens = issueTokens(user);
    res.json(tokens);
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
