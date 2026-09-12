import Link from "next/link";

export function CaseSectionNav({
  caseId,
  active,
}: {
  caseId: string;
  active: "documents" | "fact-find";
}) {
  const base = `/broker/cases/${caseId}`;
  const tab =
    "inline-flex min-h-11 items-center justify-center rounded-md px-4 text-sm font-semibold";

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Case sections">
      <Link
        href={base}
        className={`${tab} ${
          active === "documents"
            ? "bg-accent text-white"
            : "border border-line bg-panel"
        }`}
        aria-current={active === "documents" ? "page" : undefined}
      >
        Documents
      </Link>
      <Link
        href={`${base}/fact-find`}
        className={`${tab} ${
          active === "fact-find"
            ? "bg-accent text-white"
            : "border border-line bg-panel"
        }`}
        aria-current={active === "fact-find" ? "page" : undefined}
      >
        Fact find
      </Link>
    </nav>
  );
}
