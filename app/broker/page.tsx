import Link from "next/link";
import { SampleBanner } from "@/components/sample-banner";
import { StatusBadge } from "@/components/status-badge";
import { requireBroker } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { listCasesForBroker } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BrokerHomePage() {
  const session = await requireBroker();
  const cases = listCasesForBroker(session.brokerId);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl text-ink">Cases</h1>
          <p className="text-ink-soft">
            Create a file, copy the client link, then review uploads here.
          </p>
        </div>
        <Link
          href="/broker/cases/new"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white"
        >
          New case
        </Link>
      </div>
      <SampleBanner />
      {cases.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panel p-6 text-ink-soft">
          No cases yet. Create one to generate a checklist and client link.
        </p>
      ) : (
        <ul className="space-y-3">
          {cases.map((row) => (
            <li key={row.id}>
              <Link
                href={`/broker/cases/${row.id}`}
                className="block rounded-xl border border-line bg-panel p-4 hover:border-accent"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-lg text-ink">{row.clientLabel}</h2>
                    <p className="text-sm text-ink-soft">
                      {row.scenarioName} · due {formatDate(row.dueAt)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {row.overdue ? (
                      <span className="rounded-full bg-[#f3d6d6] px-2.5 py-0.5 text-xs font-semibold text-danger">
                        Overdue
                      </span>
                    ) : null}
                    {row.needsAttention ? (
                      <span className="rounded-full bg-[#f8e8c8] px-2.5 py-0.5 text-xs font-semibold text-warn">
                        Needs attention
                      </span>
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-soft">
                  {row.acceptedCount}/{row.itemCount} accepted · {row.reviewCount}{" "}
                  to review · {row.outstandingCount} still needed
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-ink-soft">
        Status key:{" "}
        <StatusBadge status="needed" /> <StatusBadge status="uploaded" />{" "}
        <StatusBadge status="needs_review" /> <StatusBadge status="accepted" />{" "}
        <StatusBadge status="rejected_resubmit" />
      </p>
    </div>
  );
}
