import type { ScenarioId, ScenarioTemplate } from "./types";

export const SCENARIOS: ScenarioTemplate[] = [
  {
    id: "purchase",
    name: "Purchase",
    summary:
      "Buying an owner-occupied or investment home. Typical supporting documents for an Australian home loan application.",
    items: [
      {
        key: "photo_id",
        title: "Photo identification",
        description:
          "Current Australian driver licence or passport. Colour photo, all four corners visible.",
      },
      {
        key: "secondary_id",
        title: "Secondary identification",
        description:
          "Medicare card, Australian birth certificate, or another secondary ID document.",
      },
      {
        key: "payslips",
        title: "Latest two payslips",
        description:
          "If self-employed, upload the last two years’ tax returns and a recent ATO notice of assessment instead.",
      },
      {
        key: "employment_letter",
        title: "Employment letter or contract",
        description:
          "Letter on employer letterhead, or your current employment contract.",
      },
      {
        key: "bank_statements",
        title: "Bank statements (last 90 days)",
        description:
          "All everyday, savings and offset accounts. PDF export from internet banking is fine.",
      },
      {
        key: "genuine_savings",
        title: "Evidence of deposit / genuine savings",
        description:
          "Statements showing the deposit trail. If any funds are a gift, also upload a gift letter.",
      },
      {
        key: "contract_of_sale",
        title: "Contract of sale",
        description:
          "Signed contract once exchanged, or a draft if that is all you have so far.",
      },
      {
        key: "existing_debts",
        title: "Existing loan or credit card statements",
        description:
          "Latest statement for any credit cards, car loans or other personal lending.",
      },
    ],
  },
  {
    id: "refinance",
    name: "Refinance",
    summary:
      "Switching an existing home loan. Current loan, security and income documents are the usual starting point.",
    items: [
      {
        key: "photo_id",
        title: "Photo identification",
        description:
          "Current Australian driver licence or passport. Colour photo, all four corners visible.",
      },
      {
        key: "payslips",
        title: "Latest two payslips",
        description:
          "If self-employed, upload the last two years’ tax returns and a recent ATO notice of assessment instead.",
      },
      {
        key: "bank_statements",
        title: "Bank statements (last 90 days)",
        description:
          "All everyday, savings and offset accounts, including the account the current loan is paid from.",
      },
      {
        key: "current_loan_statement",
        title: "Current home loan statement",
        description:
          "Latest statement showing the lender, account number, balance and repayment.",
      },
      {
        key: "rates_notice",
        title: "Most recent rates notice",
        description:
          "Council rates notice for the security property.",
      },
      {
        key: "insurance_certificate",
        title: "Building insurance certificate",
        description:
          "Certificate of currency for building (and contents if you have it).",
      },
      {
        key: "existing_debts",
        title: "Other debts",
        description:
          "Latest statements for credit cards, car loans or personal loans.",
      },
      {
        key: "discharge_authority",
        title: "Discharge authority (if requested)",
        description:
          "Only if your broker has asked for it. Leave as needed until then.",
      },
    ],
  },
  {
    id: "first_home_buyer",
    name: "First home buyer",
    summary:
      "Buying a first home. Same core income and ID documents, plus grant or concession paperwork if you are applying.",
    items: [
      {
        key: "photo_id",
        title: "Photo identification",
        description:
          "Current Australian driver licence or passport. Colour photo, all four corners visible.",
      },
      {
        key: "secondary_id",
        title: "Secondary identification",
        description:
          "Medicare card, Australian birth certificate, or another secondary ID document.",
      },
      {
        key: "payslips",
        title: "Latest two payslips",
        description:
          "If self-employed, upload the last two years’ tax returns and a recent ATO notice of assessment instead.",
      },
      {
        key: "bank_statements",
        title: "Bank statements (last 90 days)",
        description:
          "All accounts, including a clear savings trail for the deposit.",
      },
      {
        key: "genuine_savings",
        title: "Evidence of deposit / genuine savings",
        description:
          "Statements showing the deposit trail. Upload a gift letter if any funds are a gift.",
      },
      {
        key: "contract_of_sale",
        title: "Contract of sale",
        description:
          "Signed contract once exchanged, or a draft if that is all you have so far.",
      },
      {
        key: "fhog_paperwork",
        title: "First Home Owner Grant / stamp duty concession",
        description:
          "Application or supporting papers if you are applying in your state or territory. Skip if not relevant.",
      },
      {
        key: "living_arrangement",
        title: "Living arrangement letter (if requested)",
        description:
          "Rental ledger, or a short letter if you live with family. Only if your broker asks for it.",
      },
    ],
  },
];

export function getScenario(id: string): ScenarioTemplate | undefined {
  return SCENARIOS.find((scenario) => scenario.id === id);
}

export function isScenarioId(value: string): value is ScenarioId {
  return SCENARIOS.some((scenario) => scenario.id === value);
}
