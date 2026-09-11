"use client";

import { useActionState } from "react";
import { createCaseAction } from "@/app/actions/cases";
import { defaultDueDateInput } from "@/lib/format";
import { SCENARIOS } from "@/lib/scenarios";

export function NewCaseForm() {
  const [state, action, pending] = useActionState(createCaseAction, null);

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-medium">
        Client name (sample only)
        <input
          name="clientName"
          required
          placeholder="e.g. Alex Taylor"
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      <p className="text-xs text-ink-soft">
        The name is stored as <span className="font-semibold">SAMPLE Client — …</span> so
        it is never treated as real PII.
      </p>
      <label className="block text-sm font-medium">
        Sample email
        <input
          type="email"
          name="clientEmail"
          required
          placeholder="client@demo.local"
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Sample mobile (optional)
        <input
          name="clientMobile"
          placeholder="0400 000 000"
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Loan scenario
        <select
          name="scenarioId"
          required
          defaultValue="purchase"
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        >
          {SCENARIOS.map((scenario) => (
            <option key={scenario.id} value={scenario.id}>
              {scenario.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium">
        Documents due
        <input
          type="date"
          name="dueAt"
          required
          defaultValue={defaultDueDateInput()}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium">
        Note shown to the client (optional)
        <textarea
          name="notes"
          rows={3}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2"
          placeholder="e.g. Please start with ID and the last 90 days of statements."
        />
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-[#163828] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Creating…" : "Create case and checklist"}
      </button>
    </form>
  );
}
