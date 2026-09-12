import Link from "next/link";
import { SampleBanner } from "@/components/sample-banner";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
          Australian mortgage brokers
        </p>
        <h1 className="text-4xl leading-tight text-ink">Document intake</h1>
        <p className="max-w-xl text-lg text-ink-soft">
          Create a client case, share one upload link, and review documents
          against a home-loan checklist. Local demo only.
        </p>
      </header>
      <SampleBanner />
      <div className="flex flex-col gap-3 sm:flex-row">
        {session ? (
          <Link
            href="/broker"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-white"
          >
            Open broker workspace
          </Link>
        ) : (
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-sm font-semibold text-white"
          >
            Broker sign in
          </Link>
        )}
      </div>
      <section className="rounded-xl border border-line bg-panel p-5 text-sm leading-6 text-ink-soft">
        <h2 className="mb-2 text-lg text-ink">What this demo does</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Broker login and case list</li>
          <li>Purchase, refinance and first-home-buyer checklists</li>
          <li>One unique client link — no client account</li>
          <li>Upload, status, overdue flag, and a demo reminder log</li>
          <li>Review queue: accept or request a resubmit with a note</li>
        </ul>
        <p className="mt-3">
          It does not calculate loans, talk to banks, or give compliance advice.
          Locally, files and confirmed fact-find fields live in{" "}
          <code className="rounded bg-muted px-1">data/</code>. On a Vercel
          preview, uploads are seeded into a writable temp folder and may not
          persist across instances. Confirmed fact-find fields are also stored
          in a signed browser cookie so Confirm → Export CSV/JSON still works.
        </p>
      </section>
    </div>
  );
}
