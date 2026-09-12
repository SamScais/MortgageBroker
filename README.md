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
7. On the case page, **Download** a single file, or **Download zip (accepted)** to pack only accepted documents (rejected / needs-resubmit / empty items are left out). There is also an optional **Download zip (all uploaded)**.
8. Open the **Fact find** tab. Accepted documents produce a **draft PAYG fact-find**. Every field starts as draft — **Confirm / Edit / Clear** before it sticks. Nothing is lodged.

Out of scope: CRM, lender integrations, loan calculations, bank APIs, billing, live email, public production hosting, custom domains, Firebase, Drive/SharePoint sync, self-employed tax/NOA extraction, live Open Banking, Quickli, and ApplyOnline lodge. A **private Vercel preview** of this review build is supported (see below).

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

`npm run seed` resets the local database and sample PDFs. The first page load (and Vercel instance boot) will also seed demo data if the database file is missing.

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

Priya has **accepted** SAMPLE photo ID, payslips, 90-day bank statements, Medicare secondary ID, and a credit card statement so you can open the fact-find without uploading. Remaining purchase items (employment letter, genuine savings, contract) stay needed. Tom’s file is **overdue**, with a rejected photo ID and no accepted documents — the fact-find stays empty.

## Try the PAYG fact-find flow

1. Sign in as the demo broker.
2. Open **SAMPLE Client — Priya Nair**.
3. On the case page you should see **PAYG fact-find (draft)** with draft field counts. Choose **Fact find** (or **Open fact-find**).
4. Fields are grouped by source (photo ID, payslips, bank statements, spotted liabilities, living expenses, liability documents, secondary ID). Each row has a **Draft** badge and a source hint.
5. **Confirm** a field — the badge becomes **Confirmed** and the value persists after refresh.
6. **Edit** a field, change the value, **Save as confirmed**.
7. **Clear** a field — it is stored as cleared and will not be used. Confirm again to restore the SAMPLE draft.
8. Open **SAMPLE Client — Tom Brennan** → **Fact find**. There are no accepted documents, so there are no draft fields.

Extraction is deterministic SAMPLE/FAKE data (not live OCR). The field model is structured so a real OCR pipeline could plug in later. Living-expense rows are marked **declared vs HEM later**. This app never auto-lodges.

## Try the zip / download flow

1. Sign in as the demo broker.
2. Open **SAMPLE Client — Priya Nair**.
3. On a file row, use **Download** (saves that one PDF with a `SAMPLE-{client}-{doctype}-{date}-{status}` name).
4. Use **Download zip (accepted)**. The zip should contain only accepted documents (photo ID, payslips, bank statements, secondary ID, credit card statement). Needed items (employment letter, genuine savings, contract) stay out.
5. Optional: **Download zip (all uploaded)** includes every file that is actually on disk, still organised by document type.

Tom’s case has no accepted documents, so the accepted zip is not offered.

`npm run seed` rebuilds these SAMPLE files and resets the Priya fact-find drafts in the layout below.

## Private Vercel preview

This is a **private review URL**, not a public customer launch. Do not attach a custom domain.

1. In [Vercel](https://vercel.com), **Add New… → Project** and import GitHub `SamScais/MortgageBroker`.
2. **Framework Preset:** Next.js (detected from `vercel.json` / the repo).
3. **Root Directory:** leave as the repository root.
4. **Branch:** select this review branch (the PAYG fact-find + intake + accepted-only zip tip — e.g. `cursor/payg-draft-fact-find-03ec` or a `vercel-preview` branch based on it). Do not deploy `main` unless that is explicitly required.
5. Leave **Production** / custom domain empty. Use the generated `*.vercel.app` preview URL only.
6. Under **Deployment Protection**, turn on **Vercel Authentication** (or Standard Protection) so only invited Vercel team members can open the URL.
7. Environment variables (Project → Settings → Environment Variables), apply to **Preview**:

   | Name | Value |
   | ---- | ----- |
   | `SESSION_SECRET` | A long random string (do not reuse the example default on a shared URL) |
   | `NEXT_PUBLIC_APP_URL` | **Leave unset** so copied client links use the deployment hostname |

   Do not set `DATA_DIR`, `DATABASE_PATH`, or `UPLOAD_DIR`. On Vercel they default to a writable temp directory.

8. Deploy. Open the preview URL, sign in with `broker@demo.local` / `DemoBroker1!`.

`npm run build` is the Vercel build command. SAMPLE data is seeded when each serverless instance boots if the temp database is missing.

**Preview storage is ephemeral.** Vercel’s filesystem is read-only except `/tmp`. Each instance seeds its own SAMPLE database and PDFs. Uploads and review actions may disappear when that instance is replaced. That is expected for this review build — there is no cloud bucket.

## How storage works

Locally (`npm run dev` / `npm start`):

- Case data: `data/db.json`
- Uploaded files: `data/uploads/cases/{caseId}/{docType}/SAMPLE-{client}-{doctype}-{YYYYMMDD}-{status}.ext`
- Broker session: signed HTTP-only cookie (see `SESSION_SECRET`)

On Vercel preview, the same layout is created under `/tmp/mortgage-broker-intake/` (or `DATA_DIR` if you override it). Copied client links use `NEXT_PUBLIC_APP_URL` when set, otherwise `https://$VERCEL_URL`.

Example (local):

`data/uploads/cases/case-demo-purchase/bank_statements/SAMPLE-priya-nair-bank-statements-20260912-accepted.pdf`

Accept or request-resubmit renames the latest file so the status in the filename stays current. Maximum upload size is 10 MB. Allowed types: PDF, JPG, PNG, WEBP, HEIC.

There is no cloud bucket, no production auth provider, and no live email. The reminder log is labelled **DEMO email** on purpose.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Mobile-friendly responsive web UI (not a native app)
- Australian English copy

## Tests

```bash
npm test
```

Covers sample-name labelling, status transitions, overdue rules, AU checklist coverage, demo reminder wording, packed filenames, accepted-only zip filtering, PAYG fact-find draft → confirm / edit / clear (accepted documents only), and Vercel preview path / seed behaviour.
