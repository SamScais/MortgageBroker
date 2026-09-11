import { notFound } from "next/navigation";
import { SampleBanner } from "@/components/sample-banner";
import { StatusBadge } from "@/components/status-badge";
import { UploadForm } from "@/components/upload-form";
import { formatBytes, formatDate, formatDateTime } from "@/lib/format";
import { filesForItem, getCaseByToken, itemsForCase } from "@/lib/queries";
import { canClientUpload } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function ClientUploadPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const caseRecord = getCaseByToken(token);
  if (!caseRecord) notFound();
  const items = itemsForCase(caseRecord.id);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          Secure document upload
        </p>
        <h1 className="text-3xl text-ink">{caseRecord.clientLabel}</h1>
        <p className="text-ink-soft">
          {caseRecord.scenarioName} · please upload by {formatDate(caseRecord.dueAt)}
          {caseRecord.overdue ? " (overdue)" : ""}
        </p>
      </header>
      <SampleBanner>
        This is a SAMPLE / FAKE demo file. Do not upload real identity documents
        to a local demo. Nothing here is financial advice.
      </SampleBanner>
      {caseRecord.notes ? (
        <p className="rounded-xl border border-line bg-panel p-4 text-sm">
          <span className="font-semibold">Note from your broker: </span>
          {caseRecord.notes}
        </p>
      ) : null}
      <p className="text-sm text-ink-soft">
        {caseRecord.acceptedCount} accepted · {caseRecord.outstandingCount} still
        needed · {caseRecord.reviewCount} with your broker
      </p>
      <ul className="space-y-3">
        {items.map((item) => {
          const files = filesForItem(item.id);
          return (
            <li
              key={item.id}
              className="rounded-xl border border-line bg-panel p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg text-ink">{item.title}</h2>
                  <p className="text-sm text-ink-soft">{item.description}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.status === "rejected_resubmit" && item.brokerNote ? (
                <p className="mt-3 rounded-md bg-[#f3d6d6] px-3 py-2 text-sm text-danger">
                  Please resubmit: {item.brokerNote}
                </p>
              ) : null}
              {files.length > 0 ? (
                <ul className="mt-3 space-y-1 text-sm">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a
                        href={`/api/files/${file.id}?token=${encodeURIComponent(token)}`}
                        className="underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.originalName}
                      </a>
                      <span className="text-ink-soft">
                        {" "}
                        · {formatBytes(file.sizeBytes)} ·{" "}
                        {formatDateTime(file.uploadedAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {canClientUpload(item.status) ? (
                <div className="mt-4 border-t border-line pt-3">
                  <UploadForm itemId={item.id} token={token} />
                </div>
              ) : item.status === "accepted" ? (
                <p className="mt-3 text-sm text-ok">This document is accepted.</p>
              ) : (
                <p className="mt-3 text-sm text-ink-soft">
                  Your broker is reviewing this document.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
