import { Request, Response } from 'express';
import { getKnex } from '../db/knex';

export async function listCostCenters(_req: Request, res: Response) {
  const db = getKnex();
  const rows = await db('cost_centers').select('*');
  res.json(rows);
}

export async function metaDropdowns(_req: Request, res: Response) {
  const plants = ['PI-1','PI-2','PI-3','PI-4','SPD'];
  const purposes = ['Testing','Build','Test','Return'];
  const types = ['UPL','CO'];

  const db = getKnex();
  const pmList = await db('users').select('id','name').where({ role: 'pm' });
  const hodList = await db('users').select('id','name').where({ role: 'hod' });

  res.json({ plants, purposes, types, pmList, hodList });
}
