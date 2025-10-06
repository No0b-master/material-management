const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { generateExcel } = require('../utils/excel');

const router = express.Router();

function applyFilters(q, { from, to, department, status, approver }) {
  if (from) q.where('request_date', '>=', from);
  if (to) q.where('request_date', '<=', to);
  if (department) q.where('dept', department);
  if (status) q.where('status', status);
  // approver filter could be implemented by joining approvals
}

router.get('/detailed', authenticate, authorize(['store','admin']), async (req, res) => {
  const q = req.knex('requests').select('*');
  applyFilters(q, req.query);
  const rows = await q.orderBy('request_date', 'desc');
  const columns = [
    { header: 'Request No', key: 'request_no' },
    { header: 'Date', key: 'request_date' },
    { header: 'Dept', key: 'dept' },
    { header: 'Cost Center', key: 'cost_center' },
    { header: 'HOD', key: 'hod_name' },
    { header: 'N3', key: 'n3_code' },
    { header: 'Username', key: 'username' },
    { header: 'Email', key: 'email' },
    { header: 'PMO', key: 'pmo_name' },
    { header: 'Part Code', key: 'part_code' },
    { header: 'Description', key: 'description' },
    { header: 'Qty', key: 'quantity' },
    { header: 'Type', key: 'type' },
    { header: 'Project', key: 'project_name' },
    { header: 'Purpose', key: 'purpose' },
    { header: 'Plant', key: 'plant_name' },
    { header: 'On-hand Qty', key: 'plant_on_hand_qty' },
    { header: 'Status', key: 'status' },
  ];
  const buffer = await generateExcel({ columns, rows });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="mrms_detailed.xlsx"');
  res.send(Buffer.from(buffer));
});

router.get('/summary', authenticate, authorize(['store','admin']), async (req, res) => {
  const q = req.knex('requests')
    .select('dept')
    .count({ total: '*' })
    .sum({ qty: 'quantity' })
    .groupBy('dept');
  applyFilters(q, req.query);
  const rowsRaw = await q;
  const rows = rowsRaw.map(r => ({ dept: r.dept, total: r.total, qty: r.qty }));
  const columns = [
    { header: 'Dept', key: 'dept' },
    { header: 'Total Requests', key: 'total' },
    { header: 'Total Qty', key: 'qty' },
  ];
  const buffer = await generateExcel({ columns, rows, sheetName: 'Summary' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="mrms_summary.xlsx"');
  res.send(Buffer.from(buffer));
});

module.exports = router;
