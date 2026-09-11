"use client";

import { useActionState } from "react";
import { sendReminderAction } from "@/app/actions/remind";

export function ReminderButton({ caseId }: { caseId: string }) {
  const [state, action, pending] = useActionState(sendReminderAction, null);

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="caseId" value={caseId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-semibold hover:bg-muted disabled:opacity-60"
      >
        {pending ? "Logging reminder…" : "Send reminder (demo email log)"}
      </button>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      {state?.ok ? <p className="text-sm text-ok">{state.ok}</p> : null}
    </form>
  );
}
