import Link from "next/link";
import { notFound } from "next/navigation";
import { markNeedsReviewAction } from "@/app/actions/review";
import { CopyButton } from "@/components/copy-button";
import { ReminderButton } from "@/components/reminder-button";
import { ReviewForm } from "@/components/review-form";
import { SampleBanner } from "@/components/sample-banner";
import { StatusBadge } from "@/components/status-badge";
import { requireBroker } from "@/lib/auth";
import { formatBytes, formatDate, formatDateTime } from "@/lib/format";
import {
  filesForItem,
  getCaseForBroker,
  itemsForCase,
} from "@/lib/queries";
import { canBrokerReview } from "@/lib/status";

export const dynamic = "force-dynamic";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireBroker();
  const { id } = await params;
  const caseRecord = getCaseForBroker(session.brokerId, id);
  if (!caseRecord) notFound();

  const items = itemsForCase(caseRecord.id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-soft">
          <Link href="/broker" className="underline">
            Cases
          </Link>
        </p>
        <h1 className="mt-1 text-3xl text-ink">{caseRecord.clientLabel}</h1>
        <p className="text-ink-soft">
          {caseRecord.scenarioName} · due {formatDate(caseRecord.dueAt)}
          {caseRecord.overdue ? " · overdue" : ""}
        </p>
      </div>
      <SampleBanner />

      <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
        <h2 className="text-lg text-ink">Client upload link</h2>
        <p className="break-all rounded-md bg-muted px-3 py-2 text-sm">
          {caseRecord.uploadUrl}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <CopyButton value={caseRecord.uploadUrl} />
          <a
            href={caseRecord.uploadUrl}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-4 text-sm font-semibold"
            target="_blank"
            rel="noreferrer"
          >
            Open as client
          </a>
        </div>
        <p className="text-sm text-ink-soft">
          One unique link. The client does not need an account. Share it by SMS
          or email yourself — this app does not send live messages.
        </p>
        {caseRecord.notes ? (
          <p className="text-sm">
            <span className="font-semibold">Note on the client page: </span>
            {caseRecord.notes}
          </p>
        ) : null}
      </section>

      <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
        <h2 className="text-lg text-ink">Reminders</h2>
        {caseRecord.overdue ? (
          <p className="rounded-md bg-[#f3d6d6] px-3 py-2 text-sm text-danger">
            This file is overdue. Documents are still needed or waiting on a
            resubmit.
          </p>
        ) : (
          <p className="text-sm text-ink-soft">
            Overdue is calculated automatically from the due date and outstanding
            items. No overnight job is required.
          </p>
        )}
        <ReminderButton caseId={caseRecord.id} />
        <Link href="/broker/reminders" className="block text-sm underline">
          Open the demo email log
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg text-ink">Checklist</h2>
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
                    <h3 className="font-semibold text-ink">{item.title}</h3>
                    <p className="text-sm text-ink-soft">{item.description}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.brokerNote ? (
                  <p className="mt-2 rounded-md bg-muted px-3 py-2 text-sm">
                    <span className="font-semibold">Broker note: </span>
                    {item.brokerNote}
                  </p>
                ) : null}
                {files.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm">
                    {files.map((file) => (
                      <li key={file.id}>
                        <a
                          href={`/api/files/${file.id}`}
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
                ) : (
                  <p className="mt-3 text-sm text-ink-soft">No file yet.</p>
                )}
                {item.status === "uploaded" ? (
                  <form action={markNeedsReviewAction.bind(null, item.id)} className="mt-3">
                    <button
                      type="submit"
                      className="text-sm font-semibold underline"
                    >
                      Mark as needs review
                    </button>
                  </form>
                ) : null}
                {canBrokerReview(item.status) ? (
                  <div className="mt-4 border-t border-line pt-3">
                    <ReviewForm itemId={item.id} />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
