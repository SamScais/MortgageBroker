import type { FactFindGroupId, FactFindSourceKey } from "./types";

export const FACT_FIND_GROUP_LABELS: Record<FactFindGroupId, string> = {
  photo_id: "Photo identification",
  payslips: "Payslips (latest two)",
  bank_account: "Bank account (90-day statements)",
  genuine_savings: "Genuine savings / deposit evidence",
  spotted_liabilities: "Recurring liability payments spotted",
  living_expenses: "Living expenses (declared vs HEM later)",
  liability_docs: "Liability documents",
  secondary_id: "Secondary identification",
};

export const FACT_FIND_SOURCE_LABELS: Record<FactFindSourceKey, string> = {
  photo_id: "Photo identification",
  payslips: "Latest two payslips",
  bank_statements: "Bank statements (last 90 days)",
  existing_debts: "Existing loan or credit card statements",
  current_loan_statement: "Current home loan statement",
  secondary_id: "Secondary identification",
};

export function isFactFindSourceKey(value: string): value is FactFindSourceKey {
  return (FACT_FIND_SOURCE_LABELS as Record<string, string>)[value] != null;
}

export function sampleLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "SAMPLE — not shown";
  if (/^SAMPLE\b/i.test(trimmed) || /^FAKE\b/i.test(trimmed)) return trimmed;
  return `SAMPLE ${trimmed}`;
}
