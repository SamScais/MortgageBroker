import { clientUploadUrl } from "./paths";
import { getScenario } from "./scenarios";
import { caseIsOverdue } from "./reminders";
import { caseNeedsAttention } from "./status";
import { loadDb } from "./store";
import { countFieldStates } from "./fact-find-state";
import type {
  CaseRecord,
  ChecklistItem,
  FactFindRecord,
  ReminderLog,
  StoredFile,
} from "./types";

export type CaseWithMeta = CaseRecord & {
  scenarioName: string;
  uploadUrl: string;
  overdue: boolean;
  needsAttention: boolean;
  outstandingCount: number;
  reviewCount: number;
  acceptedCount: number;
  itemCount: number;
  factFindDraftCount: number;
  factFindConfirmedCount: number;
};

export function itemsForCase(caseId: string): ChecklistItem[] {
  return loadDb().items.filter((item) => item.caseId === caseId);
}

export function filesForItem(itemId: string): StoredFile[] {
  return loadDb()
    .files.filter((file) => file.itemId === itemId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
}

export function latestFileForItem(itemId: string): StoredFile | undefined {
  return filesForItem(itemId)[0];
}

export function factFindForCase(caseId: string): FactFindRecord | undefined {
  return loadDb().factFinds.find((row) => row.caseId === caseId);
}

export function decorateCase(caseRecord: CaseRecord): CaseWithMeta {
  const items = itemsForCase(caseRecord.id);
  const statuses = items.map((item) => item.status);
  const scenario = getScenario(caseRecord.scenarioId);
  const factFind = factFindForCase(caseRecord.id);
  const factCounts = countFieldStates(factFind?.fields ?? []);
  return {
    ...caseRecord,
    scenarioName: scenario?.name ?? caseRecord.scenarioId,
    uploadUrl: clientUploadUrl(caseRecord.uploadToken),
    overdue: caseIsOverdue(caseRecord, items),
    needsAttention: caseNeedsAttention(statuses),
    outstandingCount: items.filter(
      (item) =>
        item.status === "needed" || item.status === "rejected_resubmit",
    ).length,
    reviewCount: items.filter(
      (item) =>
        item.status === "uploaded" || item.status === "needs_review",
    ).length,
    acceptedCount: items.filter((item) => item.status === "accepted").length,
    itemCount: items.length,
    factFindDraftCount: factCounts.draft,
    factFindConfirmedCount: factCounts.confirmed,
  };
}

export function listCasesForBroker(brokerId: string): CaseWithMeta[] {
  return loadDb()
    .cases.filter((row) => row.brokerId === brokerId)
    .map(decorateCase)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCaseForBroker(
  brokerId: string,
  caseId: string,
): CaseWithMeta | null {
  const row = loadDb().cases.find(
    (item) => item.id === caseId && item.brokerId === brokerId,
  );
  return row ? decorateCase(row) : null;
}

export function getCaseByToken(token: string): CaseWithMeta | null {
  const row = loadDb().cases.find((item) => item.uploadToken === token);
  return row ? decorateCase(row) : null;
}

export function reviewQueue(brokerId: string): CaseWithMeta[] {
  return listCasesForBroker(brokerId).filter((row) => row.needsAttention);
}

export function overdueCases(brokerId: string): CaseWithMeta[] {
  return listCasesForBroker(brokerId).filter((row) => row.overdue);
}

export function listReminders(brokerId: string): Array<
  ReminderLog & { clientLabel: string }
> {
  const db = loadDb();
  const caseIds = new Set(
    db.cases.filter((row) => row.brokerId === brokerId).map((row) => row.id),
  );
  return db.reminders
    .filter((row) => caseIds.has(row.caseId))
    .map((row) => ({
      ...row,
      clientLabel:
        db.cases.find((item) => item.id === row.caseId)?.clientLabel ??
        "Unknown case",
    }))
    .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
}

export function findFile(
  fileId: string,
): { file: StoredFile; item: ChecklistItem; caseRecord: CaseRecord } | null {
  const db = loadDb();
  const file = db.files.find((row) => row.id === fileId);
  if (!file) return null;
  const item = db.items.find((row) => row.id === file.itemId);
  if (!item) return null;
  const caseRecord = db.cases.find((row) => row.id === item.caseId);
  if (!caseRecord) return null;
  return { file, item, caseRecord };
}

export function filesForCase(caseId: string): StoredFile[] {
  const itemIds = new Set(itemsForCase(caseId).map((item) => item.id));
  return loadDb().files.filter((file) => itemIds.has(file.itemId));
}
