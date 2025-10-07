import { Request, Response } from 'express';
import { getKnex } from '../db/knex';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../services/tokenService';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const db = getKnex();
  const user = await db('users').where({ username }).first();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const accessToken = signAccessToken({ id: user.id, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id, role: user.role });
  return res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, role: user.role } });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body || {};
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken required' });
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return res.status(401).json({ error: 'Invalid refresh token' });
  const accessToken = signAccessToken(payload);
  return res.json({ accessToken });
}
