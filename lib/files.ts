import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { newId } from "./crypto";
import { UPLOAD_DIR } from "./paths";

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

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx).toLowerCase();
}

export function isAllowedUpload(name: string, mimeType: string): boolean {
  const ext = extensionOf(name);
  if (!ALLOWED_EXT.has(ext)) return false;
  if (!mimeType || mimeType === "application/octet-stream") {
    return true;
  }
  return ALLOWED_MIME.has(mimeType);
}

export async function saveUpload(file: File): Promise<{
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

  mkdirSync(UPLOAD_DIR, { recursive: true });
  const storedName = `${newId()}${extensionOf(file.name) || ".bin"}`;
  const target = join(process.cwd(), "data", "uploads", storedName);
  const readable = Readable.fromWeb(
    file.stream() as unknown as import("node:stream/web").ReadableStream,
  );
  await pipeline(readable, createWriteStream(target));
  return {
    storedName,
    sizeBytes: file.size,
    mimeType: file.type || "application/octet-stream",
  };
}

export function uploadPath(storedName: string): string | null {
  if (!storedName || storedName.includes("/") || storedName.includes("\\")) {
    return null;
  }
  const full = join(process.cwd(), "data", "uploads", storedName);
  if (!existsSync(full)) return null;
  return full;
}
