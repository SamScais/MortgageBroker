"use client";

import { useActionState, useState } from "react";
import { factFindFieldAction } from "@/app/actions/fact-find";
import { FactFindBadge } from "@/components/fact-find-badge";
import type { FactFindField } from "@/lib/types";

const button =
  "inline-flex min-h-11 items-center justify-center rounded-md px-3 text-sm font-semibold disabled:opacity-60";

export function FactFindFieldRow({
  caseId,
  field,
}: {
  caseId: string;
  field: FactFindField;
}) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(factFindFieldAction, null);

  return (
    <li className="rounded-lg border border-line bg-white px-3 py-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-ink">{field.label}</h3>
            <FactFindBadge state={field.state} />
          </div>
          {editing ? null : (
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {field.state === "cleared" ? (
                <span className="text-ink-soft">Cleared — will not be used</span>
              ) : (
                field.value
              )}
            </p>
          )}
          <p className="mt-1 text-xs text-ink-soft">{field.hint}</p>
        </div>
      </div>

      {editing ? (
        <form
          action={async (formData) => {
            await action(formData);
            setEditing(false);
          }}
          className="mt-3 space-y-2"
        >
          <input type="hidden" name="caseId" value={caseId} />
          <input type="hidden" name="fieldKey" value={field.key} />
          <input type="hidden" name="action" value="edit" />
          <label className="block text-sm font-medium">
            Edit value
            <textarea
              name="value"
              rows={3}
              defaultValue={field.state === "cleared" ? field.draftValue : field.value}
              className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
          </label>
          {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="submit"
              disabled={pending}
              className={`${button} bg-ok text-white`}
            >
              Save as confirmed
            </button>
            <button
              type="button"
              className={`${button} border border-line`}
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {field.state !== "confirmed" ? (
            <form action={action}>
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="fieldKey" value={field.key} />
              <input type="hidden" name="action" value="confirm" />
              <button
                type="submit"
                disabled={pending}
                className={`${button} bg-ok text-white`}
              >
                Confirm
              </button>
            </form>
          ) : null}
          <button
            type="button"
            className={`${button} border border-line`}
            onClick={() => setEditing(true)}
          >
            Edit
          </button>
          {field.state !== "cleared" ? (
            <form action={action}>
              <input type="hidden" name="caseId" value={caseId} />
              <input type="hidden" name="fieldKey" value={field.key} />
              <input type="hidden" name="action" value="clear" />
              <button
                type="submit"
                disabled={pending}
                className={`${button} border border-danger text-danger`}
              >
                Clear
              </button>
            </form>
          ) : null}
        </div>
      )}
    </li>
  );
}
