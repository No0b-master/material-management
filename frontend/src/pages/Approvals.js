import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../auth';

export default function Approvals() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/dashboard/approver/0', { headers: { Authorization: `Bearer ${getAccessToken()}` } });
      if (res.ok) setRows(await res.json());
    }
    load();
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>Pending Approvals</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Request No</th><th>Status</th><th>Dept</th><th>Part</th><th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.request_no}</td>
              <td>{r.status}</td>
              <td>{r.dept}</td>
              <td>{r.part_code}</td>
              <td>{r.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
