import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { requireBroker } from "@/lib/auth";
import { reviewQueue } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BrokerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireBroker();
  const queueCount = reviewQueue(session.brokerId).length;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-line bg-panel">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/broker" className="serif text-xl text-ink">
              Document intake
            </Link>
            <p className="text-xs text-ink-soft">{session.name}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold">
            <Link href="/broker" className="hover:underline">
              Cases
            </Link>
            <Link href="/broker/queue" className="hover:underline">
              Review queue{queueCount ? ` (${queueCount})` : ""}
            </Link>
            <Link href="/broker/reminders" className="hover:underline">
              Reminder log
            </Link>
            <Link
              href="/broker/cases/new"
              className="rounded-md bg-accent px-3 py-2 text-white"
            >
              New case
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</div>
    </div>
  );
}
