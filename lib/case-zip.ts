import { uploadPath } from "./files";
import { readBytes } from "./runtime-fs";
import {
  buildStoredRelativePath,
  caseZipDownloadName,
  extensionOf,
  selectFilesForPack,
  uniqueName,
  type PackScope,
} from "./pack";
import { loadDb } from "./store";
import type { CaseRecord } from "./types";
import { createZipStore } from "./zip";

export type ZipFileEntry = { name: string; data: Buffer };

export function collectCaseFileEntries(
  brokerId: string,
  caseId: string,
  scope: PackScope,
):
  | { caseRecord: CaseRecord; entries: ZipFileEntry[] }
  | { error: string; status: number } {
  const db = loadDb();
  const caseRecord = db.cases.find(
    (row) => row.id === caseId && row.brokerId === brokerId,
  );
  if (!caseRecord) {
    return { error: "Case not found.", status: 404 };
  }

  const items = db.items.filter((item) => item.caseId === caseId);
  const files = db.files.filter((file) =>
    items.some((item) => item.id === file.itemId),
  );
  const selected = selectFilesForPack(items, files, scope);
  const taken = new Set<string>();
  const entries: ZipFileEntry[] = [];

  for (const { item, file } of selected) {
    const path = uploadPath(file.storedName);
    if (!path) continue;
    const ext = extensionOf(file.storedName) || extensionOf(file.originalName) || ".bin";
    const preferred = buildStoredRelativePath(
      {
        caseId: caseRecord.id,
        docType: item.itemKey,
        clientLabel: caseRecord.clientLabel,
        status: item.status,
        uploadedAt: file.uploadedAt,
      },
      ext,
    );
    entries.push({
      name: uniqueName(preferred, taken),
      data: readBytes(path),
    });
  }

  return { caseRecord, entries };
}

export function buildCaseZip(
  brokerId: string,
  caseId: string,
  scope: PackScope,
): { filename: string; bytes: Buffer; count: number } | { error: string; status: number } {
  const collected = collectCaseFileEntries(brokerId, caseId, scope);
  if ("error" in collected) return collected;

  if (collected.entries.length === 0) {
    return {
      error:
        scope === "accepted"
          ? "No accepted documents to pack. Rejected, needs-resubmit and empty items are left out on purpose."
          : "No uploaded documents to pack.",
      status: 404,
    };
  }

  return {
    filename: caseZipDownloadName(collected.caseRecord.clientLabel, scope),
    bytes: createZipStore(collected.entries),
    count: collected.entries.length,
  };
}
