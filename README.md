# MRMS (Material Request Management System)

Monorepo containing backend (Node.js/Express) and frontend (React) for MRMS.

Quick start

- Backend
```bash
cd backend
cp .env.example .env # set DB + SMTP
npm install
npm run migrate
npm run seed
npm run dev
```

- Frontend
```bash
cd ../frontend
npm install
npm start
```

Important

- Request No format: `MR-YYYYMMDD-####` (daily sequence).
- Approval levels: HOD (L1) → PM (L2) → Store (L3). All actions create `approvals` + `audit_logs` in a transaction.
- Reminder cron: hourly; emails pending >48h.
- Reports: `/reports/detailed` and `/reports/summary` (store/admin).
- API Docs: backend `/docs`.

Migrations & Seed

- Run `npm run migrate && npm run seed` in `backend/`.
- Seeded: cost centers, example users (admin/admin, PM team, one store, HODs from cost centers). Default password: `Password@123`.

ENV keys

- DB_HOST, DB_USER, DB_PASS, DB_NAME
- JWT_SECRET, JWT_REFRESH_SECRET
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- NODE_ENV, PORT
