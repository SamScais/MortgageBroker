import { FACT_FIND_GROUP_LABELS } from "./fact-find-schema";
import type { FactFindGroupId } from "./types";

export type PaygFieldMapping = {
  key: string;
  group: FactFindGroupId;
  label: string;
  concept: string;
  quickli: string;
  flex: string;
  notes: string;
};

function map(
  key: string,
  group: FactFindGroupId,
  label: string,
  concept: string,
  flex: string,
  quickli: string,
  notes = "",
): PaygFieldMapping {
  return { key, group, label, concept, flex, quickli, notes };
}

const PHOTO_ID_FLEX = "(ID / VOI notes)";
const PHOTO_ID_QUICKLI = "ID type, number, expiry";
const SECONDARY_FLEX = "(secondary ID)";
const SECONDARY_QUICKLI = "e.g. Medicare";
const SPOTTED_FLEX = "(feeds liabilities)";
const SPOTTED_QUICKLI = "Recurring loan/CC/HECS hits";
const LIVING_FLEX = "Groceries, Telco, Childcare, etc.";
const LIVING_QUICKLI = "Declared expenses (vs HEM later)";

/**
 * Quickli / FLEX-ish paste map for the locked PAYG field list.
 * Approximate handoff labels — not a certified LIXI / ApplyOnline schema.
 */
export const PAYG_FIELD_MAPPINGS: PaygFieldMapping[] = [
  map("photo_id.full_name", "photo_id", "Full name", "fullName", "First Name + Last Name", "Applicant name"),
  map("photo_id.date_of_birth", "photo_id", "Date of birth", "dateOfBirth", "Date of Birth", "DOB"),
  map(
    "photo_id.residential_address",
    "photo_id",
    "Residential address",
    "residentialAddress",
    "Street / Suburb / State / Postcode",
    "Residential address",
  ),
  map("photo_id.doc_type", "photo_id", "Document type", "photoIdType", PHOTO_ID_FLEX, PHOTO_ID_QUICKLI),
  map("photo_id.doc_number", "photo_id", "Document number", "photoIdNumber", PHOTO_ID_FLEX, PHOTO_ID_QUICKLI),
  map("photo_id.expiry", "photo_id", "Expiry", "photoIdExpiry", PHOTO_ID_FLEX, PHOTO_ID_QUICKLI),
  map("payslips.employer_name", "payslips", "Employer name", "employerName", "Employer Business Name", "Employer"),
  map("payslips.job_title", "payslips", "Job title", "jobTitle", "Job Title", "Occupation"),
  map(
    "payslips.employment_basis",
    "payslips",
    "Employment basis",
    "employmentBasis",
    "Employment Basis (FT/PT/casual)",
    "Employment type",
  ),
  map("payslips.start_date", "payslips", "Employment start date", "employmentStartDate", "Start Date", "Start date"),
  map("payslips.gross_base_pay", "payslips", "Gross base pay", "grossBasePay", "Gross Base Income", "Base income"),
  map("payslips.pay_frequency", "payslips", "Pay frequency", "payFrequency", "Frequency", "Pay frequency"),
  map("payslips.ytd_gross", "payslips", "Year-to-date gross", "ytdGross", "(YTD — often in notes)", "YTD income"),
  map(
    "payslips.allowances_overtime",
    "payslips",
    "Allowances / overtime",
    "allowancesOvertime",
    "Additional Income Benefits",
    "Allowances / OT",
  ),
  map("bank_statements.institution", "bank_account", "Institution", "bankInstitution", "Financial Institution", "Bank name"),
  map("bank_statements.bsb_account", "bank_account", "BSB / account", "bsbAccount", "BSB + Account Number", "BSB / account"),
  map(
    "bank_statements.statement_period",
    "bank_account",
    "Statement period",
    "statementPeriod",
    "(statement dates)",
    "Period covered",
  ),
  map(
    "bank_statements.closing_balance",
    "bank_account",
    "Closing balance",
    "closingBalance",
    "Estimated Value (savings/txn)",
    "Account balance",
  ),
  map(
    "bank_statements.genuine_savings_notes",
    "genuine_savings",
    "Genuine savings / deposit notes",
    "genuineSavingsNotes",
    "(assets notes)",
    "Deposit / genuine savings",
  ),
  map(
    "bank_statements.recurring_mortgage",
    "spotted_liabilities",
    "Mortgage payments spotted",
    "spottedLiabilityPayments",
    SPOTTED_FLEX,
    SPOTTED_QUICKLI,
  ),
  map(
    "bank_statements.recurring_cc",
    "spotted_liabilities",
    "Credit card payments spotted",
    "spottedLiabilityPayments",
    SPOTTED_FLEX,
    SPOTTED_QUICKLI,
  ),
  map(
    "bank_statements.recurring_personal_loan",
    "spotted_liabilities",
    "Personal loan payments spotted",
    "spottedLiabilityPayments",
    SPOTTED_FLEX,
    SPOTTED_QUICKLI,
  ),
  map(
    "bank_statements.recurring_hecs",
    "spotted_liabilities",
    "HECS-HELP payments spotted",
    "spottedLiabilityPayments",
    SPOTTED_FLEX,
    SPOTTED_QUICKLI,
  ),
  map("bank_statements.living_groceries", "living_expenses", "Groceries", "livingExpense_groceries", LIVING_FLEX, LIVING_QUICKLI),
  map("bank_statements.living_rent", "living_expenses", "Rent", "livingExpense_rent", LIVING_FLEX, LIVING_QUICKLI),
  map("bank_statements.living_utilities", "living_expenses", "Utilities", "livingExpense_utilities", LIVING_FLEX, LIVING_QUICKLI),
  map("bank_statements.living_childcare", "living_expenses", "Childcare", "livingExpense_childcare", LIVING_FLEX, LIVING_QUICKLI),
  map("bank_statements.living_transport", "living_expenses", "Transport", "livingExpense_transport", LIVING_FLEX, LIVING_QUICKLI),
  map(
    "liability.existing_debts.type",
    "liability_docs",
    "Liability type",
    "liabilityType",
    "Existing Mortgages / Credit Cards / …",
    "Liability type",
  ),
  map(
    "liability.existing_debts.lender",
    "liability_docs",
    "Lender / provider",
    "liabilityLender",
    "Lender / Credit Card Provider",
    "Provider",
  ),
  map("liability.existing_debts.limit", "liability_docs", "Limit", "liabilityLimit", "Current Limit", "Limit"),
  map(
    "liability.existing_debts.balance",
    "liability_docs",
    "Balance",
    "liabilityBalance",
    "Outstanding Balance",
    "Balance",
  ),
  map(
    "liability.existing_debts.repayment",
    "liability_docs",
    "Repayment",
    "liabilityRepayment",
    "Repayment Amount",
    "Repayment",
  ),
  map(
    "liability.current_loan_statement.type",
    "liability_docs",
    "Liability type",
    "liabilityType",
    "Existing Mortgages / Credit Cards / …",
    "Liability type",
  ),
  map(
    "liability.current_loan_statement.lender",
    "liability_docs",
    "Lender / provider",
    "liabilityLender",
    "Lender / Credit Card Provider",
    "Provider",
  ),
  map("liability.current_loan_statement.limit", "liability_docs", "Limit", "liabilityLimit", "Current Limit", "Limit"),
  map(
    "liability.current_loan_statement.balance",
    "liability_docs",
    "Balance",
    "liabilityBalance",
    "Outstanding Balance",
    "Balance",
  ),
  map(
    "liability.current_loan_statement.repayment",
    "liability_docs",
    "Repayment",
    "liabilityRepayment",
    "Repayment Amount",
    "Repayment",
  ),
  map("secondary_id.type", "secondary_id", "Document type", "secondaryIdType", SECONDARY_FLEX, SECONDARY_QUICKLI),
  map(
    "secondary_id.name_match",
    "secondary_id",
    "Name match to photo ID",
    "secondaryIdType",
    SECONDARY_FLEX,
    SECONDARY_QUICKLI,
  ),
  map("secondary_id.number", "secondary_id", "Number (optional)", "secondaryIdNumber", SECONDARY_FLEX, SECONDARY_QUICKLI),
  map("secondary_id.expiry", "secondary_id", "Expiry", "secondaryIdNumber", SECONDARY_FLEX, SECONDARY_QUICKLI),
];

const MAPPING_BY_KEY = new Map(PAYG_FIELD_MAPPINGS.map((row) => [row.key, row]));

const LIABILITY_CONCEPT: Record<string, string> = {
  type: "liabilityType",
  lender: "liabilityLender",
  limit: "liabilityLimit",
  balance: "liabilityBalance",
  repayment: "liabilityRepayment",
};

export function mappingForFieldKey(key: string): PaygFieldMapping {
  const exact = MAPPING_BY_KEY.get(key);
  if (exact) return exact;

  const liability = key.match(/^liability\.[^.]+\.(type|lender|limit|balance|repayment)$/);
  if (liability) {
    const suffix = liability[1] ?? "type";
    const template = MAPPING_BY_KEY.get(`liability.existing_debts.${suffix}`);
    if (template) return { ...template, key, concept: LIABILITY_CONCEPT[suffix] ?? template.concept };
  }

  return {
    key,
    group: "photo_id",
    label: key,
    concept: key,
    quickli: "Paste into the matching Quickli field",
    flex: "Paste into the matching FLEX field",
    notes: "No preset mapping — match by the field label.",
  };
}

export function mappingGroupLabel(group: FactFindGroupId): string {
  return FACT_FIND_GROUP_LABELS[group];
}
