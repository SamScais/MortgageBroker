import { DownloadLink } from "@/components/download-link";

export function FactFindHandoff({
  caseId,
  confirmedCount,
  acceptedCount,
}: {
  caseId: string;
  confirmedCount: number;
  acceptedCount: number;
}) {
  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <h2 className="text-lg text-ink">Confirmed export and handoff</h2>
      <p className="text-sm text-ink-soft">
        Download <strong>broker-confirmed</strong> fields only (CSV or JSON), the
        accepted-documents zip, or a combined handoff pack. SAMPLE / FAKE —
        handoff aid only, not a CRM replacement, nothing is lodged.
      </p>
      {confirmedCount === 0 ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          Confirm at least one field on the fact-find to download CSV, JSON or
          the handoff pack. Draft and cleared values are left out.
        </p>
      ) : (
        <p className="text-sm">
          {confirmedCount} confirmed field{confirmedCount === 1 ? "" : "s"} ready
          to export
          {acceptedCount > 0
            ? ` · ${acceptedCount} accepted document${acceptedCount === 1 ? "" : "s"} for the pack`
            : ""}
          .
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {confirmedCount > 0 ? (
          <>
            <DownloadLink
              href={`/api/cases/${caseId}/fact-find/export?format=csv`}
              variant="primary"
            >
              Download CSV
            </DownloadLink>
            <DownloadLink
              href={`/api/cases/${caseId}/fact-find/export?format=json`}
            >
              Download JSON
            </DownloadLink>
            <DownloadLink href={`/api/cases/${caseId}/handoff`}>
              Download handoff pack
            </DownloadLink>
          </>
        ) : null}
        {acceptedCount > 0 ? (
          <DownloadLink href={`/api/cases/${caseId}/zip`}>
            Download accepted zip
          </DownloadLink>
        ) : (
          <p className="text-sm text-ink-soft">
            No accepted documents to pack yet.
          </p>
        )}
      </div>
    </section>
  );
}
