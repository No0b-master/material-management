import { Request, Response } from 'express';
import { getKnex } from '../db/knex';
import bcrypt from 'bcryptjs';
import { Role } from '../middleware/auth';

export async function listUsers(_req: Request, res: Response) {
  const db = getKnex();
  const users = await db('users').select('id','username','name','email','contact_no','employee_code','role','department','cost_center','created_at','updated_at');
  res.json(users);
}

export async function getUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getKnex();
  const user = await db('users').select('id','username','name','email','contact_no','employee_code','role','department','cost_center','created_at','updated_at').where({ id }).first();
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
}

export async function createUser(req: Request, res: Response) {
  const { username, password, name, email, role, contact_no, employee_code, department, cost_center } = req.body || {};
  if (!username || !password || !name || !email || !role) return res.status(400).json({ error: 'Missing required fields' });
  const db = getKnex();
  const exists = await db('users').where({ username }).first();
  if (exists) return res.status(409).json({ error: 'Username already exists' });
  const hash = await bcrypt.hash(password, 10);
  const [id] = await db('users').insert({ username, password: hash, name, email, role, contact_no, employee_code, department, cost_center });
  const user = await db('users').select('id','username','name','email','role').where({ id }).first();
  res.status(201).json(user);
}

export async function updateUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getKnex();
  const current = await db('users').where({ id }).first();
  if (!current) return res.status(404).json({ error: 'Not found' });
  const userRole: Role = (req.user as any).role;
  const isSelf = req.user && req.user.id === id;
  const allowedSelfFields = ['name','email','contact_no','employee_code','password'];
  const allowedAdminFields = ['name','email','contact_no','employee_code','department','cost_center','role','password'];
  const body = req.body || {};
  const update: any = {};
  const props = userRole === 'admin' ? allowedAdminFields : allowedSelfFields;
  for (const key of props) {
    if (body[key] !== undefined) update[key] = body[key];
  }
  if (!isSelf && userRole !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }
  await db('users').where({ id }).update(update);
  const user = await db('users').select('id','username','name','email','contact_no','employee_code','role','department','cost_center').where({ id }).first();
  res.json(user);
}

export async function deleteUser(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getKnex();
  await db('users').where({ id }).del();
  res.status(204).send();
}
