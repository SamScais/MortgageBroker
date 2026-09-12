import { FACT_FIND_GROUP_LABELS } from "./fact-find-schema";
import { mappingForFieldKey } from "./fact-find-mapping";
import { clientSlug, yyyymmdd } from "./pack";
import type { FactFindField } from "./types";

export const EXPORT_FORMATS = ["csv", "json"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export const CONFIRMED_EXPORT_NOTICE =
  "SAMPLE / FAKE confirmed PAYG fact-find. Handoff aid only — not a CRM replacement and not a certified LIXI / ApplyOnline schema. Nothing is lodged to Quickli, FLEX, ApplyOnline or any lender. Only broker-confirmed fields are included (one row per confirmed field). Draft and cleared values are left out on purpose.";

export type ConfirmedExportMeta = {
  caseId: string;
  clientLabel: string;
  kind: "payg";
  exportedAt: string;
};

export type ConfirmedExportRow = {
  SAMPLE: true;
  concept: string;
  key: string;
  group: string;
  groupLabel: string;
  label: string;
  value: string;
  sourceDocType: string;
  sourceItemTitle: string;
  confirmedAt: string;
  quickli: string;
  flex: string;
  notes: string;
  state: "confirmed";
};

export function isExportFormat(value: string): value is ExportFormat {
  return EXPORT_FORMATS.includes(value as ExportFormat);
}

export function confirmedFields(fields: FactFindField[]): FactFindField[] {
  return fields.filter(
    (field) => field.state === "confirmed" && field.value.trim().length > 0,
  );
}

export function confirmedExportFilename(
  clientLabel: string,
  format: ExportFormat,
  now = new Date(),
): string {
  return `SAMPLE-${clientSlug(clientLabel)}-confirmed-fact-find-${yyyymmdd(now)}.${format}`;
}

export function handoffZipDownloadName(clientLabel: string, now = new Date()): string {
  return `SAMPLE-${clientSlug(clientLabel)}-handoff-${yyyymmdd(now)}.zip`;
}

export function confirmedExportRows(
  fields: FactFindField[],
  meta: ConfirmedExportMeta,
): ConfirmedExportRow[] {
  return confirmedFields(fields).map((field) => {
    const mapping = mappingForFieldKey(field.key);
    return {
      SAMPLE: true,
      concept: mapping.concept,
      key: field.key,
      group: field.group,
      groupLabel: FACT_FIND_GROUP_LABELS[field.group],
      label: field.label,
      value: field.value,
      sourceDocType: field.sourceItemKey,
      sourceItemTitle: field.sourceItemTitle,
      confirmedAt: field.confirmedAt?.trim() || meta.exportedAt,
      quickli: mapping.quickli,
      flex: mapping.flex,
      notes: mapping.notes,
      state: "confirmed",
    };
  });
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function serializeConfirmedCsv(
  fields: FactFindField[],
  meta: ConfirmedExportMeta,
): string {
  const rows = confirmedExportRows(fields, meta);
  const headerComments = [
    `# ${CONFIRMED_EXPORT_NOTICE}`,
    `# Case: ${meta.clientLabel}`,
    `# Case id: ${meta.caseId}`,
    `# Kind: ${meta.kind}`,
    `# Exported: ${meta.exportedAt}`,
    "# One row per confirmed field. SAMPLE=true. Zip of accepted documents stays accepted-only alongside.",
    "# Columns: SAMPLE, concept, key, label, value, sourceDocType, confirmedAt, flex, quickli",
  ];
  const columns = [
    "SAMPLE",
    "concept",
    "key",
    "label",
    "value",
    "sourceDocType",
    "confirmedAt",
    "flex",
    "quickli",
  ];
  const lines = [
    ...headerComments,
    columns.join(","),
    ...rows.map((row) =>
      [
        "true",
        row.concept,
        row.key,
        row.label,
        row.value,
        row.sourceDocType,
        row.confirmedAt,
        row.flex,
        row.quickli,
      ]
        .map((cell) => csvCell(cell))
        .join(","),
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function serializeConfirmedJson(
  fields: FactFindField[],
  meta: ConfirmedExportMeta,
): string {
  const rows = confirmedExportRows(fields, meta);
  return `${JSON.stringify(
    {
      SAMPLE: true,
      sample: true,
      label: "SAMPLE / FAKE",
      notice: CONFIRMED_EXPORT_NOTICE,
      notLodged: true,
      handoffAidOnly: true,
      kind: meta.kind,
      caseId: meta.caseId,
      clientLabel: meta.clientLabel,
      exportedAt: meta.exportedAt,
      fieldCount: rows.length,
      fields: rows,
    },
    null,
    2,
  )}\n`;
}

export function buildConfirmedFactFindExport(
  fields: FactFindField[],
  meta: ConfirmedExportMeta,
  format: ExportFormat,
):
  | { filename: string; body: string; contentType: string; count: number }
  | { error: string } {
  const rows = confirmedExportRows(fields, meta);
  if (rows.length === 0) {
    return {
      error:
        "No confirmed fields to export. Confirm fields on the fact-find first. Draft and cleared values are left out on purpose.",
    };
  }

  if (format === "csv") {
    return {
      filename: confirmedExportFilename(meta.clientLabel, "csv", new Date(meta.exportedAt)),
      body: serializeConfirmedCsv(fields, meta),
      contentType: "text/csv; charset=utf-8",
      count: rows.length,
    };
  }

  return {
    filename: confirmedExportFilename(meta.clientLabel, "json", new Date(meta.exportedAt)),
    body: serializeConfirmedJson(fields, meta),
    contentType: "application/json; charset=utf-8",
    count: rows.length,
  };
}
