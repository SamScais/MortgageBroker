import { collectCaseFileEntries, type ZipFileEntry } from "./case-zip";
import {
  CONFIRMED_EXPORT_NOTICE,
  buildConfirmedFactFindExport,
  confirmedFields,
  handoffZipDownloadName,
} from "./fact-find-export";
import { loadDb } from "./store";
import { createZipStore } from "./zip";

export const HANDOFF_NOTICE = `${CONFIRMED_EXPORT_NOTICE}

This zip is a handoff pack:
- confirmed-fact-find/ — CSV and JSON of broker-confirmed fields only
- accepted-documents/ — accepted documents only (rejected / needs-resubmit / empty items are left out)

Nothing in this pack is lodged. Paste or map fields into Quickli or FLEX yourself.
`;

export function buildHandoffZip(
  brokerId: string,
  caseId: string,
  now = new Date(),
):
  | {
      filename: string;
      bytes: Buffer;
      count: number;
      confirmedCount: number;
      acceptedCount: number;
    }
  | { error: string; status: number } {
  const db = loadDb();
  const caseRecord = db.cases.find(
    (row) => row.id === caseId && row.brokerId === brokerId,
  );
  if (!caseRecord) {
    return { error: "Case not found.", status: 404 };
  }

  const factFind = db.factFinds.find((row) => row.caseId === caseId);
  const confirmed = confirmedFields(factFind?.fields ?? []);
  if (confirmed.length === 0) {
    return {
      error:
        "No confirmed fields to pack. Confirm fields on the fact-find first. Draft and cleared values are left out on purpose.",
      status: 404,
    };
  }

  const meta = {
    caseId: caseRecord.id,
    clientLabel: caseRecord.clientLabel,
    kind: "payg" as const,
    exportedAt: now.toISOString(),
  };
  const csv = buildConfirmedFactFindExport(confirmed, meta, "csv");
  const json = buildConfirmedFactFindExport(confirmed, meta, "json");
  if ("error" in csv || "error" in json) {
    return {
      error:
        "No confirmed fields to pack. Confirm fields on the fact-find first. Draft and cleared values are left out on purpose.",
      status: 404,
    };
  }

  const entries: ZipFileEntry[] = [
    {
      name: "NOTICE-SAMPLE-FAKE.txt",
      data: Buffer.from(HANDOFF_NOTICE, "utf8"),
    },
    {
      name: `confirmed-fact-find/${csv.filename}`,
      data: Buffer.from(csv.body, "utf8"),
    },
    {
      name: `confirmed-fact-find/${json.filename}`,
      data: Buffer.from(json.body, "utf8"),
    },
  ];

  const docs = collectCaseFileEntries(brokerId, caseId, "accepted");
  const acceptedEntries = "error" in docs ? [] : docs.entries;
  for (const entry of acceptedEntries) {
    entries.push({
      name: `accepted-documents/${entry.name}`,
      data: entry.data,
    });
  }

  return {
    filename: handoffZipDownloadName(caseRecord.clientLabel, now),
    bytes: createZipStore(entries),
    count: entries.length,
    confirmedCount: confirmed.length,
    acceptedCount: acceptedEntries.length,
  };
}