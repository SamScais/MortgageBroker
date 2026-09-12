import { dirname, join, resolve, sep } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { isProductionBuild } from "./build-phase";
import {
  buildStoredRelativePath,
  extensionOf,
  packedFilename,
  uniqueName,
  type PackedNameInput,
} from "./pack";
import { uploadDir } from "./paths";
import {
  fileExists,
  makeDir,
  openWriteStream,
  renameFile,
} from "./runtime-fs";
import type { ItemStatus } from "./types";

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXT = new Set([
  ".pdf",
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
]);

export { extensionOf } from "./pack";

export function isAllowedUpload(name: string, mimeType: string): boolean {
  const ext = extensionOf(name);
  if (!ALLOWED_EXT.has(ext)) return false;
  if (!mimeType || mimeType === "application/octet-stream") {
    return true;
  }
  return ALLOWED_MIME.has(mimeType);
}

export type SaveUploadMeta = {
  caseId: string;
  docType: string;
  clientLabel: string;
  status: ItemStatus;
  uploadedAt?: string;
};

function nameInput(meta: SaveUploadMeta): PackedNameInput {
  return {
    caseId: meta.caseId,
    docType: meta.docType,
    clientLabel: meta.clientLabel,
    status: meta.status,
    uploadedAt: meta.uploadedAt ?? new Date().toISOString(),
  };
}

export function resolveUploadPath(storedName: string): string | null {
  if (!storedName || storedName.includes("\0") || storedName.includes("\\")) {
    return null;
  }
  const parts = storedName.split("/");
  if (
    parts.length === 0 ||
    parts.some((part) => part === "" || part === "." || part === "..")
  ) {
    return null;
  }
  const root = resolve(uploadDir());
  const full = resolve(root, ...parts);
  if (full !== root && !full.startsWith(root + sep)) {
    return null;
  }
  return full;
}

export function uploadPath(storedName: string): string | null {
  if (isProductionBuild()) return null;
  const full = resolveUploadPath(storedName);
  if (!full || !fileExists(full)) return null;
  return full;
}

function allocateRelativePath(preferred: string): string {
  const taken = new Set<string>();
  let candidate = preferred;
  while (fileExists(join(uploadDir(), candidate))) {
    taken.add(candidate);
    candidate = uniqueName(preferred, taken);
  }
  return candidate;
}

export function plannedStoredName(meta: SaveUploadMeta, originalName: string): string {
  return allocateRelativePath(
    buildStoredRelativePath(nameInput(meta), extensionOf(originalName) || ".bin"),
  );
}

export function packedDownloadName(
  meta: SaveUploadMeta,
  originalName: string,
): string {
  return packedFilename(nameInput(meta), extensionOf(originalName) || ".bin");
}

export async function saveUpload(
  file: File,
  meta: SaveUploadMeta,
): Promise<{
  storedName: string;
  sizeBytes: number;
  mimeType: string;
}> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("File is larger than 10 MB.");
  }
  if (!isAllowedUpload(file.name, file.type)) {
    throw new Error(
      "Please upload a PDF or photo (JPG, PNG, WEBP or HEIC).",
    );
  }

  makeDir(uploadDir());
  const storedName = plannedStoredName(meta, file.name);
  const target = resolveUploadPath(storedName);
  if (!target) {
    throw new Error("Could not store that file.");
  }
  makeDir(dirname(target));
  const readable = Readable.fromWeb(
    file.stream() as unknown as import("node:stream/web").ReadableStream,
  );
  await pipeline(readable, openWriteStream(target));
  return {
    storedName,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export function relocateStoredFile(
  storedName: string,
  meta: SaveUploadMeta,
  originalName: string,
): string {
  const from = uploadPath(storedName);
  if (!from) return storedName;
  const preferred = buildStoredRelativePath(
    nameInput(meta),
    extensionOf(storedName) || extensionOf(originalName) || ".bin",
  );
  if (preferred === storedName) return storedName;
  const nextName = allocateRelativePath(preferred);
  const target = resolveUploadPath(nextName);
  if (!target) return storedName;
  makeDir(dirname(target));
  renameFile(from, target);
  return nextName;
}
