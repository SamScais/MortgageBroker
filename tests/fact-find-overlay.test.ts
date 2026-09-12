import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEMO_CASES } from "../lib/demo";
import { applyStoredFieldAction } from "../lib/fact-find";
import { buildConfirmedFactFindExport } from "../lib/fact-find-export";
import {
  applyOverlayToDb,
  decodeFactFindOverlay,
  emptyOverlay,
  encodeFactFindOverlay,
  replaceCaseOverlay,
  runWithFactFindOverlay,
} from "../lib/fact-find-overlay";
import { resetDemoData } from "../lib/seed-data";
import { loadDb, saveDb } from "../lib/store";

const SECRET = "test-overlay-secret";

function confirmPriyaName(db = resetDemoData()) {
  const updated = applyStoredFieldAction(
    db,
    DEMO_CASES.purchase.id,
    "photo_id.full_name",
    "confirm",
    undefined,
  );
  assert.ok(updated);
  return { db, updated };
}

test("signed overlay round-trips and rejects a tampered payload", () => {
  const { updated } = confirmPriyaName();
  const overlay = replaceCaseOverlay(
    emptyOverlay("broker-demo-sam"),
    DEMO_CASES.purchase.id,
    updated.fields,
    "broker-demo-sam",
  );
  const signed = encodeFactFindOverlay(overlay, SECRET);
  const decoded = decodeFactFindOverlay(signed, SECRET);
  assert.ok(decoded);
  assert.equal(
    decoded.cases[DEMO_CASES.purchase.id]?.["photo_id.full_name"]?.state,
    "confirmed",
  );
  assert.equal(
    decoded.cases[DEMO_CASES.purchase.id]?.["photo_id.full_name"]?.value,
    undefined,
    "confirm-without-edit should omit the SAMPLE value to keep the cookie small",
  );

  const tampered = `${signed.slice(0, -2)}xx`;
  assert.equal(decodeFactFindOverlay(tampered, SECRET), null);
  assert.equal(decodeFactFindOverlay(signed, "wrong-secret"), null);
});

test("overlay merge restores confirms onto a freshly seeded instance", () => {
  const { db, updated } = confirmPriyaName();
  const overlay = replaceCaseOverlay(
    emptyOverlay(),
    DEMO_CASES.purchase.id,
    updated.fields,
  );
  applyStoredFieldAction(db, DEMO_CASES.purchase.id, "photo_id.doc_number", "clear");
  const cleared = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(cleared);
  const withClear = replaceCaseOverlay(overlay, DEMO_CASES.purchase.id, cleared.fields);

  const fresh = resetDemoData();
  const nameBefore = fresh.factFinds
    .find((row) => row.caseId === DEMO_CASES.purchase.id)
    ?.fields.find((field) => field.key === "photo_id.full_name");
  assert.equal(nameBefore?.state, "draft");

  applyOverlayToDb(fresh, withClear);
  const after = fresh.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.equal(
    after?.fields.find((field) => field.key === "photo_id.full_name")?.state,
    "confirmed",
  );
  assert.match(
    after?.fields.find((field) => field.key === "photo_id.full_name")?.value ?? "",
    /Priya Nair/,
  );
  assert.equal(
    after?.fields.find((field) => field.key === "photo_id.doc_number")?.state,
    "cleared",
  );
});

test("export on a second ephemeral DATA_DIR uses the cookie overlay", () => {
  const dirA = mkdtempSync(join(tmpdir(), "mb-ff-a-"));
  const dirB = mkdtempSync(join(tmpdir(), "mb-ff-b-"));
  const previous = process.env.DATA_DIR;

  try {
    process.env.DATA_DIR = dirA;
    const dbA = loadDb();
    applyStoredFieldAction(
      dbA,
      DEMO_CASES.purchase.id,
      "photo_id.full_name",
      "confirm",
    );
    applyStoredFieldAction(
      dbA,
      DEMO_CASES.purchase.id,
      "payslips.employer_name",
      "edit",
      "SAMPLE Harbour Legal (broker-edited)",
    );
    saveDb(dbA);
    const recordA = dbA.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
    assert.ok(recordA);
    const overlay = replaceCaseOverlay(
      emptyOverlay(),
      DEMO_CASES.purchase.id,
      recordA.fields,
    );

    process.env.DATA_DIR = dirB;
    const isolated = loadDb();
    const isolatedName = isolated.factFinds
      .find((row) => row.caseId === DEMO_CASES.purchase.id)
      ?.fields.find((field) => field.key === "photo_id.full_name");
    assert.equal(isolatedName?.state, "draft", "new instance must seed drafts only");

    const exported = runWithFactFindOverlay(overlay, () => {
      const dbB = loadDb();
      const factFind = dbB.factFinds.find(
        (row) => row.caseId === DEMO_CASES.purchase.id,
      );
      assert.equal(
        factFind?.fields.find((field) => field.key === "photo_id.full_name")
          ?.state,
        "confirmed",
      );
      assert.equal(
        factFind?.fields.find((field) => field.key === "payslips.employer_name")
          ?.value,
        "SAMPLE Harbour Legal (broker-edited)",
      );
      const caseRecord = dbB.cases.find((row) => row.id === DEMO_CASES.purchase.id);
      assert.ok(caseRecord);
      return buildConfirmedFactFindExport(
        factFind?.fields ?? [],
        {
          caseId: caseRecord.id,
          clientLabel: caseRecord.clientLabel,
          kind: "payg",
          exportedAt: "2026-09-12T00:00:00.000Z",
        },
        "csv",
      );
    });

    assert.ok(!("error" in exported), "overlay-backed export must not be empty");
    assert.match(exported.body, /photo_id\.full_name/);
    assert.match(exported.body, /payslips\.employer_name/);
    assert.match(exported.body, /Harbour Legal \(broker-edited\)/);
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    rmSync(dirA, { recursive: true, force: true });
    rmSync(dirB, { recursive: true, force: true });
  }
});

test("confirming every Priya field still fits in a browser cookie", () => {
  const db = resetDemoData();
  const record = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(record);
  for (const field of record.fields) {
    applyStoredFieldAction(db, DEMO_CASES.purchase.id, field.key, "confirm");
  }
  const confirmed = db.factFinds.find((row) => row.caseId === DEMO_CASES.purchase.id);
  assert.ok(confirmed);
  assert.ok(confirmed.fields.every((field) => field.state === "confirmed"));
  const overlay = replaceCaseOverlay(
    emptyOverlay(),
    DEMO_CASES.purchase.id,
    confirmed.fields,
  );
  const signed = encodeFactFindOverlay(overlay, SECRET);
  assert.ok(
    signed.length < 3500,
    `expected compressed overlay under 3500 bytes, got ${signed.length}`,
  );
});

test("README documents Vercel cookie persistence vs local db.json", () => {
  const readme = readFileSync(join(process.cwd(), "README.md"), "utf8");
  assert.match(readme, /Signed httpOnly cookie `mb_ff`/);
  assert.match(readme, /data\/db\.json/);
  assert.match(readme, /No Vercel Blob or KV token is required/);
  assert.match(readme, /merge the signed cookie overlay/);
});
