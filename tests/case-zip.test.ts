import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaseZip } from "../lib/case-zip";
import { DEMO_BROKER, DEMO_CASES } from "../lib/demo";
import { resetDemoData } from "../lib/seed-data";
import { saveDb } from "../lib/store";
import { listZipEntryNames } from "../lib/zip";

test("seeded Priya accepted zip packs only accepted documents", () => {
  saveDb(resetDemoData());

  const accepted = buildCaseZip(
    DEMO_BROKER.id,
    DEMO_CASES.purchase.id,
    "accepted",
  );
  assert.ok(!("error" in accepted), "accepted zip should build");
  const acceptedNames = listZipEntryNames(accepted.bytes);
  assert.equal(acceptedNames.length, 5);
  for (const docType of [
    "bank_statements",
    "photo_id",
    "payslips",
    "secondary_id",
    "existing_debts",
  ]) {
    assert.ok(
      acceptedNames.some((name) => name.includes(`/${docType}/`)),
      `missing ${docType}`,
    );
  }
  assert.ok(
    !acceptedNames.some((name) =>
      /employment_letter|contract_of_sale|genuine_savings/.test(name),
    ),
  );

  const all = buildCaseZip(DEMO_BROKER.id, DEMO_CASES.purchase.id, "all");
  assert.ok(!("error" in all), "all-uploaded zip should build");
  const allNames = listZipEntryNames(all.bytes);
  assert.equal(allNames.length, 5);
  assert.ok(allNames.every((name) => name.includes("-accepted.pdf")));

  const tom = buildCaseZip(
    DEMO_BROKER.id,
    DEMO_CASES.refinance.id,
    "accepted",
  );
  assert.ok("error" in tom);
  assert.match(tom.error, /No accepted documents/);
});
