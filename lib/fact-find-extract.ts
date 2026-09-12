import { sampleLabel } from "./fact-find-schema";
import { DEMO_CASES } from "./demo";
import type {
  CaseRecord,
  ChecklistItem,
  FactFindField,
  FactFindGroupId,
  StoredFile,
} from "./types";

export type ExtractInput = {
  caseRecord: Pick<CaseRecord, "id" | "clientLabel">;
  items: ChecklistItem[];
  files: StoredFile[];
};

type DraftSpec = {
  key: string;
  group: FactFindGroupId;
  label: string;
  value: string;
  hint?: string;
};

function latestFileForItem(
  files: StoredFile[],
  itemId: string,
): StoredFile | undefined {
  return files
    .filter((file) => file.itemId === itemId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))[0];
}

function fieldFromSpec(
  spec: DraftSpec,
  item: ChecklistItem,
  file: StoredFile | undefined,
): FactFindField {
  const value = sampleLabel(spec.value);
  return {
    key: spec.key,
    group: spec.group,
    label: spec.label,
    value,
    draftValue: value,
    state: "draft",
    sourceItemKey: item.itemKey,
    sourceItemTitle: item.title,
    sourceFileId: file?.id ?? null,
    hint: spec.hint ?? `From accepted: ${item.title}`,
    confirmedAt: null,
  };
}

function clientGivenName(clientLabel: string): string {
  return clientLabel.replace(/^SAMPLE Client — /i, "").trim() || "Unnamed";
}

function priyaPhotoId(): DraftSpec[] {
  return [
    { key: "photo_id.full_name", group: "photo_id", label: "Full name", value: "Priya Nair" },
    { key: "photo_id.date_of_birth", group: "photo_id", label: "Date of birth", value: "14 March 1992" },
    {
      key: "photo_id.residential_address",
      group: "photo_id",
      label: "Residential address",
      value: "12 SAMPLE Street, Parramatta NSW 2150",
    },
    { key: "photo_id.doc_type", group: "photo_id", label: "Document type", value: "NSW driver licence" },
    { key: "photo_id.doc_number", group: "photo_id", label: "Document number", value: "NSW-4123**** (FAKE)" },
    { key: "photo_id.expiry", group: "photo_id", label: "Expiry", value: "14 March 2028" },
  ];
}

function genericPhotoId(name: string): DraftSpec[] {
  return [
    { key: "photo_id.full_name", group: "photo_id", label: "Full name", value: name },
    { key: "photo_id.date_of_birth", group: "photo_id", label: "Date of birth", value: "1 January 1990 (FAKE — not read from file)" },
    {
      key: "photo_id.residential_address",
      group: "photo_id",
      label: "Residential address",
      value: "1 SAMPLE Street, Sydney NSW 2000 (FAKE — not read from file)",
    },
    { key: "photo_id.doc_type", group: "photo_id", label: "Document type", value: "Australian driver licence" },
    { key: "photo_id.doc_number", group: "photo_id", label: "Document number", value: "****0000 (FAKE)" },
    { key: "photo_id.expiry", group: "photo_id", label: "Expiry", value: "1 January 2028 (FAKE — not read from file)" },
  ];
}

function priyaPayslips(): DraftSpec[] {
  const overtimeHint = "Flagged if present on the latest payslips. SAMPLE/FAKE — not lodged.";
  return [
    { key: "payslips.employer_name", group: "payslips", label: "Employer name", value: "Harbour Legal Pty Ltd" },
    { key: "payslips.job_title", group: "payslips", label: "Job title", value: "Senior Paralegal" },
    { key: "payslips.employment_basis", group: "payslips", label: "Employment basis", value: "Full-time" },
    { key: "payslips.start_date", group: "payslips", label: "Employment start date", value: "3 February 2020" },
    { key: "payslips.gross_base_pay", group: "payslips", label: "Gross base pay", value: "$2,450.00" },
    { key: "payslips.pay_frequency", group: "payslips", label: "Pay frequency", value: "Fortnightly" },
    { key: "payslips.ytd_gross", group: "payslips", label: "Year-to-date gross", value: "$31,850.00" },
    {
      key: "payslips.allowances_overtime",
      group: "payslips",
      label: "Allowances / overtime",
      value: "Overtime present — $186.40 this period (flagged)",
      hint: overtimeHint,
    },
  ];
}

function genericPayslips(name: string): DraftSpec[] {
  return [
    { key: "payslips.employer_name", group: "payslips", label: "Employer name", value: `Employer of ${name} (FAKE)` },
    { key: "payslips.job_title", group: "payslips", label: "Job title", value: "PAYG role (FAKE — not read from file)" },
    { key: "payslips.employment_basis", group: "payslips", label: "Employment basis", value: "Full-time" },
    { key: "payslips.start_date", group: "payslips", label: "Employment start date", value: "Not shown on this SAMPLE file" },
    { key: "payslips.gross_base_pay", group: "payslips", label: "Gross base pay", value: "$1.00 (FAKE)" },
    { key: "payslips.pay_frequency", group: "payslips", label: "Pay frequency", value: "Fortnightly" },
    { key: "payslips.ytd_gross", group: "payslips", label: "Year-to-date gross", value: "$1.00 (FAKE)" },
    {
      key: "payslips.allowances_overtime",
      group: "payslips",
      label: "Allowances / overtime",
      value: "Not flagged on this SAMPLE file",
      hint: "Flagged if present on the latest payslips. SAMPLE/FAKE — not lodged.",
    },
  ];
}

function priyaBank(): DraftSpec[] {
  const hem = "Declared from statements — compare to HEM later. SAMPLE/FAKE — not lodged.";
  return [
    { key: "bank_statements.institution", group: "bank_account", label: "Institution", value: "Commonwealth Bank" },
    { key: "bank_statements.bsb_account", group: "bank_account", label: "BSB / account", value: "062-000 / ****4412" },
    {
      key: "bank_statements.statement_period",
      group: "bank_account",
      label: "Statement period",
      value: "14 June 2026 – 11 September 2026",
    },
    { key: "bank_statements.closing_balance", group: "bank_account", label: "Closing balance", value: "$28,640.15" },
    {
      key: "bank_statements.genuine_savings_notes",
      group: "genuine_savings",
      label: "Genuine savings / deposit notes",
      value:
        "$42,000 visible across savings and offset over 90 days. No gift trail spotted on this SAMPLE file.",
    },
    {
      key: "bank_statements.recurring_mortgage",
      group: "spotted_liabilities",
      label: "Mortgage payments spotted",
      value: "Not spotted on this 90-day SAMPLE file",
    },
    {
      key: "bank_statements.recurring_cc",
      group: "spotted_liabilities",
      label: "Credit card payments spotted",
      value: "$65 / month to SAMPLE Visa …8841",
    },
    {
      key: "bank_statements.recurring_personal_loan",
      group: "spotted_liabilities",
      label: "Personal loan payments spotted",
      value: "Not spotted on this 90-day SAMPLE file",
    },
    {
      key: "bank_statements.recurring_hecs",
      group: "spotted_liabilities",
      label: "HECS-HELP payments spotted",
      value: "$210 / fortnight ATO compulsory (FAKE)",
    },
    {
      key: "bank_statements.living_groceries",
      group: "living_expenses",
      label: "Groceries",
      value: "$185 / week average",
      hint: hem,
    },
    {
      key: "bank_statements.living_rent",
      group: "living_expenses",
      label: "Rent",
      value: "$620 / week to SAMPLE Realty",
      hint: hem,
    },
    {
      key: "bank_statements.living_utilities",
      group: "living_expenses",
      label: "Utilities",
      value: "$210 / month",
      hint: hem,
    },
    {
      key: "bank_statements.living_childcare",
      group: "living_expenses",
      label: "Childcare",
      value: "Not spotted",
      hint: hem,
    },
    {
      key: "bank_statements.living_transport",
      group: "living_expenses",
      label: "Transport",
      value: "$48 / week Opal and fuel",
      hint: hem,
    },
  ];
}

function genericBank(name: string): DraftSpec[] {
  const hem = "Declared from statements — compare to HEM later. SAMPLE/FAKE — not lodged.";
  return [
    { key: "bank_statements.institution", group: "bank_account", label: "Institution", value: "Australian bank (FAKE)" },
    { key: "bank_statements.bsb_account", group: "bank_account", label: "BSB / account", value: "000-000 / ****0000" },
    {
      key: "bank_statements.statement_period",
      group: "bank_account",
      label: "Statement period",
      value: "90-day SAMPLE window (not read from file)",
    },
    { key: "bank_statements.closing_balance", group: "bank_account", label: "Closing balance", value: "$1.00 (FAKE)" },
    {
      key: "bank_statements.genuine_savings_notes",
      group: "genuine_savings",
      label: "Genuine savings / deposit notes",
      value: `No deposit trail extracted for ${name} on this SAMPLE file.`,
    },
    {
      key: "bank_statements.recurring_mortgage",
      group: "spotted_liabilities",
      label: "Mortgage payments spotted",
      value: "Not spotted on this SAMPLE file",
    },
    {
      key: "bank_statements.recurring_cc",
      group: "spotted_liabilities",
      label: "Credit card payments spotted",
      value: "Not spotted on this SAMPLE file",
    },
    {
      key: "bank_statements.recurring_personal_loan",
      group: "spotted_liabilities",
      label: "Personal loan payments spotted",
      value: "Not spotted on this SAMPLE file",
    },
    {
      key: "bank_statements.recurring_hecs",
      group: "spotted_liabilities",
      label: "HECS-HELP payments spotted",
      value: "Not spotted on this SAMPLE file",
    },
    {
      key: "bank_statements.living_groceries",
      group: "living_expenses",
      label: "Groceries",
      value: "Not extracted",
      hint: hem,
    },
    {
      key: "bank_statements.living_rent",
      group: "living_expenses",
      label: "Rent",
      value: "Not extracted",
      hint: hem,
    },
    {
      key: "bank_statements.living_utilities",
      group: "living_expenses",
      label: "Utilities",
      value: "Not extracted",
      hint: hem,
    },
    {
      key: "bank_statements.living_childcare",
      group: "living_expenses",
      label: "Childcare",
      value: "Not extracted",
      hint: hem,
    },
    {
      key: "bank_statements.living_transport",
      group: "living_expenses",
      label: "Transport",
      value: "Not extracted",
      hint: hem,
    },
  ];
}

function priyaLiability(): DraftSpec[] {
  const prefix = "liability.existing_debts";
  return [
    { key: `${prefix}.type`, group: "liability_docs", label: "Liability type", value: "Credit card" },
    { key: `${prefix}.lender`, group: "liability_docs", label: "Lender / provider", value: "CBA Visa" },
    { key: `${prefix}.limit`, group: "liability_docs", label: "Limit", value: "$8,000" },
    { key: `${prefix}.balance`, group: "liability_docs", label: "Balance", value: "$1,240" },
    { key: `${prefix}.repayment`, group: "liability_docs", label: "Repayment", value: "$65 / month minimum" },
  ];
}

function genericLiability(itemKey: string, type: string): DraftSpec[] {
  const prefix = `liability.${itemKey}`;
  return [
    { key: `${prefix}.type`, group: "liability_docs", label: "Liability type", value: type },
    { key: `${prefix}.lender`, group: "liability_docs", label: "Lender / provider", value: "Australian lender (FAKE)" },
    { key: `${prefix}.limit`, group: "liability_docs", label: "Limit", value: "Not shown on this SAMPLE file" },
    { key: `${prefix}.balance`, group: "liability_docs", label: "Balance", value: "$1.00 (FAKE)" },
    { key: `${prefix}.repayment`, group: "liability_docs", label: "Repayment", value: "Not shown on this SAMPLE file" },
  ];
}

function priyaSecondary(): DraftSpec[] {
  return [
    { key: "secondary_id.type", group: "secondary_id", label: "Document type", value: "Medicare card" },
    {
      key: "secondary_id.name_match",
      group: "secondary_id",
      label: "Name match to photo ID",
      value: "Yes — matches SAMPLE Priya Nair",
    },
    { key: "secondary_id.number", group: "secondary_id", label: "Number (optional)", value: "Medicare-****5678 (FAKE)" },
    { key: "secondary_id.expiry", group: "secondary_id", label: "Expiry", value: "December 2028" },
  ];
}

function genericSecondary(name: string): DraftSpec[] {
  return [
    { key: "secondary_id.type", group: "secondary_id", label: "Document type", value: "Medicare card" },
    {
      key: "secondary_id.name_match",
      group: "secondary_id",
      label: "Name match to photo ID",
      value: `Yes — matches SAMPLE ${name}`,
    },
    { key: "secondary_id.number", group: "secondary_id", label: "Number (optional)", value: "Not captured (optional)" },
    { key: "secondary_id.expiry", group: "secondary_id", label: "Expiry", value: "Not shown on this SAMPLE file" },
  ];
}

function specsForItem(caseRecord: ExtractInput["caseRecord"], item: ChecklistItem): DraftSpec[] {
  const isPriya = caseRecord.id === DEMO_CASES.purchase.id;
  const name = clientGivenName(caseRecord.clientLabel);

  switch (item.itemKey) {
    case "photo_id":
      return isPriya ? priyaPhotoId() : genericPhotoId(name);
    case "payslips":
      return isPriya ? priyaPayslips() : genericPayslips(name);
    case "bank_statements":
      return isPriya ? priyaBank() : genericBank(name);
    case "existing_debts":
      return isPriya ? priyaLiability() : genericLiability(item.itemKey, "Credit card");
    case "current_loan_statement":
      return genericLiability(item.itemKey, "Mortgage");
    case "secondary_id":
      return isPriya ? priyaSecondary() : genericSecondary(name);
    default:
      return [];
  }
}

/**
 * Deterministic SAMPLE draft extraction from accepted checklist items only.
 * Real OCR can replace specsForItem later without changing field state or UI.
 */
export function extractDraftFields(input: ExtractInput): FactFindField[] {
  const accepted = input.items.filter((item) => item.status === "accepted");
  const fields: FactFindField[] = [];

  for (const item of accepted) {
    const file = latestFileForItem(input.files, item.id);
    for (const spec of specsForItem(input.caseRecord, item)) {
      fields.push(fieldFromSpec(spec, item, file));
    }
  }

  return fields;
}
