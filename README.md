# MRMS - Material Request Management System

This repository contains a full-stack MRMS implementation.

- Backend: Node.js + Express + MySQL (Knex)
- Auth: JWT (access + refresh)
- Email: Nodemailer via SMTP
- Reports: Excel (ExcelJS)
- Frontend: React + Vite (role-based UI)

## Setup

1) Backend

- Copy `backend/.env.example` to `backend/.env` and set values.
- Install deps:
```
cd backend
npm install
```
- Create MySQL database corresponding to `DB_NAME`.
- Run migrations and seeds:
```
npm run migrate
npm run seed
```
- Start dev server:
```
npm run dev
```

2) Frontend

```
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Request number format

`MR-YYYYMMDD-####` e.g. `MR-20250514-0001`. The sequence resets daily and increments per new request.

## Migration + Seed scripts

- `npm run migrate` executes Knex migrations under `src/db/migrations`.
- `npm run seed` executes seeders under `src/db/seeds`.

## Cron reminder

Hourly job emails HODs for approvals pending >48 hours.

## API Docs

Swagger available at `/api/docs` when backend is running.
