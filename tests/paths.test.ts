import assert from "node:assert/strict";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  appUrl,
  clientUploadUrl,
  dataDir,
  dbPath,
  uploadDir,
  usesEphemeralStorage,
} from "../lib/paths";

test("local defaults stay under ./data", () => {
  const env = {};
  assert.equal(usesEphemeralStorage(env), false);
  assert.equal(dataDir(env), join(process.cwd(), "data"));
  assert.equal(dbPath(env), join(process.cwd(), "data", "db.json"));
  assert.equal(uploadDir(env), join(process.cwd(), "data", "uploads"));
  assert.equal(appUrl(env), "http://localhost:3000");
});

test("Vercel preview uses the writable temp dir", () => {
  const env = { VERCEL: "1", VERCEL_ENV: "preview" };
  assert.equal(usesEphemeralStorage(env), true);
  assert.equal(dataDir(env), join(tmpdir(), "mortgage-broker-intake"));
  assert.equal(dbPath(env), join(tmpdir(), "mortgage-broker-intake", "db.json"));
  assert.equal(
    uploadDir(env),
    join(tmpdir(), "mortgage-broker-intake", "uploads"),
  );
});

test("explicit DATA_DIR / DATABASE_PATH / UPLOAD_DIR win over Vercel defaults", () => {
  const env = {
    VERCEL: "1",
    DATA_DIR: "/tmp/custom-mb",
    DATABASE_PATH: "/tmp/custom-db.json",
    UPLOAD_DIR: "/tmp/custom-uploads",
  };
  assert.equal(dataDir(env), "/tmp/custom-mb");
  assert.equal(dbPath(env), "/tmp/custom-db.json");
  assert.equal(uploadDir(env), "/tmp/custom-uploads");
});

test("copied client links use VERCEL_URL when NEXT_PUBLIC_APP_URL is unset", () => {
  assert.equal(
    appUrl({ VERCEL_URL: "mortgage-broker-git-review.vercel.app" }),
    "https://mortgage-broker-git-review.vercel.app",
  );
  assert.equal(
    clientUploadUrl("demo-purchase-priya", {
      VERCEL_URL: "https://mortgage-broker-git-review.vercel.app/",
    }),
    "https://mortgage-broker-git-review.vercel.app/u/demo-purchase-priya",
  );
  assert.equal(
    appUrl({
      NEXT_PUBLIC_APP_URL: "https://example.test/",
      VERCEL_URL: "ignored.vercel.app",
    }),
    "https://example.test",
  );
});
