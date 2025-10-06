const express = require('express');
const knex = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const xl = require('excel4node');

const router = express.Router();
router.use(authenticate);

function buildWorkbookDetailed(rows) {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Detailed');
  const headers = ['Request No', 'Date', 'Dept', 'Cost Center', 'HOD', 'PMO', 'Part Code', 'Description', 'Qty', 'Type', 'Purpose', 'Plant', 'Status'];
  headers.forEach((h, i) => ws.cell(1, i + 1).string(h));
  rows.forEach((r, idx) => {
    const row = idx + 2;
    ws.cell(row, 1).string(r.request_no);
    ws.cell(row, 2).date(r.request_date);
    ws.cell(row, 3).string(r.dept || '');
    ws.cell(row, 4).string(r.cost_center || '');
    ws.cell(row, 5).string(r.hod_name || '');
    ws.cell(row, 6).string(r.pmo_name || '');
    ws.cell(row, 7).string(r.part_code || '');
    ws.cell(row, 8).string(r.description || '');
    ws.cell(row, 9).number(r.quantity || 0);
    ws.cell(row, 10).string(r.type || '');
    ws.cell(row, 11).string(r.purpose || '');
    ws.cell(row, 12).string(r.plant_name || '');
    ws.cell(row, 13).string(r.status || '');
  });
  return wb;
}

function buildWorkbookSummary(rows) {
  const wb = new xl.Workbook();
  const ws = wb.addWorksheet('Summary');
  const headers = ['Dept', 'Total', 'Approved', 'Rejected', 'Sent Back', 'Pending'];
  headers.forEach((h, i) => ws.cell(1, i + 1).string(h));
  rows.forEach((r, idx) => {
    const row = idx + 2;
    ws.cell(row, 1).string(r.dept || '');
    ws.cell(row, 2).number(r.total);
    ws.cell(row, 3).number(r.approved);
    ws.cell(row, 4).number(r.rejected);
    ws.cell(row, 5).number(r.sent_back);
    ws.cell(row, 6).number(r.pending);
  });
  return wb;
}

router.get('/detailed', authorize(['store','admin']), async (req, res) => {
  let q = knex('requests');
  const { startDate, endDate, department, status } = req.query;
  if (startDate) q = q.where('request_date', '>=', new Date(startDate));
  if (endDate) q = q.where('request_date', '<=', new Date(endDate));
  if (department) q = q.where('dept', department);
  if (status) q = q.where('status', status);
  const rows = await q.orderBy('request_date', 'desc');
  const wb = buildWorkbookDetailed(rows);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="mrms_detailed.xlsx"');
  wb.write('mrms_detailed.xlsx', res);
});

router.get('/summary', authorize(['store','admin']), async (req, res) => {
  let q = knex('requests');
  const { startDate, endDate } = req.query;
  if (startDate) q = q.where('request_date', '>=', new Date(startDate));
  if (endDate) q = q.where('request_date', '<=', new Date(endDate));
  const rows = await q
    .select('dept')
    .count({ total: '*' })
    .sum({ approved: knex.raw("(status = 'Approved')") })
    .sum({ rejected: knex.raw("(status = 'Rejected')") })
    .sum({ sent_back: knex.raw("(status = 'Sent Back')") })
    .sum({ pending: knex.raw("(status = 'Pending')") })
    .groupBy('dept');
  const wb = buildWorkbookSummary(rows.map(r => ({
    dept: r.dept,
    total: Number(r.total),
    approved: Number(r.approved),
    rejected: Number(r.rejected),
    sent_back: Number(r.sent_back),
    pending: Number(r.pending)
  })));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="mrms_summary.xlsx"');
  wb.write('mrms_summary.xlsx', res);
});

module.exports = router;
