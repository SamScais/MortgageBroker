export default function ClientLinkNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-3 px-4 py-16 text-center">
      <h1 className="text-2xl text-ink">Link not found</h1>
      <p className="text-ink-soft">
        This upload link is not valid. Ask your broker to send the current link
        from the case.
      </p>
    </div>
  );
}
