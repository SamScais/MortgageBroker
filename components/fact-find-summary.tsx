import Link from "next/link";
import { countFieldStates } from "@/lib/fact-find-state";
import type { FactFindRecord } from "@/lib/types";

export function FactFindSummary({
  caseId,
  factFind,
  acceptedCount,
}: {
  caseId: string;
  factFind: FactFindRecord | undefined;
  acceptedCount: number;
}) {
  const counts = countFieldStates(factFind?.fields ?? []);
  const href = `/broker/cases/${caseId}/fact-find`;

  return (
    <section className="space-y-3 rounded-xl border border-line bg-panel p-4">
      <h2 className="text-lg text-ink">PAYG fact-find (draft)</h2>
      <p className="text-sm text-ink-soft">
        SAMPLE extraction from <strong>accepted</strong> documents only. Every
        field starts as a draft. Confirm, edit or clear each one — or confirm a
        group / all visible drafts after you have checked them. Confirmed fields
        can be exported as CSV or JSON. Nothing is lodged to a lender.
      </p>
      {acceptedCount === 0 ? (
        <p className="rounded-md bg-muted px-3 py-2 text-sm">
          No accepted documents to extract from yet. Accept files on the
          checklist first.
        </p>
      ) : (
        <p className="text-sm">
          {counts.draft} draft · {counts.confirmed} confirmed · {counts.cleared}{" "}
          cleared
        </p>
      )}
      <Link
        href={href}
        className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white"
      >
        Open fact-find
      </Link>
    </section>
  );
}
