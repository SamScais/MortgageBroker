import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveUploadPath } from "../lib/files";
import {
  buildStoredRelativePath,
  caseZipDownloadName,
  clientSlug,
  packedFilename,
  selectFilesForPack,
  shouldIncludeItemInZip,
  yyyymmdd,
} from "../lib/pack";
import { createZipStore, listZipEntryNames } from "../lib/zip";
import type { ChecklistItem, StoredFile } from "../lib/types";

function item(
  id: string,
  status: ChecklistItem["status"],
  itemKey = id,
): ChecklistItem {
  return {
    id,
    caseId: "case-demo-purchase",
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

function file(itemId: string, uploadedAt = "2026-09-12T00:00:00.000Z"): StoredFile {
  return {
    id: `file-${itemId}`,
    itemId,
    originalName: `${itemId}.pdf`,
    storedName: `cases/case-demo-purchase/${itemId}/SAMPLE-priya-nair-${itemId}-20260912-uploaded.pdf`,
    mimeType: "application/pdf",
    sizeBytes: 12,
    uploadedAt,
  };
}

test("packed filenames keep SAMPLE labelling and AU date", () => {
  const name = packedFilename(
    {
      caseId: "case-demo-purchase",
      docType: "photo_id",
      clientLabel: "SAMPLE Client — Priya Nair",
      status: "accepted",
      uploadedAt: "2026-09-12T10:00:00.000Z",
    },
    ".pdf",
  );
  assert.equal(name, "SAMPLE-priya-nair-photo-id-20260912-accepted.pdf");
  assert.equal(clientSlug("SAMPLE Client — Tom Brennan"), "tom-brennan");
  assert.equal(yyyymmdd("2026-09-12T14:00:00.000Z"), "20260913");
});

test("on-disk path is cases/caseId/docType/filename", () => {
  const path = buildStoredRelativePath(
    {
      caseId: "case-demo-purchase",
      docType: "bank_statements",
      clientLabel: "SAMPLE Client — Priya Nair",
      status: "accepted",
      uploadedAt: "2026-09-12T00:00:00.000Z",
    },
    ".pdf",
  );
  assert.equal(
    path,
    "cases/case-demo-purchase/bank_statements/SAMPLE-priya-nair-bank-statements-20260912-accepted.pdf",
  );
});

test("accepted-only zip skips rejected, review, uploaded and empty items", () => {
  const items = [
    item("bank_statements", "accepted"),
    item("secondary_id", "rejected_resubmit"),
    item("photo_id", "needs_review"),
    item("payslips", "uploaded"),
    item("contract_of_sale", "needed"),
  ];
  const files = [
    file("bank_statements"),
    file("secondary_id"),
    file("photo_id"),
    file("payslips"),
  ];

  assert.equal(shouldIncludeItemInZip("accepted", "accepted"), true);
  assert.equal(shouldIncludeItemInZip("rejected_resubmit", "accepted"), false);
  assert.equal(shouldIncludeItemInZip("needed", "accepted"), false);
  assert.equal(shouldIncludeItemInZip("needed", "all"), false);

  const accepted = selectFilesForPack(items, files, "accepted");
  assert.deepEqual(
    accepted.map((row) => row.item.itemKey),
    ["bank_statements"],
  );

  const all = selectFilesForPack(items, files, "all");
  assert.deepEqual(
    all.map((row) => row.item.itemKey).sort(),
    ["bank_statements", "payslips", "photo_id", "secondary_id"],
  );
});

test("accepted zip uses the latest file only so an old reject is not packed", () => {
  const items = [item("photo_id", "accepted")];
  const files = [
    file("photo_id", "2026-09-01T00:00:00.000Z"),
    {
      ...file("photo_id", "2026-09-12T00:00:00.000Z"),
      id: "file-photo_id-new",
    },
  ];
  const accepted = selectFilesForPack(items, files, "accepted");
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0]?.file.id, "file-photo_id-new");
});

test("upload paths stay inside the uploads directory", () => {
  assert.equal(resolveUploadPath("../secret.pdf"), null);
  assert.equal(resolveUploadPath("cases/../x.pdf"), null);
  assert.equal(resolveUploadPath("/tmp/x.pdf"), null);
  const nested = resolveUploadPath(
    "cases/case-demo-purchase/bank_statements/SAMPLE-priya-nair-bank-statements-20260912-accepted.pdf",
  );
  assert.ok(nested?.includes("/data/uploads/cases/case-demo-purchase/"));
});

test("zip writer lists packed entry names", () => {
  const zip = createZipStore([
    {
      name: "cases/case-demo-purchase/bank_statements/SAMPLE-priya-nair-bank-statements-20260912-accepted.pdf",
      data: Buffer.from("%PDF-SAMPLE"),
    },
  ]);
  assert.deepEqual(listZipEntryNames(zip), [
    "cases/case-demo-purchase/bank_statements/SAMPLE-priya-nair-bank-statements-20260912-accepted.pdf",
  ]);
  assert.match(
    caseZipDownloadName("SAMPLE Client — Priya Nair", "accepted", new Date("2026-09-12T00:00:00.000Z")),
    /^SAMPLE-priya-nair-accepted-\d{8}\.zip$/,
  );
});
