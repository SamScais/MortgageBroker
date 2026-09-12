import { FIELD_STATE_LABELS } from "@/lib/fact-find-state";
import type { FactFindFieldState } from "@/lib/types";

const STYLES: Record<FactFindFieldState, string> = {
  draft: "bg-[#f8e8c8] text-[#8a5a10]",
  confirmed: "bg-[#dceee4] text-[#2c6b4f]",
  cleared: "bg-muted text-ink-soft",
};

export function FactFindBadge({ state }: { state: FactFindFieldState }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${STYLES[state]}`}
    >
      {FIELD_STATE_LABELS[state]}
    </span>
  );
}
