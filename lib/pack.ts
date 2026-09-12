import type { ChecklistItem, ItemStatus, StoredFile } from "./types";

export const PACK_SCOPES = ["accepted", "all"] as const;
export type PackScope = (typeof PACK_SCOPES)[number];

export type PackedNameInput = {
  caseId: string;
  docType: string;
  clientLabel: string;
  status: ItemStatus;
  uploadedAt: string;
};

const STATUS_SLUG: Record<ItemStatus, string> = {
  needed: "needed",
  uploaded: "uploaded",
  needs_review: "needs-review",
  accepted: "accepted",
  rejected_resubmit: "rejected-resubmit",
};

export function isPackScope(value: string): value is PackScope {
  return PACK_SCOPES.includes(value as PackScope);
}

export function extensionOf(name: string): string {
  const idx = name.lastIndexOf(".");
  if (idx < 0) return "";
  return name.slice(idx).toLowerCase();
}

export function slugify(value: string, fallback = "item"): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug || fallback;
}

export function sanitizePathPart(value: string, fallback = "item"): string {
  const cleaned = value
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

export function clientSlug(label: string): string {
  const withoutSample = label
    .replace(/^SAMPLE(\s+Client)?\s*[—–-]\s*/i, "")
    .trim();
  return slugify(withoutSample, "client");
}

export function statusSlug(status: ItemStatus): string {
  return STATUS_SLUG[status] ?? slugify(status, "status");
}

export function yyyymmdd(
  value: string | Date = new Date(),
  timeZone = "Australia/Sydney",
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return yyyymmdd(new Date(), timeZone);
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  return `${year}${month}${day}`;
}

export function packedFilename(input: PackedNameInput, ext: string): string {
  const suffix = ext.startsWith(".") ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const safeExt = /^\.[a-z0-9]+$/.test(suffix) ? suffix : ".bin";
  const client = clientSlug(input.clientLabel);
  const docType = slugify(input.docType.replace(/_/g, "-"), "document");
  const day = yyyymmdd(input.uploadedAt);
  const status = statusSlug(input.status);
  return `SAMPLE-${client}-${docType}-${day}-${status}${safeExt}`;
}

export function buildStoredRelativePath(
  input: PackedNameInput,
  ext: string,
): string {
  const filename = packedFilename(input, ext);
  return [
    "cases",
    sanitizePathPart(input.caseId, "case"),
    sanitizePathPart(input.docType, "document"),
    filename,
  ].join("/");
}

export function caseZipDownloadName(
  clientLabel: string,
  scope: PackScope,
  now = new Date(),
): string {
  const kind = scope === "accepted" ? "accepted" : "all-uploaded";
  return `SAMPLE-${clientSlug(clientLabel)}-${kind}-${yyyymmdd(now)}.zip`;
}

export function shouldIncludeItemInZip(
  status: ItemStatus,
  scope: PackScope,
): boolean {
  if (scope === "accepted") return status === "accepted";
  return status !== "needed";
}

export function latestFileForItem(
  files: StoredFile[],
  itemId: string,
): StoredFile | undefined {
  return files
    .filter((file) => file.itemId === itemId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
}

export function selectFilesForPack(
  items: ChecklistItem[],
  files: StoredFile[],
  scope: PackScope,
): Array<{ item: ChecklistItem; file: StoredFile }> {
  const selected: Array<{ item: ChecklistItem; file: StoredFile }> = [];
  for (const item of items) {
    if (!shouldIncludeItemInZip(item.status, scope)) continue;
    if (scope === "accepted") {
      const latest = latestFileForItem(files, item.id);
      if (latest) selected.push({ item, file: latest });
      continue;
    }
    const itemFiles = files
      .filter((file) => file.itemId === item.id)
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
    for (const file of itemFiles) {
      selected.push({ item, file });
    }
  }
  return selected;
}

export function uniqueName(preferred: string, taken: Set<string>): string {
  if (!taken.has(preferred)) {
    taken.add(preferred);
    return preferred;
  }
  const dot = preferred.lastIndexOf(".");
  const stem = dot > 0 ? preferred.slice(0, dot) : preferred;
  const ext = dot > 0 ? preferred.slice(dot) : "";
  let n = 2;
  let candidate = `${stem}-${n}${ext}`;
  while (taken.has(candidate)) {
    n += 1;
    candidate = `${stem}-${n}${ext}`;
  }
  taken.add(candidate);
  return candidate;
}

export function contentDisposition(
  filename: string,
  kind: "inline" | "attachment",
): string {
  const safe = filename.replace(/["\\]/g, "").replace(/[^\x20-\x7E]/g, "_");
  return `${kind}; filename="${safe}"`;
}
