import { AsyncLocalStorage } from "node:async_hooks";
import { deflateSync, inflateSync } from "node:zlib";
import { signValue, verifySignedValue } from "./crypto";
import type { Database, FactFindField, FactFindFieldState, FactFindRecord } from "./types";

export const FACT_FIND_OVERLAY_COOKIE = "mb_ff";

export type OverlayEntry = {
  state: Exclude<FactFindFieldState, "draft">;
  value?: string;
  confirmedAt?: string;
};

export type FactFindOverlay = {
  v: 1;
  brokerId?: string;
  cases: Record<string, Record<string, OverlayEntry>>;
};

type CompactEntry = ["c", string] | ["c", string, string] | ["x"];

type CompactOverlay = {
  v: 1;
  b?: string;
  c: Record<string, Record<string, CompactEntry>>;
};

const overlayAls = new AsyncLocalStorage<FactFindOverlay>();

export function emptyOverlay(brokerId?: string): FactFindOverlay {
  return { v: 1, brokerId, cases: {} };
}

export function overlayIsEmpty(overlay: FactFindOverlay): boolean {
  return Object.keys(overlay.cases).length === 0;
}

export function runWithFactFindOverlay<T>(
  overlay: FactFindOverlay,
  fn: () => T,
): T {
  return overlayAls.run(overlay, fn);
}

export function requestFactFindOverlay(): FactFindOverlay {
  return overlayAls.getStore() ?? emptyOverlay();
}

function compactEntry(entry: OverlayEntry): CompactEntry {
  if (entry.state === "cleared") return ["x"];
  const at = entry.confirmedAt ?? "";
  if (entry.value) return ["c", at, entry.value];
  return ["c", at];
}

function expandEntry(raw: CompactEntry): OverlayEntry | null {
  if (!Array.isArray(raw)) return null;
  if (raw[0] === "x") return { state: "cleared" };
  if (raw[0] === "c") {
    const confirmedAt = raw[1] || undefined;
    const value = raw.length > 2 ? raw[2] : undefined;
    return value
      ? { state: "confirmed", confirmedAt, value }
      : { state: "confirmed", confirmedAt };
  }
  return null;
}

function toCompact(overlay: FactFindOverlay): CompactOverlay {
  const cases: CompactOverlay["c"] = {};
  for (const [caseId, fields] of Object.entries(overlay.cases)) {
    const compactFields: Record<string, CompactEntry> = {};
    for (const [key, entry] of Object.entries(fields)) {
      compactFields[key] = compactEntry(entry);
    }
    if (Object.keys(compactFields).length > 0) {
      cases[caseId] = compactFields;
    }
  }
  return {
    v: 1,
    ...(overlay.brokerId ? { b: overlay.brokerId } : {}),
    c: cases,
  };
}

export function normalizeOverlay(value: unknown): FactFindOverlay | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<CompactOverlay> & Partial<FactFindOverlay>;
  if (raw.v !== 1) return null;

  const cases: FactFindOverlay["cases"] = {};
  const compactCases = raw.c && typeof raw.c === "object" ? raw.c : raw.cases;
  if (!compactCases || typeof compactCases !== "object") {
    return emptyOverlay(typeof raw.b === "string" ? raw.b : raw.brokerId);
  }

  for (const [caseId, fields] of Object.entries(compactCases)) {
    if (!fields || typeof fields !== "object") continue;
    const next: Record<string, OverlayEntry> = {};
    for (const [key, entry] of Object.entries(fields)) {
      if (entry && typeof entry === "object" && "state" in entry) {
        const state = (entry as OverlayEntry).state;
        if (state !== "confirmed" && state !== "cleared") continue;
        next[key] = {
          state,
          ...((entry as OverlayEntry).value
            ? { value: (entry as OverlayEntry).value }
            : {}),
          ...((entry as OverlayEntry).confirmedAt
            ? { confirmedAt: (entry as OverlayEntry).confirmedAt }
            : {}),
        };
        continue;
      }
      const expanded = expandEntry(entry as CompactEntry);
      if (expanded) next[key] = expanded;
    }
    if (Object.keys(next).length > 0) cases[caseId] = next;
  }

  return {
    v: 1,
    brokerId:
      typeof raw.b === "string"
        ? raw.b
        : typeof raw.brokerId === "string"
          ? raw.brokerId
          : undefined,
    cases,
  };
}

export function encodeFactFindOverlay(
  overlay: FactFindOverlay,
  secret: string,
): string {
  const json = JSON.stringify(toCompact(overlay));
  const compressed = deflateSync(Buffer.from(json, "utf8")).toString("base64url");
  return signValue(compressed, secret);
}

export function decodeFactFindOverlay(
  signed: string,
  secret: string,
): FactFindOverlay | null {
  const compressed = verifySignedValue(signed, secret);
  if (!compressed) return null;
  try {
    const json = inflateSync(Buffer.from(compressed, "base64url")).toString("utf8");
    return normalizeOverlay(JSON.parse(json));
  } catch {
    return null;
  }
}

export function entryFromField(field: FactFindField): OverlayEntry | null {
  if (field.state === "draft") return null;
  if (field.state === "cleared") return { state: "cleared" };
  const edited = field.value.trim() !== field.draftValue.trim();
  return {
    state: "confirmed",
    ...(field.confirmedAt ? { confirmedAt: field.confirmedAt } : {}),
    ...(edited ? { value: field.value } : {}),
  };
}

export function replaceCaseOverlay(
  overlay: FactFindOverlay,
  caseId: string,
  fields: FactFindField[],
  brokerId?: string,
): FactFindOverlay {
  const caseMap: Record<string, OverlayEntry> = {};
  for (const field of fields) {
    const entry = entryFromField(field);
    if (entry) caseMap[field.key] = entry;
  }
  const cases = { ...overlay.cases };
  if (Object.keys(caseMap).length === 0) delete cases[caseId];
  else cases[caseId] = caseMap;
  return {
    v: 1,
    brokerId: brokerId ?? overlay.brokerId,
    cases,
  };
}

export function applyOverlayToField(
  field: FactFindField,
  entry: OverlayEntry | undefined,
): FactFindField {
  if (!entry) return field;
  if (entry.state === "cleared") {
    return {
      ...field,
      state: "cleared",
      value: "",
      confirmedAt: null,
    };
  }
  const value = entry.value?.trim() || field.value.trim() || field.draftValue;
  return {
    ...field,
    state: "confirmed",
    value,
    confirmedAt: entry.confirmedAt ?? field.confirmedAt ?? null,
  };
}

export function applyOverlayToRecord(
  record: FactFindRecord,
  overlay: FactFindOverlay,
): FactFindRecord {
  const caseOverlay = overlay.cases[record.caseId];
  if (!caseOverlay) return record;
  return {
    ...record,
    fields: record.fields.map((field) =>
      applyOverlayToField(field, caseOverlay[field.key]),
    ),
  };
}

export function applyOverlayToDb(
  db: Database,
  overlay: FactFindOverlay,
): Database {
  if (overlayIsEmpty(overlay)) return db;
  db.factFinds = db.factFinds.map((record) =>
    applyOverlayToRecord(record, overlay),
  );
  return db;
}
