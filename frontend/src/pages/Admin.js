import React, { useEffect, useState } from 'react';
import { getAccessToken } from '../auth';

export default function Admin() {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function load() {
      const res = await fetch('/users', { headers: { Authorization: `Bearer ${getAccessToken()}` } });
      if (res.ok) setUsers(await res.json());
    }
    load();
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin: Users</h2>
      <ul>
        {users.map(u => <li key={u.id}>{u.name} - {u.role}</li>)}
      </ul>
    </div>
  );
}
