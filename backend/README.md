# MRMS Backend

Setup

1. Create `.env` from `.env.example` and fill DB and SMTP.
2. Install deps and run migrations and seeds:

```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

Request Number Format

- Format: `MR-YYYYMMDD-####`. Example: `MR-20250514-0001`.
- The sequence resets daily and is generated based on the count of requests created on the current date.

Approvals Transactional Writes

- All approver actions write to `approvals` and `audit_logs` in a single transaction and update `requests.status` atomically.

KMC Contact Email

- Stored in `settings` table under key `kmc_contact_email`. Admin can update via future admin route.

Swagger

- API docs at `/docs`.
