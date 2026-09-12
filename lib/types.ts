export const ITEM_STATUSES = [
  "needed",
  "uploaded",
  "needs_review",
  "accepted",
  "rejected_resubmit",
] as const;

export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const SCENARIO_IDS = [
  "purchase",
  "refinance",
  "first_home_buyer",
] as const;

export type ScenarioId = (typeof SCENARIO_IDS)[number];

export type Broker = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
};

export type CaseRecord = {
  id: string;
  brokerId: string;
  clientLabel: string;
  clientEmail: string;
  clientMobile: string;
  scenarioId: ScenarioId;
  notes: string;
  uploadToken: string;
  dueAt: string;
  createdAt: string;
};

export type ChecklistItem = {
  id: string;
  caseId: string;
  itemKey: string;
  title: string;
  description: string;
  status: ItemStatus;
  brokerNote: string;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type StoredFile = {
  id: string;
  itemId: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type ReminderLog = {
  id: string;
  caseId: string;
  sentAt: string;
  channel: "demo_email";
  to: string;
  subject: string;
  body: string;
  isDemo: true;
};

export const FACT_FIND_FIELD_STATES = [
  "draft",
  "confirmed",
  "cleared",
] as const;

export type FactFindFieldState = (typeof FACT_FIND_FIELD_STATES)[number];

export const FACT_FIND_GROUPS = [
  "photo_id",
  "payslips",
  "bank_account",
  "genuine_savings",
  "spotted_liabilities",
  "living_expenses",
  "liability_docs",
  "secondary_id",
] as const;

export type FactFindGroupId = (typeof FACT_FIND_GROUPS)[number];

export const FACT_FIND_SOURCE_KEYS = [
  "photo_id",
  "payslips",
  "bank_statements",
  "existing_debts",
  "current_loan_statement",
  "secondary_id",
] as const;

export type FactFindSourceKey = (typeof FACT_FIND_SOURCE_KEYS)[number];

export type FactFindField = {
  key: string;
  group: FactFindGroupId;
  label: string;
  value: string;
  draftValue: string;
  state: FactFindFieldState;
  sourceItemKey: string;
  sourceItemTitle: string;
  sourceFileId: string | null;
  hint: string;
};

export type FactFindRecord = {
  id: string;
  caseId: string;
  kind: "payg";
  fields: FactFindField[];
  extractedAt: string;
  updatedAt: string;
};

export type Database = {
  brokers: Broker[];
  cases: CaseRecord[];
  items: ChecklistItem[];
  files: StoredFile[];
  reminders: ReminderLog[];
  factFinds: FactFindRecord[];
};

export type SessionPayload = {
  brokerId: string;
  email: string;
  name: string;
  exp: number;
};

export type ScenarioTemplate = {
  id: ScenarioId;
  name: string;
  summary: string;
  items: Array<{
    key: string;
    title: string;
    description: string;
  }>;
};
