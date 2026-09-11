# Document intake for Australian mortgage brokers

Local MVP: a broker creates a client case, shares **one unique upload link**, and reviews documents against a home-loan checklist.

**SAMPLE / FAKE demo data only.** This is not financial advice, not a lender portal, and not a production deployment. Do not store real client identity documents here.

## What you can do

1. Sign in as the demo broker.
2. Create a case and pick a loan scenario (purchase, refinance, or first home buyer). A checklist is generated.
3. Copy the client link (no client login).
4. As the client, upload files against each item. Statuses are: needed, uploaded, needs review, accepted, rejected — resubmit.
5. Overdue files are flagged automatically. **Send reminder** writes to a **DEMO email log** (nothing is sent to a real inbox).
6. Use the review queue to open a case, view the file, accept it, or request a resubmit with a short note.

Out of scope: CRM, lender integrations, loan calculations, bank APIs, billing, live email, and production hosting.

## How to run locally

You need Node.js 22+.

```bash
npm install
npm run seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` if you want to change the session secret or the public URL shown on copied links.

```bash
npm test    # unit tests for statuses, scenarios, reminders
npm run build
```

`npm run seed` resets the local database and sample PDFs. The first page load will also seed demo data if `data/db.json` is missing.

## Demo broker

| Field    | Value                          |
| -------- | ------------------------------ |
| Email    | `broker@demo.local`            |
| Password | `DemoBroker1!`                 |
| Name     | Sam Wilson (SAMPLE broker)     |

The login form is pre-filled with these details.

## Create a case and get the client link

1. Sign in → **New case**.
2. Enter a **sample** name and email (the name is stored as `SAMPLE Client — …`).
3. Choose a scenario and due date → **Create case and checklist**.
4. On the case page, use **Copy link**. That URL is the only thing the client needs.

Seeded cases (already in the review queue / overdue demo):

| Case | Scenario | Client link |
| ---- | -------- | ----------- |
| SAMPLE Client — Priya Nair | Purchase | [http://localhost:3000/u/demo-purchase-priya](http://localhost:3000/u/demo-purchase-priya) |
| SAMPLE Client — Tom Brennan | Refinance | [http://localhost:3000/u/demo-refinance-tom](http://localhost:3000/u/demo-refinance-tom) |

Priya has files waiting for review. Tom’s file is **overdue**, with a rejected photo ID you can ask the “client” to replace.

## How storage works

This MVP keeps everything on the machine that runs `npm run dev`:

- Case data: `data/db.json`
- Uploaded files: `data/uploads/`
- Broker session: signed HTTP-only cookie (see `SESSION_SECRET`)

Maximum upload size is 10 MB. Allowed types: PDF, JPG, PNG, WEBP, HEIC.

There is no cloud bucket, no production auth provider, and no live email. The reminder log is labelled **DEMO email** on purpose.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mobile-friendly responsive web UI (not a native app)
- Australian English copy

## Tests

```bash
npm test
```

Covers sample-name labelling, status transitions, overdue rules, AU checklist coverage, and demo reminder wording.
