import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { getKnex } from '../db/knex';
import { generateRequestNo } from '../utils/requestNo';
import { sendEmail, emailTemplate } from '../services/mailService';

export async function createRequest(req: Request, res: Response) {
  const user = req.user!;
  const body = req.body || {};
  const required = ['dept','cost_center','hod_name','username','contact_no','employee_code','email','pmo_name','part_code','description','quantity','type','purpose','plant_name'];
  for (const k of required) if (!body[k]) return res.status(400).json({ error: `Missing ${k}` });
  const db = getKnex();
  const trx = await db.transaction();
  try {
    const request_no = await generateRequestNo(trx);
    const request_date = dayjs().toDate();
    const [id] = await trx('requests').insert({
      request_no,
      request_date,
      dept: body.dept,
      cost_center: body.cost_center,
      hod_name: body.hod_name,
      n3_code: body.n3_code,
      username: body.username,
      contact_no: body.contact_no,
      employee_code: body.employee_code,
      email: body.email,
      pmo_name: body.pmo_name,
      part_code: body.part_code,
      description: body.description,
      quantity: body.quantity,
      type: body.type,
      project_name: body.project_name,
      purpose: body.purpose,
      plant_name: body.plant_name,
      plant_on_hand_qty: body.plant_on_hand_qty,
      status: 'Pending',
      created_by: user.id,
    });

    await trx('audit_logs').insert({ request_id: id, action: 'Request Created', performed_by: user.id, timestamp: new Date() });

    await trx.commit();

    // Email to HOD (Level 1)
    const html = emailTemplate('New MR awaiting your approval', [
      `Request No: ${request_no}`,
      `Raised by: ${body.username}`,
    ]);
    // Derive HOD email: simple lookup by hod_name -> users.email
    const hodUser = await db('users').where({ name: body.hod_name }).first();
    if (hodUser?.email) {
      sendEmail(hodUser.email, `MR ${request_no} awaiting approval`, html).catch(() => {});
    }

    const saved = await db('requests').where({ id }).first();
    res.status(201).json(saved);
  } catch (err) {
    try { await trx.rollback(); } catch {}
    res.status(500).json({ error: 'Failed to create request' });
  }
}

export async function listRequests(req: Request, res: Response) {
  const user = req.user!;
  const { start, end, department, status, approver } = req.query as any;
  const db = getKnex();
  let q = db('requests').select('*');

  if (start) q = q.where('request_date', '>=', start);
  if (end) q = q.where('request_date', '<=', end);
  if (department) q = q.where('dept', department);
  if (status) q = q.where('status', status);

  if (user.role === 'admin') {
    // no additional filter
  } else if (user.role === 'requester') {
    q = q.where('created_by', user.id);
  } else if (['hod','pm','store'].includes(user.role)) {
    // approver queues: only Pending or within their stage; simplified as Pending
    q = q.where('status', 'Pending');
  }

  const rows = await q.orderBy('request_date', 'desc');
  res.json(rows);
}

export async function getRequestById(req: Request, res: Response) {
  const id = Number(req.params.id);
  const db = getKnex();
  const row = await db('requests').where({ id }).first();
  if (!row) return res.status(404).json({ error: 'Not found' });
  // basic RBAC: owner, admin, or relevant approver
  const user = req.user!;
  if (
    user.role !== 'admin' &&
    row.created_by !== user.id &&
    !['hod','pm','store'].includes(user.role)
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(row);
}

export async function updateRequest(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = req.user!;
  const db = getKnex();
  const current = await db('requests').where({ id }).first();
  if (!current) return res.status(404).json({ error: 'Not found' });
  if (current.status !== 'Sent Back') return res.status(400).json({ error: 'Only Sent Back can be edited' });
  if (current.created_by !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const allowed = ['dept','cost_center','hod_name','n3_code','username','contact_no','employee_code','email','pmo_name','part_code','description','quantity','type','project_name','purpose','plant_name','plant_on_hand_qty'];
  const body = req.body || {};
  const update: any = {};
  for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
  await db('requests').where({ id }).update(update);
  await db('audit_logs').insert({ request_id: id, action: 'Request Updated', performed_by: user.id, timestamp: new Date() });
  const row = await db('requests').where({ id }).first();
  res.json(row);
}

export async function deleteRequest(req: Request, res: Response) {
  const id = Number(req.params.id);
  const user = req.user!;
  const db = getKnex();
  const current = await db('requests').where({ id }).first();
  if (!current) return res.status(404).json({ error: 'Not found' });
  if (current.status !== 'Pending') return res.status(400).json({ error: 'Only pending can be cancelled' });
  if (current.created_by !== user.id && user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  await db('requests').where({ id }).del();
  await db('audit_logs').insert({ request_id: id, action: 'Request Deleted', performed_by: user.id, timestamp: new Date() });
  res.status(204).send();
}
