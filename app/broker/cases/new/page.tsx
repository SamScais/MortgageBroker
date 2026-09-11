import { NewCaseForm } from "@/components/new-case-form";
import { SampleBanner } from "@/components/sample-banner";
import { SCENARIOS } from "@/lib/scenarios";

export default function NewCasePage() {
  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div>
        <h1 className="text-3xl text-ink">New client case</h1>
        <p className="text-ink-soft">
          Pick a scenario to generate the document checklist. Use sample names
          only.
        </p>
      </div>
      <SampleBanner />
      <div className="rounded-xl border border-line bg-panel p-5">
        <NewCaseForm />
      </div>
      <section className="space-y-3 text-sm text-ink-soft">
        <h2 className="text-base text-ink">Scenarios included</h2>
        {SCENARIOS.map((scenario) => (
          <div key={scenario.id}>
            <p className="font-semibold text-ink">{scenario.name}</p>
            <p>{scenario.summary}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
