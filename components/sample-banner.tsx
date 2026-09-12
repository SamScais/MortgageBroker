export function SampleBanner({ children }: { children?: React.ReactNode }) {
  const ephemeral = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

  return (
    <div className="rounded-lg border border-[#d8c48a] bg-[#f8e8c8] px-3 py-2 text-sm text-[#5c4310]">
      {children ?? (
        <>
          <strong>SAMPLE / FAKE demo.</strong> Not real client information and
          not financial advice.{" "}
          {ephemeral
            ? "Private preview: uploads and review actions may not persist across serverless instances. Confirmed fact-find fields are kept in a signed browser cookie so Confirm → Export still works."
            : "Files stay on this machine. Confirmed fact-find fields are stored in the local database."}
        </>
      )}
    </div>
  );
}
