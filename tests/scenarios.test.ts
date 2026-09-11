import assert from "node:assert/strict";
import { test } from "node:test";
import { getScenario, SCENARIOS } from "../lib/scenarios";
import { buildReminderEmail } from "../lib/reminders";
import { isAllowedUpload } from "../lib/files";

test("purchase and refinance checklists are seeded", () => {
  assert.ok(SCENARIOS.some((row) => row.id === "purchase"));
  assert.ok(SCENARIOS.some((row) => row.id === "refinance"));
  const purchase = getScenario("purchase");
  const refinance = getScenario("refinance");
  assert.ok(purchase && purchase.items.length >= 6);
  assert.ok(refinance && refinance.items.length >= 6);
  assert.ok(purchase.items.some((item) => item.key === "contract_of_sale"));
  assert.ok(
    refinance.items.some((item) => item.key === "current_loan_statement"),
  );
});

test("reminder copy is labelled as demo", () => {
  const email = buildReminderEmail({
    clientLabel: "SAMPLE Client — Test",
    clientEmail: "test@demo.local",
    scenarioName: "Purchase",
    dueAt: "2026-09-18T17:00:00.000Z",
    outstandingTitles: ["Photo identification"],
    uploadUrl: "http://localhost:3000/u/demo",
  });
  assert.match(email.subject, /documents still needed/i);
  assert.match(email.body, /DEMO \/ SAMPLE reminder/);
  assert.match(email.body, /Photo identification/);
});

test("upload allow-list accepts common AU phone captures", () => {
  assert.equal(isAllowedUpload("licence.jpg", "image/jpeg"), true);
  assert.equal(isAllowedUpload("statement.pdf", "application/pdf"), true);
  assert.equal(isAllowedUpload("notes.exe", "application/octet-stream"), false);
});
