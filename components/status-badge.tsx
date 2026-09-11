import { STATUS_LABELS } from "@/lib/status";
import type { ItemStatus } from "@/lib/types";

const STYLES: Record<ItemStatus, string> = {
  needed: "bg-muted text-ink-soft",
  uploaded: "bg-[#d7ebf3] text-[#215e7a]",
  needs_review: "bg-[#f8e8c8] text-[#8a5a10]",
  accepted: "bg-[#dceee4] text-[#2c6b4f]",
  rejected_resubmit: "bg-[#f3d6d6] text-[#9b2c2c]",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
