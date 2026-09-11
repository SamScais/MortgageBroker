"use client";

import { useActionState } from "react";
import { reviewItemAction } from "@/app/actions/review";

export function ReviewForm({ itemId }: { itemId: string }) {
  const [state, action, pending] = useActionState(reviewItemAction, null);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="itemId" value={itemId} />
      <label className="block text-sm font-medium">
        Note to client (required if you ask for a resubmit)
        <textarea
          name="note"
          rows={3}
          className="mt-1 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
          placeholder="e.g. Please upload a colour copy with all four corners visible."
        />
      </label>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          name="decision"
          value="accepted"
          disabled={pending}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-ok px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          Accept
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected_resubmit"
          disabled={pending}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-danger bg-white px-4 text-sm font-semibold text-danger disabled:opacity-60"
        >
          Request resubmit
        </button>
      </div>
    </form>
  );
}
