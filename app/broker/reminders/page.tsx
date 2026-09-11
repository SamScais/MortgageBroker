import Link from "next/link";
import { SampleBanner } from "@/components/sample-banner";
import { requireBroker } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { listReminders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  const session = await requireBroker();
  const reminders = listReminders(session.brokerId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl text-ink">Reminder log</h1>
        <p className="text-ink-soft">
          DEMO email log — these messages are not delivered to a real inbox.
        </p>
      </div>
      <SampleBanner>
        Live email is not wired in this MVP. Use this log to see what a reminder
        would say. Overdue flags still calculate automatically on each case.
      </SampleBanner>
      {reminders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line bg-panel p-6 text-ink-soft">
          No demo reminders yet. Open a case with outstanding documents and
          choose “Send reminder”.
        </p>
      ) : (
        <ul className="space-y-4">
          {reminders.map((row) => (
            <li
              key={row.id}
              className="rounded-xl border border-line bg-panel p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-warn">
                DEMO email
              </p>
              <h2 className="mt-1 text-lg text-ink">{row.subject}</h2>
              <p className="text-sm text-ink-soft">
                To {row.to} · {formatDateTime(row.sentAt)} · {row.clientLabel}
              </p>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-muted p-3 text-sm">
                {row.body}
              </pre>
              <Link
                href={`/broker/cases/${row.caseId}`}
                className="mt-3 inline-block text-sm underline"
              >
                Open case
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
