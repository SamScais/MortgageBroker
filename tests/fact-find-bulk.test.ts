import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { DEMO_CASES } from "../lib/demo";
import { applyStoredDraftConfirms, applyStoredFieldAction } from "../lib/fact-find";
import { buildConfirmedFactFindExport } from "../lib/fact-find-export";
import {
  emptyOverlay,
  encodeFactFindOverlay,
  replaceCaseOverlay,
} from "../lib/fact-find-overlay";
import {
  applyDraftConfirmsToRecord,
  applyFieldAction,
  confirmableDrafts,
  parseBulkConfirmForm,
} from "../lib/fact-find-state";
import { resetDemoData } from "../lib/seed-data";
import type { FactFindField, FactFindRecord } from "../lib/types";

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

function recordFrom(fields: FactFindField[]): FactFindRecord {
  return {
    id: "factfind-case-x",
    caseId: "case-x",
    kind: "payg",
    fields,
    extractedAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
  };
}

test("confirmable drafts skip confirmed and cleared", () => {
  const fields = [
    draftField(),
    draftField({
      key: "photo_id.date_of_birth",
      label: "Date of birth",
      state: "confirmed",
      value: "SAMPLE 1 January 1990",
    }),
    draftField({
      key: "photo_id.doc_type",
      label: "Document type",
      state: "cleared",
      value: "",
    }),
    draftField({
      key: "payslips.employer_name",
      group: "payslips",
      label: "Employer name",
      value: "SAMPLE Harbour Legal",
      draftValue: "SAMPLE Harbour Legal",
    }),
  ];

  assert.deepEqual(
    confirmableDrafts(fields).map((field) => field.key),
    ["photo_id.full_name", "payslips.employer_name"],
  );
  assert.deepEqual(
    confirmableDrafts(fields, { group: "photo_id" }).map((field) => field.key),
    ["photo_id.full_name"],
  );
});

test("confirm group only confirms drafts in that group", () => {
  const { record, confirmedKeys } = applyDraftConfirmsToRecord(
    recordFrom([
      draftField(),
      draftField({
        key: "payslips.employer_name",
        group: "payslips",
        label: "Employer name",
        value: "SAMPLE Harbour Legal",
        draftValue: "SAMPLE Harbour Legal",
      }),
      draftField({
        key: "photo_id.doc_type",
        label: "Document type",
        state: "cleared",
        value: "",
      }),
    ]),
    { group: "photo_id" },
    "2026-09-12T01:00:00.000Z",
  );

  assert.deepEqual(confirmedKeys, ["photo_id.full_name"]);
  assert.equal(
    record.fields.find((field) => field.key === "photo_id.full_name")?.state,
    "confirmed",
  );
  assert.equal(
    record.fields.find((field) => field.key === "photo_id.full_name")?.confirmedAt,
    "2026-09-12T01:00:00.000Z",
  );
  assert.equal(
    record.fields.find((field) => field.key === "payslips.employer_name")?.state,
    "draft",
  );
  assert.equal(
    record.fields.find((field) => field.key === "photo_id.doc_type")?.state,
    "cleared",
  );
});

test("confirm all confirms every draft and leaves cleared alone", () => {
  const cleared = applyFieldAction(draftField({ key: "photo_id.doc_number" }), "clear");
  const { record, confirmedKeys } = applyDraftConfirmsToRecord(
    recordFrom([
      draftField(),
      draftField({
        key: "payslips.employer_name",
        group: "payslips",
        label: "Employer name",
        value: "SAMPLE Harbour Legal",
        draftValue: "SAMPLE Harbour Legal",
      }),
      cleared,
    ]),
    undefined,
    "2026-09-12T02:00:00.000Z",
  );

  assert.deepEqual(confirmedKeys.sort(), [
    "payslips.employer_name",
    "photo_id.full_name",
  ]);
  assert.ok(
    record.fields
      .filter((field) => field.key !== "photo_id.doc_number")
      .every((field) => field.state === "confirmed"),
  );
  assert.equal(
    record.fields.find((field) => field.key === "photo_id.doc_number")?.state,
    "cleared",
  );
});

test("bulk confirm form requires the I-checked-these tick", () => {
  const missing = parseBulkConfirmForm(new FormData());
  assert.equal(missing.ok, false);

  const noAck = new FormData();
  noAck.set("caseId", "case-demo-purchase");
  noAck.set("scope", "all");
  const rejected = parseBulkConfirmForm(noAck);
  assert.equal(rejected.ok, false);
  if (!rejected.ok) {
    assert.match(rejected.error, /I have checked these draft values/);
  }

  const allAck = new FormData();
  allAck.set("caseId", "case-demo-purchase");
  allAck.set("scope", "all");
  allAck.set("acknowledged", "1");
  const accepted = parseBulkConfirmForm(allAck);
  assert.deepEqual(accepted, {
    ok: true,
    caseId: "case-demo-purchase",
    scope: "all",
  });

  const groupAck = new FormData();
  groupAck.set("caseId", "case-demo-purchase");
  groupAck.set("scope", "group");
  groupAck.set("group", "payslips");
  groupAck.set("acknowledged", "on");
  const group = parseBulkConfirmForm(groupAck);
  assert.deepEqual(group, {
    ok: true,
    caseId: "case-demo-purchase",
    scope: "group",
    group: "payslips",
  });

  const badGroup = new FormData();
  badGroup.set("caseId", "case-demo-purchase");
  badGroup.set("scope", "group");
  badGroup.set("group", "not-a-group");
  badGroup.set("acknowledged", "1");
  assert.equal(parseBulkConfirmForm(badGroup).ok, false);
});

test("Priya confirm-all persists to the cookie overlay and exports", () => {
  const db = resetDemoData();
  const seeded = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(seeded);
  assert.equal(seeded.fields.length, 37);
  assert.ok(seeded.fields.every((field) => field.state === "draft"));

  applyStoredFieldAction(db, DEMO_CASES.purchase.id, "photo_id.doc_number", "clear");
  const photo = applyStoredDraftConfirms(db, DEMO_CASES.purchase.id, {
    group: "photo_id",
  });
  assert.ok(photo);
  assert.equal(photo.confirmedCount, 5, "cleared photo ID number stays out of the group");
  assert.equal(
    photo.record.fields.find((field) => field.key === "photo_id.doc_number")?.state,
    "cleared",
  );
  assert.ok(
    photo.record.fields
      .filter((field) => field.group === "payslips")
      .every((field) => field.state === "draft"),
  );

  const all = applyStoredDraftConfirms(db, DEMO_CASES.purchase.id);
  assert.ok(all);
  assert.equal(all.confirmedCount, 31);
  assert.ok(
    all.record.fields.every(
      (field) =>
        field.state === "confirmed" || field.key === "photo_id.doc_number",
    ),
  );

  const overlay = replaceCaseOverlay(
    emptyOverlay(),
    DEMO_CASES.purchase.id,
    all.record.fields,
  );
  const signed = encodeFactFindOverlay(overlay, "test-overlay-secret");
  assert.ok(
    signed.length < 3500,
    `expected compressed overlay under 3500 bytes, got ${signed.length}`,
  );

  const packed = buildConfirmedFactFindExport(
    all.record.fields,
    {
      caseId: DEMO_CASES.purchase.id,
      clientLabel: DEMO_CASES.purchase.clientLabel,
      kind: "payg",
      exportedAt: "2026-09-12T00:00:00.000Z",
    },
    "csv",
  );
  assert.ok(!("error" in packed));
  assert.match(packed.body, /photo_id\.full_name/);
  assert.match(packed.body, /payslips\.employer_name/);
  assert.equal(packed.body.includes("photo_id.doc_number"), false);
  assert.match(packed.body, /SAMPLE \/ FAKE/);
});

test("README documents confirm-all and confirm-group with the acknowledgement", () => {
  const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
  assert.match(readme, /Confirm group \/ Confirm all/);
  assert.match(readme, /I have checked these draft values/);
  assert.match(readme, /never auto-lodges/);
  assert.match(readme, /Cleared fields stay cleared/);
});
