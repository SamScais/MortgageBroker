import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DEMO_BROKER, DEMO_CASES } from "../lib/demo";
import {
  CONFIRMED_EXPORT_NOTICE,
  buildConfirmedFactFindExport,
  confirmedExportFilename,
  confirmedFields,
  handoffZipDownloadName,
  serializeConfirmedCsv,
  serializeConfirmedJson,
} from "../lib/fact-find-export";
import { applyStoredFieldAction } from "../lib/fact-find";
import { buildHandoffZip } from "../lib/fact-find-handoff";
import { mappingForFieldKey } from "../lib/fact-find-mapping";
import { resetDemoData } from "../lib/seed-data";
import { saveDb } from "../lib/store";
import type { FactFindField } from "../lib/types";
import { listZipEntryNames, readZipEntry } from "../lib/zip";

function field(overrides: Partial<FactFindField> = {}): FactFindField {
  return {
    key: "photo_id.full_name",
    group: "photo_id",
    label: "Full name",
    value: "SAMPLE Priya Nair",
    draftValue: "SAMPLE Priya Nair",
    state: "confirmed",
    sourceItemKey: "photo_id",
    sourceItemTitle: "Photo identification",
    sourceFileId: "file-photo_id",
    hint: "From accepted: Photo identification",
    ...overrides,
  };
}

const meta = {
  caseId: "case-demo-purchase",
  clientLabel: "SAMPLE Client — Priya Nair",
  kind: "payg" as const,
  exportedAt: "2026-09-12T00:00:00.000Z",
};

test("confirmed export keeps confirmed values and drops draft and cleared", () => {
  const fields = [
    field(),
    field({
      key: "photo_id.date_of_birth",
      label: "Date of birth",
      value: "SAMPLE 14 March 1992",
      state: "draft",
    }),
    field({
      key: "photo_id.doc_number",
      label: "Document number",
      value: "",
      state: "cleared",
    }),
    field({
      key: "payslips.employer_name",
      group: "payslips",
      label: "Employer name",
      value: "SAMPLE Harbour Legal Pty Ltd",
      sourceItemKey: "payslips",
      sourceItemTitle: "Latest two payslips",
    }),
  ];

  assert.deepEqual(
    confirmedFields(fields).map((row) => row.key),
    ["photo_id.full_name", "payslips.employer_name"],
  );

  const csv = serializeConfirmedCsv(fields, meta);
  assert.match(csv, /^# SAMPLE \/ FAKE/m);
  assert.match(csv, /not a CRM replacement/i);
  assert.match(csv, /Nothing is lodged/);
  assert.match(csv, /photo_id\.full_name/);
  assert.match(csv, /payslips\.employer_name/);
  assert.equal(csv.includes("photo_id.date_of_birth"), false);
  assert.equal(csv.includes("photo_id.doc_number"), false);
  assert.match(csv, /SAMPLE,concept,key,label,value,sourceDocType,confirmedAt,flex,quickli/);
  assert.match(csv, /true,fullName,photo_id\.full_name/);
  assert.match(csv, /true,employerName,payslips\.employer_name/);
  assert.match(csv, /First Name \+ Last Name/);
  assert.match(csv, /Applicant name/);
  assert.match(csv, /Employer Business Name/);
  assert.match(csv, /photo_id,/);
  assert.match(csv, /payslips,/);

  const parsed = JSON.parse(serializeConfirmedJson(fields, meta));
  assert.equal(parsed.SAMPLE, true);
  assert.equal(parsed.sample, true);
  assert.equal(parsed.notLodged, true);
  assert.equal(parsed.handoffAidOnly, true);
  assert.equal(parsed.fieldCount, 2);
  assert.deepEqual(
    parsed.fields.map((row: { key: string }) => row.key),
    ["photo_id.full_name", "payslips.employer_name"],
  );
  assert.ok(
    parsed.fields.every(
      (row: { SAMPLE: boolean; state: string; sourceDocType: string; confirmedAt: string }) =>
        row.SAMPLE === true &&
        row.state === "confirmed" &&
        row.sourceDocType.length > 0 &&
        row.confirmedAt.length > 0,
    ),
  );
  assert.equal(parsed.fields[0].concept, "fullName");
  assert.equal(parsed.fields[0].flex, "First Name + Last Name");
  assert.equal(parsed.fields[0].quickli, "Applicant name");
});

test("empty confirmed set is not exported", () => {
  const packed = buildConfirmedFactFindExport(
    [
      field({ state: "draft" }),
      field({ key: "photo_id.doc_number", state: "cleared", value: "" }),
    ],
    meta,
    "csv",
  );
  assert.ok("error" in packed);
  assert.match(packed.error, /No confirmed fields/);
});

test("filenames keep SAMPLE labelling", () => {
  assert.match(
    confirmedExportFilename(meta.clientLabel, "csv", new Date(meta.exportedAt)),
    /^SAMPLE-priya-nair-confirmed-fact-find-\d{8}\.csv$/,
  );
  assert.match(
    confirmedExportFilename(meta.clientLabel, "json", new Date(meta.exportedAt)),
    /^SAMPLE-priya-nair-confirmed-fact-find-\d{8}\.json$/,
  );
  assert.match(
    handoffZipDownloadName(meta.clientLabel, new Date(meta.exportedAt)),
    /^SAMPLE-priya-nair-handoff-\d{8}\.zip$/,
  );
  assert.match(CONFIRMED_EXPORT_NOTICE, /SAMPLE \/ FAKE/);
});

test("every seeded PAYG field has a Quickli / FLEX mapping", () => {
  const db = resetDemoData();
  const factFind = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(factFind);
  for (const row of factFind.fields) {
    const mapping = mappingForFieldKey(row.key);
    assert.notEqual(
      mapping.quickli,
      "Paste into the matching Quickli field",
      `missing Quickli map for ${row.key}`,
    );
    assert.notEqual(
      mapping.flex,
      "Paste into the matching FLEX field",
      `missing FLEX map for ${row.key}`,
    );
    assert.ok(mapping.concept, `missing concept for ${row.key}`);
  }
  assert.equal(mappingForFieldKey("photo_id.full_name").flex, "First Name + Last Name");
  assert.equal(mappingForFieldKey("photo_id.full_name").quickli, "Applicant name");
  assert.equal(mappingForFieldKey("payslips.employer_name").flex, "Employer Business Name");
  assert.equal(mappingForFieldKey("payslips.gross_base_pay").flex, "Gross Base Income");
});

test("README includes the locked Quickli / FLEX-ish field map", () => {
  const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
  assert.match(
    readme,
    /\| Our draft key \(concept\) \| FLEX-ish \/ CRM label \| Quickli-ish note \|/,
  );
  assert.match(readme, /\| fullName \| First Name \+ Last Name \| Applicant name \|/);
  assert.match(readme, /\| dateOfBirth \| Date of Birth \| DOB \|/);
  assert.match(readme, /\| residentialAddress \| Street \/ Suburb \/ State \/ Postcode \| Residential address \|/);
  assert.match(readme, /\| photoIdType \/ photoIdNumber \/ photoIdExpiry \| \(ID \/ VOI notes\) \| ID type, number, expiry \|/);
  assert.match(readme, /\| secondaryIdType \/ secondaryIdNumber \| \(secondary ID\) \| e.g. Medicare \|/);
  assert.match(readme, /\| employerName \| Employer Business Name \| Employer \|/);
  assert.match(readme, /\| jobTitle \| Job Title \| Occupation \|/);
  assert.match(readme, /\| employmentBasis \| Employment Basis \(FT\/PT\/casual\) \| Employment type \|/);
  assert.match(readme, /\| employmentStartDate \| Start Date \| Start date \|/);
  assert.match(readme, /\| grossBasePay \| Gross Base Income \| Base income \|/);
  assert.match(readme, /\| payFrequency \| Frequency \| Pay frequency \|/);
  assert.match(readme, /\| ytdGross \| \(YTD — often in notes\) \| YTD income \|/);
  assert.match(readme, /\| allowancesOvertime \| Additional Income Benefits \| Allowances \/ OT \|/);
  assert.match(readme, /\| bankInstitution \| Financial Institution \| Bank name \|/);
  assert.match(readme, /\| bsbAccount \| BSB \+ Account Number \| BSB \/ account \|/);
  assert.match(readme, /\| statementPeriod \| \(statement dates\) \| Period covered \|/);
  assert.match(readme, /\| closingBalance \| Estimated Value \(savings\/txn\) \| Account balance \|/);
  assert.match(readme, /\| genuineSavingsNotes \| \(assets notes\) \| Deposit \/ genuine savings \|/);
  assert.match(readme, /\| spottedLiabilityPayments \| \(feeds liabilities\) \| Recurring loan\/CC\/HECS hits \|/);
  assert.match(readme, /\| livingExpense_\* \| Groceries, Telco, Childcare, etc. \| Declared expenses \(vs HEM later\) \|/);
  assert.match(readme, /\| liabilityType \| Existing Mortgages \/ Credit Cards \/ … \| Liability type \|/);
  assert.match(readme, /\| liabilityLender \| Lender \/ Credit Card Provider \| Provider \|/);
  assert.match(readme, /\| liabilityLimit \| Current Limit \| Limit \|/);
  assert.match(readme, /\| liabilityBalance \| Outstanding Balance \| Balance \|/);
  assert.match(readme, /\| liabilityRepayment \| Repayment Amount \| Repayment \|/);
  assert.match(readme, /not a certified LIXI \/ ApplyOnline schema/);
});

test("Priya handoff pack is confirmed export plus accepted documents", () => {
  const db = resetDemoData();
  applyStoredFieldAction(db, DEMO_CASES.purchase.id, "photo_id.full_name", "confirm");
  applyStoredFieldAction(
    db,
    DEMO_CASES.purchase.id,
    "payslips.employer_name",
    "confirm",
  );
  applyStoredFieldAction(db, DEMO_CASES.purchase.id, "photo_id.doc_number", "clear");
  saveDb(db);

  const packed = buildHandoffZip(
    DEMO_BROKER.id,
    DEMO_CASES.purchase.id,
    new Date("2026-09-12T00:00:00.000Z"),
  );
  assert.ok(!("error" in packed), "handoff zip should build");
  assert.equal(packed.confirmedCount, 2);
  assert.equal(packed.acceptedCount, 5);
  assert.match(packed.filename, /^SAMPLE-priya-nair-handoff-\d{8}\.zip$/);

  const names = listZipEntryNames(packed.bytes);
  assert.ok(names.includes("NOTICE-SAMPLE-FAKE.txt"));
  const csvName = names.find((name) => name.endsWith(".csv"));
  const jsonName = names.find((name) => name.endsWith(".json"));
  assert.ok(csvName?.startsWith("confirmed-fact-find/SAMPLE-priya-nair-"));
  assert.ok(jsonName?.startsWith("confirmed-fact-find/SAMPLE-priya-nair-"));
  for (const docType of [
    "photo_id",
    "payslips",
    "bank_statements",
    "secondary_id",
    "existing_debts",
  ]) {
    assert.ok(
      names.some((name) => name.startsWith(`accepted-documents/cases/`) && name.includes(`/${docType}/`)),
      `missing accepted ${docType}`,
    );
  }

  const csv = readZipEntry(packed.bytes, csvName ?? "")?.toString("utf8") ?? "";
  assert.match(csv, /photo_id\.full_name/);
  assert.match(csv, /payslips\.employer_name/);
  assert.match(csv, /sourceDocType/);
  assert.match(csv, /confirmedAt/);
  assert.match(csv, /SAMPLE=true|SAMPLE,concept/);
  assert.equal(csv.includes("photo_id.doc_number"), false);
  assert.equal(csv.includes("bank_statements.institution"), false);

  const empty = buildHandoffZip(DEMO_BROKER.id, DEMO_CASES.refinance.id);
  assert.ok("error" in empty);
  assert.match(empty.error, /No confirmed fields/);
});
