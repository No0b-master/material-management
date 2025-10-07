import { Request, Response } from 'express';
import { getKnex } from '../db/knex';
import { buildDetailedReport, buildSummaryReport } from '../services/reportService';

export async function detailedReport(req: Request, res: Response) {
  const { start, end, dept, status, approver } = req.query as any;
  const db = getKnex();
  let q = db('requests').select('*');

  if (start) q = q.where('request_date', '>=', start);
  if (end) q = q.where('request_date', '<=', end);
  if (dept) q = q.where('dept', dept);
  if (status) q = q.where('status', status);

  const rows = await q.orderBy('request_date', 'desc');
  const wb = await buildDetailedReport(rows);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="detailed.xlsx"');
  await wb.xlsx.write(res);
  res.end();
}

export async function summaryReport(_req: Request, res: Response) {
  const db = getKnex();
  const rows = await db('requests')
    .select('dept', 'status')
    .count({ count: '*' })
    .groupBy('dept', 'status');
  const wb = await buildSummaryReport(rows as any);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="summary.xlsx"');
  await wb.xlsx.write(res);
  res.end();
}
