import assert from "node:assert/strict";
import { test } from "node:test";
import { buildCaseZip } from "../lib/case-zip";
import { DEMO_BROKER, DEMO_CASES } from "../lib/demo";
import { resetDemoData } from "../lib/seed-data";
import { saveDb } from "../lib/store";
import { listZipEntryNames } from "../lib/zip";

test("seeded Priya accepted zip packs only the bank statements file", () => {
  saveDb(resetDemoData());

  const accepted = buildCaseZip(
    DEMO_BROKER.id,
    DEMO_CASES.purchase.id,
    "accepted",
  );
  assert.ok(!("error" in accepted), "accepted zip should build");
  const acceptedNames = listZipEntryNames(accepted.bytes);
  assert.equal(acceptedNames.length, 1);
  assert.match(acceptedNames[0] ?? "", /cases\/case-demo-purchase\/bank_statements\//);
  assert.match(acceptedNames[0] ?? "", /SAMPLE-priya-nair-bank-statements-\d{8}-accepted\.pdf/);
  assert.ok(!acceptedNames.some((name) => /photo_id|secondary_id|payslips/.test(name)));

  const all = buildCaseZip(DEMO_BROKER.id, DEMO_CASES.purchase.id, "all");
  assert.ok(!("error" in all), "all-uploaded zip should build");
  const allNames = listZipEntryNames(all.bytes);
  assert.equal(allNames.length, 4);
  assert.ok(allNames.some((name) => name.includes("secondary_id")));
  assert.ok(allNames.some((name) => name.includes("rejected-resubmit")));

  const tom = buildCaseZip(
    DEMO_BROKER.id,
    DEMO_CASES.refinance.id,
    "accepted",
  );
  assert.ok("error" in tom);
  assert.match(tom.error, /No accepted documents/);
});
