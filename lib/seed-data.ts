import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { hashPassword, nowIso } from "./crypto";
import { DEMO_BROKER, DEMO_CASES } from "./demo";
import { UPLOAD_DIR } from "./paths";
import { samplePdfBytes } from "./sample-pdf";
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
  mkdirSync(UPLOAD_DIR, { recursive: true });
  const bytes = samplePdfBytes(title);
  writeFileSync(join(UPLOAD_DIR, storedName), bytes);
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
  itemId: string,
  title: string,
  storedName: string,
): StoredFile {
  const sizeBytes = writeSampleFile(storedName, title);
  return {
    id: `file-${itemId}`,
    itemId,
    originalName: `${title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-SAMPLE.pdf`,
    storedName,
    mimeType: "application/pdf",
    sizeBytes,
    uploadedAt: nowIso(),
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

  const purchaseItems = buildItems(purchase.id, "purchase", {
    photo_id: "needs_review",
    payslips: "uploaded",
    bank_statements: "accepted",
  });

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
    fileFor(
      `item-${purchase.id}-photo_id`,
      "SAMPLE Photo ID — Priya Nair",
      "demo-priya-photo-id.pdf",
    ),
    fileFor(
      `item-${purchase.id}-payslips`,
      "SAMPLE Payslips — Priya Nair",
      "demo-priya-payslips.pdf",
    ),
    fileFor(
      `item-${purchase.id}-bank_statements`,
      "SAMPLE Bank statements — Priya Nair",
      "demo-priya-bank-statements.pdf",
    ),
    fileFor(
      `item-${refinance.id}-photo_id`,
      "SAMPLE Photo ID — Tom Brennan (rejected)",
      "demo-tom-photo-id.pdf",
    ),
  ];
  db.reminders = [];
  return db;
}

export function resetDemoData(): Database {
  return ensureSeeded({
    brokers: [],
    cases: [],
    items: [],
    files: [],
    reminders: [],
  });
}
