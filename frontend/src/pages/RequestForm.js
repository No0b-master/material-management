import React, { useEffect, useState, useRef } from 'react';
import { getAccessToken } from '../auth';

export default function RequestForm() {
  const [dropdowns, setDropdowns] = useState({ plants: [], purposes: [], types: [], pms: [], hods: [] });
  const [form, setForm] = useState({ dept: '', cost_center: '', hod_name: '', n3_code: '', username: '', contact_no: '', employee_code: '', email: '', pmo_name: '', type: 'UPL', purpose: 'Testing', plant_name: 'PI-1', project_name: '' });
  const [rows, setRows] = useState([{ part_code: '', description: '', quantity: 1 }]);
  const textAreaRef = useRef();

  useEffect(() => {
    async function load() {
      const res = await fetch('/meta/dropdowns', { headers: { Authorization: `Bearer ${getAccessToken()}` } });
      if (res.ok) setDropdowns(await res.json());
    }
    load();
  }, []);

  function addRow() { setRows([...rows, { part_code: '', description: '', quantity: 1 }]); }
  function updateRow(i, field, value) { const copy = rows.slice(); copy[i] = { ...copy[i], [field]: value }; setRows(copy); }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text');
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length > 1) {
      e.preventDefault();
      const newRows = lines.map(line => {
        const [part_code = '', description = '', qty = '1'] = line.split(/\t|,|\s{2,}/);
        return { part_code, description, quantity: parseInt(qty, 10) || 1 };
      });
      setRows(prev => [...prev, ...newRows]);
    }
  }

  async function submit(e) {
    e.preventDefault();
    // submit one row at a time (backend is single-row API in this version)
    const first = rows[0];
    const payload = { ...form, ...first };
    const res = await fetch('/requests', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getAccessToken()}` }, body: JSON.stringify(payload) });
    if (res.ok) {
      alert('Request submitted');
      window.location.href = '/';
    } else {
      alert('Failed');
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Material Request</h2>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label>Dept*</label>
            <input value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} required />
          </div>
          <div>
            <label>Cost Center*</label>
            <input value={form.cost_center} onChange={e => setForm({ ...form, cost_center: e.target.value })} required />
          </div>
          <div>
            <label>HOD Name*</label>
            <input value={form.hod_name} onChange={e => setForm({ ...form, hod_name: e.target.value })} required />
          </div>
          <div>
            <label>N3 Code</label>
            <input value={form.n3_code} onChange={e => setForm({ ...form, n3_code: e.target.value })} />
          </div>
          <div>
            <label>Username*</label>
            <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
          </div>
          <div>
            <label>Contact No*</label>
            <input value={form.contact_no} onChange={e => setForm({ ...form, contact_no: e.target.value })} required />
          </div>
          <div>
            <label>Employee Code*</label>
            <input value={form.employee_code} onChange={e => setForm({ ...form, employee_code: e.target.value })} required />
          </div>
          <div>
            <label>Email*</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label>PMO Name*</label>
            <input value={form.pmo_name} onChange={e => setForm({ ...form, pmo_name: e.target.value })} required />
          </div>
          <div>
            <label>Type*</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {dropdowns.types.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Purpose*</label>
            <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
              {dropdowns.purposes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Plant Name*</label>
            <select value={form.plant_name} onChange={e => setForm({ ...form, plant_name: e.target.value })}>
              {dropdowns.plants.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label>Project Name</label>
            <input value={form.project_name} onChange={e => setForm({ ...form, project_name: e.target.value })} />
          </div>
        </div>

        <h3>Parts</h3>
        <textarea ref={textAreaRef} onPaste={handlePaste} placeholder="Paste rows: part_code, description, qty" rows={4} style={{ width: '100%' }} />
        {rows.map((row, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 3fr 100px', gap: 12, marginTop: 8 }}>
            <input placeholder="Part Code" value={row.part_code} onChange={e => updateRow(i, 'part_code', e.target.value)} required />
            <input placeholder="Description" value={row.description} onChange={e => updateRow(i, 'description', e.target.value)} required />
            <input type="number" min={1} placeholder="Qty" value={row.quantity} onChange={e => updateRow(i, 'quantity', e.target.value)} required />
          </div>
        ))}
        <button type="button" onClick={addRow}>+ Add Row</button>
        <div style={{ marginTop: 16 }}>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}
