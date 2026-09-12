import { dirname, join } from "node:path";
import { hashPassword, nowIso } from "./crypto";
import { DEMO_BROKER, DEMO_CASES } from "./demo";
import { buildStoredRelativePath } from "./pack";
import { uploadDir } from "./paths";
import { makeDir, writeBytes } from "./runtime-fs";
import { samplePdfBytes } from "./sample-pdf";
import { syncFactFindOnDb } from "./fact-find";
import { getScenario } from "./scenarios";
import type {
  CaseRecord,
  ChecklistItem,
  Database,
  ItemStatus,
  StoredFile,
} from "./types";

function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(17, 0, 0, 0);
  return date.toISOString();
}

function writeSampleFile(storedName: string, title: string): number {
  const full = join(uploadDir(), storedName);
  makeDir(dirname(full));
  const bytes = samplePdfBytes(title);
  writeBytes(full, bytes);
  return bytes.length;
}

function buildItems(
  caseId: string,
  scenarioId: "purchase" | "refinance" | "first_home_buyer",
  statusByKey: Partial<Record<string, ItemStatus>>,
  notesByKey: Partial<Record<string, string>> = {},
): ChecklistItem[] {
  const scenario = getScenario(scenarioId);
  if (!scenario) return [];
  const createdAt = nowIso();
  return scenario.items.map((item) => ({
    id: `item-${caseId}-${item.key}`,
    caseId,
    itemKey: item.key,
    title: item.title,
    description: item.description,
    status: statusByKey[item.key] ?? "needed",
    brokerNote: notesByKey[item.key] ?? "",
    reviewedAt: statusByKey[item.key] === "accepted" ? createdAt : null,
    createdAt,
    updatedAt: createdAt,
  }));
}

function fileFor(
  caseRecord: CaseRecord,
  itemKey: string,
  title: string,
  status: ItemStatus,
): StoredFile {
  const itemId = `item-${caseRecord.id}-${itemKey}`;
  const uploadedAt = nowIso();
  const storedName = buildStoredRelativePath(
    {
      caseId: caseRecord.id,
      docType: itemKey,
      clientLabel: caseRecord.clientLabel,
      status,
      uploadedAt,
    },
    ".pdf",
  );
  const sizeBytes = writeSampleFile(storedName, title);
  return {
    id: `file-${itemId}`,
    itemId,
    originalName: `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-SAMPLE.pdf`,
    storedName,
    mimeType: "application/pdf",
    sizeBytes,
    uploadedAt,
  };
}

export function ensureSeeded(db: Database): Database {
  const createdAt = nowIso();

  db.brokers = [
    {
      id: DEMO_BROKER.id,
      email: DEMO_BROKER.email,
      name: DEMO_BROKER.name,
      passwordHash: hashPassword(DEMO_BROKER.password),
      createdAt,
    },
  ];

  const purchase: CaseRecord = {
    id: DEMO_CASES.purchase.id,
    brokerId: DEMO_BROKER.id,
    clientLabel: DEMO_CASES.purchase.clientLabel,
    clientEmail: DEMO_CASES.purchase.clientEmail,
    clientMobile: DEMO_CASES.purchase.clientMobile,
    scenarioId: "purchase",
    notes:
      "SAMPLE/FAKE case. Priya is exchanging next week — contract can follow if not yet signed.",
    uploadToken: DEMO_CASES.purchase.token,
    dueAt: daysFromNow(5),
    createdAt,
  };

  const refinance: CaseRecord = {
    id: DEMO_CASES.refinance.id,
    brokerId: DEMO_BROKER.id,
    clientLabel: DEMO_CASES.refinance.clientLabel,
    clientEmail: DEMO_CASES.refinance.clientEmail,
    clientMobile: DEMO_CASES.refinance.clientMobile,
    scenarioId: "refinance",
    notes:
      "SAMPLE/FAKE case. Current lender statement is the priority. This file is overdue on purpose so you can try reminders.",
    uploadToken: DEMO_CASES.refinance.token,
    dueAt: daysFromNow(-3),
    createdAt,
  };

  db.cases = [purchase, refinance];

  const purchaseItems = buildItems(
    purchase.id,
    "purchase",
    {
      photo_id: "accepted",
      payslips: "accepted",
      bank_statements: "accepted",
      secondary_id: "accepted",
      existing_debts: "accepted",
    },
  );

  const refinanceItems = buildItems(
    refinance.id,
    "refinance",
    {
      photo_id: "rejected_resubmit",
      current_loan_statement: "needed",
    },
    {
      photo_id:
        "The photo is cropped. Please upload a colour copy of the full licence, all four corners visible.",
    },
  );

  db.items = [...purchaseItems, ...refinanceItems];
  db.files = [
    fileFor(purchase, "photo_id", "SAMPLE Photo ID — Priya Nair", "accepted"),
    fileFor(purchase, "payslips", "SAMPLE Payslips — Priya Nair", "accepted"),
    fileFor(
      purchase,
      "bank_statements",
      "SAMPLE Bank statements — Priya Nair",
      "accepted",
    ),
    fileFor(
      purchase,
      "secondary_id",
      "SAMPLE Secondary ID — Priya Nair (Medicare)",
      "accepted",
    ),
    fileFor(
      purchase,
      "existing_debts",
      "SAMPLE Credit card statement — Priya Nair",
      "accepted",
    ),
    fileFor(
      refinance,
      "photo_id",
      "SAMPLE Photo ID — Tom Brennan (rejected)",
      "rejected_resubmit",
    ),
  ];
  db.reminders = [];
  db.factFinds = [];
  syncFactFindOnDb(db, purchase, purchaseItems, db.files);
  syncFactFindOnDb(db, refinance, refinanceItems, db.files);
  return db;
}

export function resetDemoData(): Database {
  return ensureSeeded({
    brokers: [],
    cases: [],
    items: [],
    files: [],
    reminders: [],
    factFinds: [],
  });
}
