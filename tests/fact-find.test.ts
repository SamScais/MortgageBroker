import assert from "node:assert/strict";
import { test } from "node:test";
import { DEMO_CASES } from "../lib/demo";
import { extractDraftFields } from "../lib/fact-find-extract";
import { applyFieldAction, mergeExtractedFields } from "../lib/fact-find-state";
import { resetDemoData } from "../lib/seed-data";
import type { CaseRecord, ChecklistItem, FactFindField, StoredFile } from "../lib/types";

function item(
  itemKey: string,
  status: ChecklistItem["status"],
  caseId = "case-x",
): ChecklistItem {
  return {
    id: `item-${caseId}-${itemKey}`,
    caseId,
    itemKey,
    title: itemKey,
    description: "",
    status,
    brokerNote: "",
    reviewedAt: null,
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
  };
}

function file(itemKey: string, caseId = "case-x"): StoredFile {
  return {
    id: `file-${itemKey}`,
    itemId: `item-${caseId}-${itemKey}`,
    originalName: `${itemKey}.pdf`,
    storedName: `cases/${caseId}/${itemKey}/SAMPLE.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 12,
    uploadedAt: "2026-09-12T00:00:00.000Z",
  };
}

const genericCase: Pick<CaseRecord, "id" | "clientLabel"> = {
  id: "case-x",
  clientLabel: "SAMPLE Client — Alex Demo",
};

function draftField(overrides: Partial<FactFindField> = {}): FactFindField {
  return {
    key: "photo_id.full_name",
    group: "photo_id",
    label: "Full name",
    value: "SAMPLE Alex Demo",
    draftValue: "SAMPLE Alex Demo",
    state: "draft",
    sourceItemKey: "photo_id",
    sourceItemTitle: "Photo identification",
    sourceFileId: "file-photo_id",
    hint: "From accepted: Photo identification",
    ...overrides,
  };
}

test("draft fields come only from accepted documents", () => {
  const fields = extractDraftFields({
    caseRecord: genericCase,
    items: [
      item("photo_id", "accepted"),
      item("payslips", "uploaded"),
      item("bank_statements", "needs_review"),
      item("secondary_id", "rejected_resubmit"),
      item("existing_debts", "needed"),
    ],
    files: [
      file("photo_id"),
      file("payslips"),
      file("bank_statements"),
      file("secondary_id"),
    ],
  });

  assert.ok(fields.length > 0);
  assert.ok(fields.every((field) => field.state === "draft"));
  assert.ok(fields.every((field) => field.sourceItemKey === "photo_id"));
  assert.ok(fields.some((field) => field.key === "photo_id.full_name"));
  assert.equal(
    fields.some((field) => field.key.startsWith("payslips.")),
    false,
  );
  assert.equal(
    fields.some((field) => field.key.startsWith("bank_statements.")),
    false,
  );
  assert.equal(
    fields.some((field) => field.key.startsWith("secondary_id.")),
    false,
  );
});

test("self-employed tax documents are not extracted", () => {
  const fields = extractDraftFields({
    caseRecord: genericCase,
    items: [
      item("tax_returns", "accepted"),
      item("notice_of_assessment", "accepted"),
    ],
    files: [file("tax_returns"), file("notice_of_assessment")],
  });
  assert.deepEqual(fields, []);
});

test("confirm, edit and clear change field state", () => {
  const draft = draftField();
  const confirmed = applyFieldAction(draft, "confirm");
  assert.equal(confirmed.state, "confirmed");
  assert.equal(confirmed.value, "SAMPLE Alex Demo");

  const edited = applyFieldAction(draft, "edit", "SAMPLE Priya Nair-Jones");
  assert.equal(edited.state, "confirmed");
  assert.equal(edited.value, "SAMPLE Priya Nair-Jones");

  const cleared = applyFieldAction(confirmed, "clear");
  assert.equal(cleared.state, "cleared");
  assert.equal(cleared.value, "");

  const restored = applyFieldAction(cleared, "confirm");
  assert.equal(restored.state, "confirmed");
  assert.equal(restored.value, "SAMPLE Alex Demo");

  const emptyEdit = applyFieldAction(draft, "edit", "   ");
  assert.equal(emptyEdit.state, "cleared");
});

test("re-extract does not overwrite confirmed or cleared fields", () => {
  const existing = [
    draftField({
      state: "confirmed",
      value: "SAMPLE Broker-edited name",
    }),
    draftField({
      key: "photo_id.date_of_birth",
      label: "Date of birth",
      state: "cleared",
      value: "",
      draftValue: "SAMPLE 1 January 1990",
    }),
    draftField({
      key: "photo_id.doc_type",
      label: "Document type",
      value: "SAMPLE old draft",
      draftValue: "SAMPLE old draft",
    }),
  ];
  const extracted = extractDraftFields({
    caseRecord: genericCase,
    items: [item("photo_id", "accepted")],
    files: [file("photo_id")],
  });
  const merged = mergeExtractedFields(existing, extracted);

  const name = merged.find((field) => field.key === "photo_id.full_name");
  const dob = merged.find((field) => field.key === "photo_id.date_of_birth");
  const type = merged.find((field) => field.key === "photo_id.doc_type");
  assert.equal(name?.state, "confirmed");
  assert.equal(name?.value, "SAMPLE Broker-edited name");
  assert.equal(dob?.state, "cleared");
  assert.equal(dob?.value, "");
  assert.equal(type?.state, "draft");
  assert.match(type?.value ?? "", /SAMPLE/i);
});

test("draft fields drop when the source is no longer accepted", () => {
  const existing = [
    draftField({ state: "draft" }),
    draftField({
      key: "photo_id.date_of_birth",
      state: "confirmed",
      value: "SAMPLE 14 March 1992",
    }),
  ];
  const merged = mergeExtractedFields(existing, []);
  assert.equal(
    merged.some((field) => field.key === "photo_id.full_name"),
    false,
  );
  assert.equal(
    merged.find((field) => field.key === "photo_id.date_of_birth")?.state,
    "confirmed",
  );
});

test("seeded Priya case has SAMPLE PAYG drafts from accepted docs", () => {
  const db = resetDemoData();
  const factFind = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(factFind);
  assert.equal(factFind.kind, "payg");
  assert.ok(factFind.fields.length > 0);
  assert.ok(factFind.fields.every((field) => field.state === "draft"));
  assert.ok(factFind.fields.every((field) => /SAMPLE|FAKE/i.test(field.value)));

  const groups = new Set(factFind.fields.map((field) => field.group));
  for (const group of [
    "photo_id",
    "payslips",
    "bank_account",
    "genuine_savings",
    "spotted_liabilities",
    "living_expenses",
    "liability_docs",
    "secondary_id",
  ] as const) {
    assert.ok(groups.has(group), `missing group ${group}`);
  }

  assert.ok(
    factFind.fields.some((field) =>
      /declared from statements — compare to HEM later/i.test(field.hint),
    ),
  );
  assert.ok(
    factFind.fields.some((field) => field.key === "payslips.allowances_overtime"),
  );

  const tom = db.factFinds.find((row) => row.caseId === DEMO_CASES.refinance.id);
  assert.ok(tom);
  assert.equal(tom.fields.length, 0);
});
