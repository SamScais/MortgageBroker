"use client";

import { useActionState, useState } from "react";
import { factFindBulkConfirmAction } from "@/app/actions/fact-find";
import type { FactFindGroupId } from "@/lib/types";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-semibold disabled:opacity-60";

export function FactFindBulkConfirm({
  caseId,
  scope,
  group,
  drafts,
}: {
  caseId: string;
  scope: "all" | "group";
  group?: FactFindGroupId;
  drafts: Array<{ key: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [state, action, pending] = useActionState(factFindBulkConfirmAction, null);
  const count = drafts.length;

  if (count === 0) return null;

  const openLabel =
    scope === "all" ? `Confirm all drafts (${count})` : `Confirm group (${count})`;
  const submitLabel =
    scope === "all"
      ? `Confirm ${count} draft${count === 1 ? "" : "s"}`
      : `Confirm ${count} in this group`;

  if (!open) {
    return (
      <button
        type="button"
        className={`${button} bg-ok text-white`}
        onClick={() => setOpen(true)}
      >
        {openLabel}
      </button>
    );
  }

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-[#d7cfc2] bg-[#f8e8c8] px-3 py-3"
    >
      <input type="hidden" name="caseId" value={caseId} />
      <input type="hidden" name="scope" value={scope} />
      {scope === "group" && group ? (
        <input type="hidden" name="group" value={group} />
      ) : null}
      <p className="text-sm font-semibold text-ink">{openLabel}</p>
      <p className="text-sm text-ink-soft">
        SAMPLE / FAKE drafts only. You must check them first. This never lodges
        to a lender.
      </p>
      <ul className="max-h-40 overflow-y-auto rounded-md border border-line bg-white px-3 py-2 text-sm">
        {drafts.map((draft) => (
          <li key={draft.key} className="list-disc list-inside">
            {draft.label}
          </li>
        ))}
      </ul>
      <label className="flex items-start gap-2 text-sm font-medium">
        <input
          type="checkbox"
          name="acknowledged"
          value="1"
          required
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1 size-4"
        />
        <span>I have checked these draft values and want to confirm them.</span>
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={pending || !checked}
          className={`${button} bg-ok text-white`}
        >
          {pending ? "Confirming…" : submitLabel}
        </button>
        <button
          type="button"
          className={`${button} border border-line bg-white`}
          onClick={() => {
            setOpen(false);
            setChecked(false);
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
