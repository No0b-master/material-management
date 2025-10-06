const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { jwt: jwtCfg } = require('../config/env');

const router = express.Router();

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const { username, password } = value;
  const user = await req.knex('users').where({ username }).first();
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const accessToken = jwt.sign({ id: user.id, role: user.role }, jwtCfg.secret, { expiresIn: jwtCfg.accessExpiresIn });
  const refreshToken = jwt.sign({ id: user.id, role: user.role }, jwtCfg.refreshSecret, { expiresIn: jwtCfg.refreshExpiresIn });
  res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } });
});

const refreshSchema = Joi.object({ refreshToken: Joi.string().required() });
router.post('/refresh', async (req, res) => {
  const { error, value } = refreshSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  try {
    const payload = jwt.verify(value.refreshToken, jwtCfg.refreshSecret);
    const accessToken = jwt.sign({ id: payload.id, role: payload.role }, jwtCfg.secret, { expiresIn: jwtCfg.accessExpiresIn });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

module.exports = router;
