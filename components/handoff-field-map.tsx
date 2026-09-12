import {
  mappingGroupLabel,
  PAYG_FIELD_MAPPINGS,
} from "@/lib/fact-find-mapping";
import { FACT_FIND_GROUPS } from "@/lib/types";

export function HandoffFieldMap() {
  return (
    <details className="rounded-md border border-line bg-muted/40 px-3 py-2">
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        Handoff field map
      </summary>
      <p className="mt-2 text-xs text-ink-soft">
        Approximate Quickli / FLEX-ish paste labels —{" "}
        <strong>not a certified LIXI / ApplyOnline schema</strong>. Export
        confirmed fields only. SAMPLE / FAKE.
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead>
            <tr className="border-b border-line text-ink-soft">
              <th className="py-1 pr-3 font-semibold">Our key</th>
              <th className="py-1 pr-3 font-semibold">FLEX-ish</th>
              <th className="py-1 font-semibold">Quickli-ish</th>
            </tr>
          </thead>
          <tbody>
            {FACT_FIND_GROUPS.flatMap((group) => {
              const rows = PAYG_FIELD_MAPPINGS.filter(
                (row) => row.group === group,
              );
              if (rows.length === 0) return [];
              return [
                <tr key={`g-${group}`}>
                  <td
                    colSpan={3}
                    className="pt-2 pb-1 font-semibold text-ink"
                  >
                    {mappingGroupLabel(group)}
                  </td>
                </tr>,
                ...rows.map((row) => (
                  <tr key={row.key} className="border-t border-line/70 align-top">
                    <td className="py-1 pr-3">
                      <code>{row.concept}</code>
                      <div className="text-ink-soft">{row.label}</div>
                    </td>
                    <td className="py-1 pr-3">{row.flex}</td>
                    <td className="py-1">{row.quickli}</td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>
    </details>
  );
}
