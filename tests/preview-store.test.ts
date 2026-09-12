import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { DEMO_BROKER } from "../lib/demo";
import { loadDb } from "../lib/store";

test("missing db on a writable temp dir seeds SAMPLE demo login and files", () => {
  const dir = mkdtempSync(join(tmpdir(), "mb-preview-"));
  const previous = process.env.DATA_DIR;
  process.env.DATA_DIR = dir;
  try {
    const db = loadDb();
    assert.equal(db.brokers.length, 1);
    assert.equal(db.brokers[0].email, DEMO_BROKER.email);
    assert.ok(db.cases.some((row) => row.clientLabel.includes("Priya")));
    assert.ok(existsSync(join(dir, "db.json")));
    assert.ok(
      db.files.length > 0 &&
        db.files.every((file) => existsSync(join(dir, "uploads", file.storedName))),
      "seeded SAMPLE PDFs should land under the temp upload dir",
    );
  } finally {
    if (previous === undefined) delete process.env.DATA_DIR;
    else process.env.DATA_DIR = previous;
    rmSync(dir, { recursive: true, force: true });
  }
});
