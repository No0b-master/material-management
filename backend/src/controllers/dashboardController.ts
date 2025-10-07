import { Request, Response } from 'express';
import { getKnex } from '../db/knex';

export async function userDashboard(req: Request, res: Response) {
  const userId = Number(req.params.id);
  const db = getKnex();
  const rows = await db('requests').where({ created_by: userId }).orderBy('request_date', 'desc');
  res.json(rows);
}

export async function approverDashboard(req: Request, res: Response) {
  const approverId = Number(req.params.id);
  // For simplicity, show pending requests; in real life we would match queues by role and mapping
  const db = getKnex();
  const rows = await db('requests').where({ status: 'Pending' }).orderBy('request_date', 'desc');
  res.json(rows);
}
