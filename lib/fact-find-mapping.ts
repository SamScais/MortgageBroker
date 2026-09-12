import { FACT_FIND_GROUP_LABELS } from "./fact-find-schema";
import type { FactFindGroupId } from "./types";

export type PaygFieldMapping = {
  key: string;
  group: FactFindGroupId;
  label: string;
  quickli: string;
  flex: string;
  notes: string;
};

/**
 * Quickli / FLEX-ish paste map for the locked PAYG field list.
 * Handoff aid only — not a live CRM or servicing-calculator integration.
 */
export const PAYG_FIELD_MAPPINGS: PaygFieldMapping[] = [
  {
    key: "photo_id.full_name",
    group: "photo_id",
    label: "Full name",
    quickli: "Applicant — full name",
    flex: "Applicant / contact name",
    notes: "Match to the name on the application.",
  },
  {
    key: "photo_id.date_of_birth",
    group: "photo_id",
    label: "Date of birth",
    quickli: "Applicant — date of birth",
    flex: "Date of birth",
    notes: "Use the photo-ID date, not a statement date.",
  },
  {
    key: "photo_id.residential_address",
    group: "photo_id",
    label: "Residential address",
    quickli: "Applicant — residential address",
    flex: "Current residential address",
    notes: "Confirm against the licence or passport.",
  },
  {
    key: "photo_id.doc_type",
    group: "photo_id",
    label: "Document type",
    quickli: "Identification — document type",
    flex: "Primary ID type",
    notes: "e.g. NSW driver licence.",
  },
  {
    key: "photo_id.doc_number",
    group: "photo_id",
    label: "Document number",
    quickli: "Identification — document number",
    flex: "Primary ID number",
    notes: "Often masked in this SAMPLE demo.",
  },
  {
    key: "photo_id.expiry",
    group: "photo_id",
    label: "Expiry",
    quickli: "Identification — expiry",
    flex: "Primary ID expiry",
    notes: "Reject expired ID before confirming.",
  },
  {
    key: "payslips.employer_name",
    group: "payslips",
    label: "Employer name",
    quickli: "PAYG employment — employer",
    flex: "Employer name",
    notes: "From the latest accepted payslips.",
  },
  {
    key: "payslips.job_title",
    group: "payslips",
    label: "Job title",
    quickli: "PAYG employment — occupation",
    flex: "Occupation / job title",
    notes: "",
  },
  {
    key: "payslips.employment_basis",
    group: "payslips",
    label: "Employment basis",
    quickli: "PAYG employment — type (full-time / part-time / casual)",
    flex: "Employment status",
    notes: "Quickli uses this for income treatment.",
  },
  {
    key: "payslips.start_date",
    group: "payslips",
    label: "Employment start date",
    quickli: "PAYG employment — start date",
    flex: "Employment commenced",
    notes: "Probation / time-in-role checks sit in the CRM.",
  },
  {
    key: "payslips.gross_base_pay",
    group: "payslips",
    label: "Gross base pay",
    quickli: "PAYG base income (per pay) — annualise in Quickli",
    flex: "Gross base income",
    notes: "Export is per-pay as shown on the slip. Convert to annual in the calculator.",
  },
  {
    key: "payslips.pay_frequency",
    group: "payslips",
    label: "Pay frequency",
    quickli: "PAYG income — pay frequency",
    flex: "Income frequency",
    notes: "Weekly / fortnightly / monthly / annual.",
  },
  {
    key: "payslips.ytd_gross",
    group: "payslips",
    label: "Year-to-date gross",
    quickli: "YTD income (sense-check)",
    flex: "YTD income (notes)",
    notes: "Not always a Quickli input — use to sense-check base pay.",
  },
  {
    key: "payslips.allowances_overtime",
    group: "payslips",
    label: "Allowances / overtime",
    quickli: "PAYG overtime / allowances (haircut in calculator)",
    flex: "Additional PAYG income",
    notes: "Flagged if present. Confirm before treating as ongoing.",
  },
  {
    key: "bank_statements.institution",
    group: "bank_account",
    label: "Institution",
    quickli: "Asset — bank / institution",
    flex: "Asset institution",
    notes: "From 90-day statements.",
  },
  {
    key: "bank_statements.bsb_account",
    group: "bank_account",
    label: "BSB / account",
    quickli: "Asset — BSB / account number",
    flex: "Account BSB / number",
    notes: "Last-four only in this SAMPLE demo.",
  },
  {
    key: "bank_statements.statement_period",
    group: "bank_account",
    label: "Statement period",
    quickli: "Statement period (notes)",
    flex: "Statement dates",
    notes: "Check the 90-day window is current.",
  },
  {
    key: "bank_statements.closing_balance",
    group: "bank_account",
    label: "Closing balance",
    quickli: "Asset — account balance",
    flex: "Asset balance",
    notes: "Closing figure on the accepted statements.",
  },
  {
    key: "bank_statements.genuine_savings_notes",
    group: "genuine_savings",
    label: "Genuine savings / deposit notes",
    quickli: "Genuine savings / deposit notes",
    flex: "Deposit / genuine savings notes",
    notes: "Paste into notes. Not a calculated savings figure.",
  },
  {
    key: "bank_statements.recurring_mortgage",
    group: "spotted_liabilities",
    label: "Mortgage payments spotted",
    quickli: "Existing mortgage — repayment",
    flex: "Liability — home loan repayment",
    notes: "Spotted on statements. Confirm against the liability document.",
  },
  {
    key: "bank_statements.recurring_cc",
    group: "spotted_liabilities",
    label: "Credit card payments spotted",
    quickli: "Credit card — repayment (limit still needed for servicing)",
    flex: "Liability — credit card repayment",
    notes: "Quickli usually needs the limit, not only the payment.",
  },
  {
    key: "bank_statements.recurring_personal_loan",
    group: "spotted_liabilities",
    label: "Personal loan payments spotted",
    quickli: "Personal loan — repayment",
    flex: "Liability — personal loan repayment",
    notes: "",
  },
  {
    key: "bank_statements.recurring_hecs",
    group: "spotted_liabilities",
    label: "HECS-HELP payments spotted",
    quickli: "HECS-HELP — repayment / balance",
    flex: "HECS / HELP debt",
    notes: "ATO compulsory amount if spotted.",
  },
  {
    key: "bank_statements.living_groceries",
    group: "living_expenses",
    label: "Groceries",
    quickli: "Living expenses — groceries (declared vs HEM later)",
    flex: "Expense — groceries",
    notes: "Declared from statements. Compare to HEM in the calculator later.",
  },
  {
    key: "bank_statements.living_rent",
    group: "living_expenses",
    label: "Rent",
    quickli: "Living expenses — rent (declared vs HEM later)",
    flex: "Expense — rent",
    notes: "Declared from statements. Compare to HEM later.",
  },
  {
    key: "bank_statements.living_utilities",
    group: "living_expenses",
    label: "Utilities",
    quickli: "Living expenses — utilities (declared vs HEM later)",
    flex: "Expense — utilities",
    notes: "Declared from statements. Compare to HEM later.",
  },
  {
    key: "bank_statements.living_childcare",
    group: "living_expenses",
    label: "Childcare",
    quickli: "Living expenses — childcare (declared vs HEM later)",
    flex: "Expense — childcare",
    notes: "Declared from statements. Compare to HEM later.",
  },
  {
    key: "bank_statements.living_transport",
    group: "living_expenses",
    label: "Transport",
    quickli: "Living expenses — transport (declared vs HEM later)",
    flex: "Expense — transport",
    notes: "Declared from statements. Compare to HEM later.",
  },
  {
    key: "liability.existing_debts.type",
    group: "liability_docs",
    label: "Liability type",
    quickli: "Liability — type",
    flex: "Liability type",
    notes: "From the accepted liability document.",
  },
  {
    key: "liability.existing_debts.lender",
    group: "liability_docs",
    label: "Lender / provider",
    quickli: "Liability — lender",
    flex: "Creditor / lender",
    notes: "",
  },
  {
    key: "liability.existing_debts.limit",
    group: "liability_docs",
    label: "Limit",
    quickli: "Liability — credit limit",
    flex: "Liability limit",
    notes: "Credit-card servicing usually uses the limit.",
  },
  {
    key: "liability.existing_debts.balance",
    group: "liability_docs",
    label: "Balance",
    quickli: "Liability — outstanding balance",
    flex: "Liability balance",
    notes: "",
  },
  {
    key: "liability.existing_debts.repayment",
    group: "liability_docs",
    label: "Repayment",
    quickli: "Liability — monthly repayment",
    flex: "Liability repayment",
    notes: "Normalise to monthly in the calculator if needed.",
  },
  {
    key: "liability.current_loan_statement.type",
    group: "liability_docs",
    label: "Liability type",
    quickli: "Existing home loan — type",
    flex: "Current loan type",
    notes: "From an accepted current-loan statement (refinance).",
  },
  {
    key: "liability.current_loan_statement.lender",
    group: "liability_docs",
    label: "Lender / provider",
    quickli: "Existing home loan — lender",
    flex: "Current loan lender",
    notes: "",
  },
  {
    key: "liability.current_loan_statement.limit",
    group: "liability_docs",
    label: "Limit",
    quickli: "Existing home loan — limit / facility",
    flex: "Current loan limit",
    notes: "",
  },
  {
    key: "liability.current_loan_statement.balance",
    group: "liability_docs",
    label: "Balance",
    quickli: "Existing home loan — balance",
    flex: "Current loan balance",
    notes: "",
  },
  {
    key: "liability.current_loan_statement.repayment",
    group: "liability_docs",
    label: "Repayment",
    quickli: "Existing home loan — repayment",
    flex: "Current loan repayment",
    notes: "",
  },
  {
    key: "secondary_id.type",
    group: "secondary_id",
    label: "Document type",
    quickli: "Secondary identification — type",
    flex: "Secondary ID type",
    notes: "e.g. Medicare card.",
  },
  {
    key: "secondary_id.name_match",
    group: "secondary_id",
    label: "Name match to photo ID",
    quickli: "Secondary identification — name match notes",
    flex: "Secondary ID name match",
    notes: "Paste into notes. Not a calculator input.",
  },
  {
    key: "secondary_id.number",
    group: "secondary_id",
    label: "Number (optional)",
    quickli: "Secondary identification — number (optional)",
    flex: "Secondary ID number (optional)",
    notes: "Optional. Often omitted.",
  },
  {
    key: "secondary_id.expiry",
    group: "secondary_id",
    label: "Expiry",
    quickli: "Secondary identification — expiry",
    flex: "Secondary ID expiry",
    notes: "",
  },
];

const MAPPING_BY_KEY = new Map(
  PAYG_FIELD_MAPPINGS.map((row) => [row.key, row]),
);

export function mappingForFieldKey(key: string): PaygFieldMapping {
  const exact = MAPPING_BY_KEY.get(key);
  if (exact) return exact;

  const liability = key.match(/^liability\.[^.]+\.(type|lender|limit|balance|repayment)$/);
  if (liability) {
    const template = MAPPING_BY_KEY.get(`liability.existing_debts.${liability[1]}`);
    if (template) return { ...template, key };
  }

  return {
    key,
    group: "photo_id",
    label: key,
    quickli: "Paste into the matching Quickli field",
    flex: "Paste into the matching FLEX field",
    notes: "No preset mapping — match by the field label.",
  };
}

export function mappingGroupLabel(group: FactFindGroupId): string {
  return FACT_FIND_GROUP_LABELS[group];
}
