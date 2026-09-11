export function SampleBanner({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-[#d8c48a] bg-[#f8e8c8] px-3 py-2 text-sm text-[#5c4310]">
      {children ?? (
        <>
          <strong>SAMPLE / FAKE demo.</strong> Not real client information, not
          financial advice, and files stay on this machine.
        </>
      )}
    </div>
  );
}
