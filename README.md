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
9. After confirming fields, **Download CSV** or **Download JSON** of confirmed values only, or **Download handoff pack** (confirmed export + accepted documents). Draft and cleared fields are left out.

Out of scope: CRM, lender integrations, loan calculations, bank APIs, billing, live email, public production hosting, custom domains, Firebase, Drive/SharePoint sync, self-employed tax/NOA extraction, live Open Banking, Quickli lodge, and ApplyOnline lodge. A **private Vercel preview** of this review build is supported (see below). The confirmed export is a **handoff aid** so you can paste or map into Quickli / FLEX — it does not replace those tools and does not lodge anything.

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
5. **Confirm** a field — the badge becomes **Confirmed** and the value persists after refresh (locally in `data/db.json`; on Vercel preview in a signed cookie — see storage below).
6. **Edit** a field, change the value, **Save as confirmed**.
7. **Clear** a field — it is stored as cleared and will not be used. Confirm again to restore the SAMPLE draft.
8. Open **SAMPLE Client — Tom Brennan** → **Fact find**. There are no accepted documents, so there are no draft fields.

Extraction is deterministic SAMPLE/FAKE data (not live OCR). The field model is structured so a real OCR pipeline could plug in later. Living-expense rows are marked **declared vs HEM later**. This app never auto-lodges.

## Try the confirmed export / handoff pack

1. On Priya’s **Fact find**, confirm a few fields (for example full name and employer). Leave others as draft, or clear one.
2. Use **Download CSV** or **Download JSON**. Filenames are `SAMPLE-{client}-confirmed-fact-find-{date}.csv` / `.json`. Header comments and the JSON `notice` say SAMPLE / FAKE, handoff aid only, not lodged.
3. Open the file — **one row per confirmed field**, with `sourceDocType`, `confirmedAt`, and `SAMPLE=true`. Draft and cleared values stay out.
4. **Download accepted zip** still packs accepted documents only (alongside the confirmed export).
5. **Download handoff pack** builds `SAMPLE-{client}-handoff-{date}.zip` with a SAMPLE/FAKE notice, the confirmed CSV + JSON, and the accepted documents folder.
6. Tom has no confirmed fields, so CSV / JSON / handoff are not offered until something is confirmed.

On a Vercel preview, confirm at least one field, then refresh or export immediately — the confirmed field must still be there. Confirm state is **not** only in `/tmp`; it is also kept in the signed `mb_ff` cookie so a later serverless request can still build the CSV/JSON.

This is a handoff aid, not a CRM replacement. Nothing is lodged to Quickli, FLEX, ApplyOnline or any lender.

**Export tip:** one row per confirmed field. Each row includes `sourceDocType`, `confirmedAt`, and `SAMPLE=true`. Draft and cleared fields stay out. The accepted-documents zip stays **accepted-only** alongside (rejected / needs-resubmit / empty items are left out).

## Quickli / FLEX-ish field mapping (PAYG)

Approximate labels for handoff — **not a certified LIXI / ApplyOnline schema**. Export **confirmed fields only**. Mark **SAMPLE / FAKE**. Confirm-all, serviceability, Illion and ApplyOnline lodge stay out of scope.

Stored keys on the fact-find (e.g. `photo_id.full_name`) map to the concept keys below.

| Our draft key (concept) | FLEX-ish / CRM label | Quickli-ish note |
| --- | --- | --- |
| fullName | First Name + Last Name | Applicant name |
| dateOfBirth | Date of Birth | DOB |
| residentialAddress | Street / Suburb / State / Postcode | Residential address |
| photoIdType / photoIdNumber / photoIdExpiry | (ID / VOI notes) | ID type, number, expiry |
| secondaryIdType / secondaryIdNumber | (secondary ID) | e.g. Medicare |
| employerName | Employer Business Name | Employer |
| jobTitle | Job Title | Occupation |
| employmentBasis | Employment Basis (FT/PT/casual) | Employment type |
| employmentStartDate | Start Date | Start date |
| grossBasePay | Gross Base Income | Base income |
| payFrequency | Frequency | Pay frequency |
| ytdGross | (YTD — often in notes) | YTD income |
| allowancesOvertime | Additional Income Benefits | Allowances / OT |
| bankInstitution | Financial Institution | Bank name |
| bsbAccount | BSB + Account Number | BSB / account |
| statementPeriod | (statement dates) | Period covered |
| closingBalance | Estimated Value (savings/txn) | Account balance |
| genuineSavingsNotes | (assets notes) | Deposit / genuine savings |
| spottedLiabilityPayments | (feeds liabilities) | Recurring loan/CC/HECS hits |
| livingExpense_* | Groceries, Telco, Childcare, etc. | Declared expenses (vs HEM later) |
| liabilityType | Existing Mortgages / Credit Cards / … | Liability type |
| liabilityLender | Lender / Credit Card Provider | Provider |
| liabilityLimit | Current Limit | Limit |
| liabilityBalance | Outstanding Balance | Balance |
| liabilityRepayment | Repayment Amount | Repayment |

CSV and JSON exports include these FLEX-ish / Quickli-ish labels on each confirmed row (`flex`, `quickli`, plus `concept`). Refinance current-loan statement fields use the same liability concepts (`liabilityType`, `liabilityLender`, …).

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
4. **Branch:** select this review branch (intake + accepted-only zip + PAYG fact-find + confirmed export / handoff, stacked on the Vercel preview-ready tip). Do not deploy `main` unless that is explicitly required.
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

**Preview storage is mixed — read this before testing Confirm → Export.**

Vercel’s filesystem is read-only except `/tmp`. Each serverless instance seeds its own SAMPLE database and PDFs under `/tmp/mortgage-broker-intake/`. That folder is **not shared** across instances and is wiped when the instance is replaced.

| What | Local (`npm run dev`) | Vercel preview |
| ---- | --------------------- | -------------- |
| Cases, uploads, review actions, accepted zip | `data/` on disk | Ephemeral `/tmp` per instance. May vanish on a new request. |
| **Confirmed / cleared fact-find fields** | `data/db.json` | **Signed httpOnly cookie `mb_ff`** (plus `/tmp` on that instance). Survives refresh and a later Export CSV/JSON on a different instance. |
| Broker login | Signed `mb_session` cookie | Same signed `mb_session` cookie |
| Cloud bucket / Blob / KV | Not used | Not used — none is configured; do not create a paid store for this preview |

No Vercel Blob or KV token is required. Confirm → Export works on preview because export/handoff/fact-find reads merge the signed cookie overlay onto the freshly seeded drafts.

Uploads and “accept / reject” may still disappear between instances. That is expected for this review build. The accepted-only zip still works on an instance that already has the seeded Priya PDFs.

## How storage works

Locally (`npm run dev` / `npm start`):

- Case data: `data/db.json`
- Uploaded files: `data/uploads/cases/{caseId}/{docType}/SAMPLE-{client}-{doctype}-{YYYYMMDD}-{status}.ext`
- Broker session: signed HTTP-only cookie `mb_session` (see `SESSION_SECRET`)
- Confirmed fact-find fields: `data/db.json` (the `mb_ff` cookie is also written as a backup)

On Vercel preview:

- The same file layout is created under `/tmp/mortgage-broker-intake/` (or `DATA_DIR` if you override it). This is **ephemeral and per-instance**.
- Confirmed / cleared fact-find fields are also written to a signed, compressed, httpOnly cookie (`mb_ff`, same `SESSION_SECRET`). Export CSV/JSON and the handoff pack **merge that cookie onto the seeded drafts**, so Confirm on one request still exports on the next.
- Copied client links use `NEXT_PUBLIC_APP_URL` when set, otherwise `https://$VERCEL_URL`.
- There is no Vercel Blob / KV / database. Do not set those up for this review build.

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

Covers sample-name labelling, status transitions, overdue rules, AU checklist coverage, demo reminder wording, packed filenames, accepted-only zip filtering, PAYG fact-find draft → confirm / edit / clear (accepted documents only), confirmed-only CSV/JSON export and handoff pack, Quickli/FLEX field mapping coverage, signed fact-find overlay persistence across ephemeral preview instances, and Vercel preview path / seed behaviour.
