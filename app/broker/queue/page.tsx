import Link from "next/link";
import { SampleBanner } from "@/components/sample-banner";
import { StatusBadge } from "@/components/status-badge";
import { requireBroker } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { itemsForCase, reviewQueue } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const session = await requireBroker();
  const cases = reviewQueue(session.brokerId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl text-ink">Review queue</h1>
        <p className="text-ink-soft">
          Files that have been uploaded and still need a decision.
        </p>
      </div>
      <SampleBanner />
      {cases.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panel p-6 text-ink-soft">
          Nothing waiting. When a client uploads, the case appears here.
        </p>
      ) : (
        <ul className="space-y-4">
          {cases.map((row) => {
            const pending = itemsForCase(row.id).filter(
              (item) =>
                item.status === "uploaded" || item.status === "needs_review",
            );
            return (
              <li
                key={row.id}
                className="rounded-xl border border-line bg-panel p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg text-ink">{row.clientLabel}</h2>
                    <p className="text-sm text-ink-soft">
                      {row.scenarioName} · due {formatDate(row.dueAt)}
                    </p>
                  </div>
                  <Link
                    href={`/broker/cases/${row.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white"
                  >
                    Open case
                  </Link>
                </div>
                <ul className="mt-3 space-y-2">
                  {pending.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                      <span>{item.title}</span>
                      <StatusBadge status={item.status} />
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
