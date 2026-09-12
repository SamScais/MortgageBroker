import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseSectionNav } from "@/components/case-section-nav";
import { FactFindFieldRow } from "@/components/fact-find-field-row";
import { FactFindHandoff } from "@/components/fact-find-handoff";
import { SampleBanner } from "@/components/sample-banner";
import { requireBroker } from "@/lib/auth";
import { usingFactFindOverlay } from "@/lib/fact-find-cookie";
import { FACT_FIND_GROUP_LABELS, FACT_FIND_SOURCE_LABELS, isFactFindSourceKey } from "@/lib/fact-find-schema";
import { syncFactFindOnDb } from "@/lib/fact-find";
import { countFieldStates } from "@/lib/fact-find-state";
import { formatDate } from "@/lib/format";
import { getCaseForBroker, itemsForCase } from "@/lib/queries";
import { updateDb } from "@/lib/store";
import { FACT_FIND_GROUPS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FactFindPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireBroker();
  const { id } = await params;
  const { caseRecord, factFind, items } = await usingFactFindOverlay(() => {
    const currentCase = getCaseForBroker(session.brokerId, id);
    const currentFactFind = updateDb((db) => {
      const current = db.cases.find(
        (row) => row.id === id && row.brokerId === session.brokerId,
      );
      if (!current) return undefined;
      return syncFactFindOnDb(
        db,
        current,
        db.items.filter((row) => row.caseId === id),
        db.files,
      );
    });
    return {
      caseRecord: currentCase,
      factFind: currentFactFind,
      items: currentCase ? itemsForCase(currentCase.id) : [],
    };
  });
  if (!caseRecord) notFound();

  const counts = countFieldStates(factFind?.fields ?? []);
  const waiting = items.filter(
    (item) =>
      isFactFindSourceKey(item.itemKey) && item.status !== "accepted",
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-ink-soft">
          <Link href="/broker" className="underline">
            Cases
          </Link>
          {" · "}
          <Link href={`/broker/cases/${caseRecord.id}`} className="underline">
            {caseRecord.clientLabel}
          </Link>
        </p>
        <h1 className="mt-1 text-3xl text-ink">PAYG fact-find</h1>
        <p className="text-ink-soft">
          {caseRecord.clientLabel} · {caseRecord.scenarioName} · due{" "}
          {formatDate(caseRecord.dueAt)}
        </p>
      </div>
      <CaseSectionNav caseId={caseRecord.id} active="fact-find" />
      <SampleBanner>
        <strong>SAMPLE / FAKE draft.</strong> Deterministic demo extraction — not
        live OCR, not Open Banking, and not lodged to ApplyOnline or any lender.
      </SampleBanner>

      <section className="space-y-2 rounded-xl border border-line bg-panel p-4">
        <h2 className="text-lg text-ink">Broker confirm every field</h2>
        <p className="text-sm text-ink-soft">
          Fields are drafted only from accepted documents. Confirm, edit or clear
          each one. Confirmed values persist after refresh — locally in{" "}
          <code className="rounded bg-muted px-1">data/db.json</code>, and on
          the Vercel preview in a signed browser cookie (the temp database is
          per-instance). This app never auto-lodges.
        </p>
        <p className="text-sm">
          {counts.draft} draft · {counts.confirmed} confirmed · {counts.cleared}{" "}
          cleared
        </p>
      </section>

      <FactFindHandoff
        caseId={caseRecord.id}
        confirmedCount={counts.confirmed}
        acceptedCount={caseRecord.acceptedCount}
      />

      {waiting.length > 0 ? (
        <section className="space-y-2 rounded-xl border border-dashed border-line bg-panel p-4">
          <h2 className="text-lg text-ink">Waiting on accepted documents</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {waiting.map((item) => (
              <li key={item.id}>
                {isFactFindSourceKey(item.itemKey)
                  ? FACT_FIND_SOURCE_LABELS[item.itemKey]
                  : item.title}{" "}
                — {item.status.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!factFind || factFind.fields.length === 0 ? (
        <p className="rounded-xl border border-line bg-panel p-4 text-ink-soft">
          No PAYG draft fields yet. Accept photo ID, payslips, bank statements,
          liability documents or secondary ID on the checklist.
        </p>
      ) : (
        FACT_FIND_GROUPS.map((group) => {
          const fields = factFind.fields.filter((field) => field.group === group);
          if (fields.length === 0) return null;
          const sourceTitle = fields[0]?.sourceItemTitle;
          return (
            <section key={group} className="space-y-3">
              <div>
                <h2 className="text-lg text-ink">{FACT_FIND_GROUP_LABELS[group]}</h2>
                {sourceTitle ? (
                  <p className="text-sm text-ink-soft">
                    Source: accepted {sourceTitle}
                  </p>
                ) : null}
              </div>
              <ul className="space-y-2">
                {fields.map((field) => (
                  <FactFindFieldRow
                    key={field.key}
                    caseId={caseRecord.id}
                    field={field}
                  />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
