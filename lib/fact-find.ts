import { nowIso } from "./crypto";
import { extractDraftFields } from "./fact-find-extract";
import {
  applyDraftConfirmsToRecord,
  applyFieldActionToRecord,
  mergeExtractedFields,
  type BulkConfirmFilter,
  type FactFindFieldAction,
} from "./fact-find-state";
import type {
  CaseRecord,
  ChecklistItem,
  Database,
  FactFindRecord,
  StoredFile,
} from "./types";

export function syncFactFindOnDb(
  db: Database,
  caseRecord: CaseRecord,
  items: ChecklistItem[],
  files: StoredFile[],
): FactFindRecord {
  const extracted = extractDraftFields({ caseRecord, items, files });
  const existing = db.factFinds.find((row) => row.caseId === caseRecord.id);
  const now = nowIso();

  if (!existing) {
    const created: FactFindRecord = {
      id: `factfind-${caseRecord.id}`,
      caseId: caseRecord.id,
      kind: "payg",
      fields: extracted,
      extractedAt: now,
      updatedAt: now,
    };
    db.factFinds.push(created);
    return created;
  }

  existing.fields = mergeExtractedFields(existing.fields, extracted);
  existing.extractedAt = now;
  existing.updatedAt = now;
  return existing;
}

export function applyStoredFieldAction(
  db: Database,
  caseId: string,
  fieldKey: string,
  action: FactFindFieldAction,
  nextValue?: string,
): FactFindRecord | null {
  const index = db.factFinds.findIndex((row) => row.caseId === caseId);
  if (index < 0) return null;
  const current = db.factFinds[index];
  if (!current) return null;
  if (!current.fields.some((field) => field.key === fieldKey)) return null;
  const next = applyFieldActionToRecord(current, fieldKey, action, nextValue, nowIso());
  db.factFinds[index] = next;
  return next;
}

export function applyStoredDraftConfirms(
  db: Database,
  caseId: string,
  filter?: BulkConfirmFilter,
): { record: FactFindRecord; confirmedCount: number } | null {
  const index = db.factFinds.findIndex((row) => row.caseId === caseId);
  if (index < 0) return null;
  const current = db.factFinds[index];
  if (!current) return null;
  const { record, confirmedKeys } = applyDraftConfirmsToRecord(
    current,
    filter,
    nowIso(),
  );
  db.factFinds[index] = record;
  return { record, confirmedCount: confirmedKeys.length };
}
