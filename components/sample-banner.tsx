export function SampleBanner({ children }: { children?: React.ReactNode }) {
  const ephemeral = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);

  return (
    <div className="rounded-lg border border-[#d8c48a] bg-[#f8e8c8] px-3 py-2 text-sm text-[#5c4310]">
      {children ?? (
        <>
          <strong>SAMPLE / FAKE demo.</strong> Not real client information and
          not financial advice.{" "}
          {ephemeral
            ? "Private preview: SAMPLE data is seeded into a temporary folder. Uploads may not persist across instances."
            : "Files stay on this machine."}
        </>
      )}
    </div>
  );
}
