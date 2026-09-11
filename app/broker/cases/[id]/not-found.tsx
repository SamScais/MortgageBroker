import Link from "next/link";

export default function CaseNotFound() {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl text-ink">Case not found</h1>
      <p className="text-ink-soft">That file is not in this demo workspace.</p>
      <Link href="/broker" className="underline">
        Back to cases
      </Link>
    </div>
  );
}
