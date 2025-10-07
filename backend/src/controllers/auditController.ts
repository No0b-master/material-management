import { Request, Response } from 'express';
import { getKnex } from '../db/knex';

export async function auditTrail(req: Request, res: Response) {
  const requestId = Number(req.params.requestId);
  const db = getKnex();
  const rows = await db('audit_logs').where({ request_id: requestId }).orderBy('timestamp','asc');
  res.json(rows);
}
