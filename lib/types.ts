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

export type Database = {
  brokers: Broker[];
  cases: CaseRecord[];
  items: ChecklistItem[];
  files: StoredFile[];
  reminders: ReminderLog[];
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
