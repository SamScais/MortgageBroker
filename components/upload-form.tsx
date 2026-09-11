"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function UploadForm({
  itemId,
  token,
}: {
  itemId: string;
  token: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const form = event.currentTarget;
    const body = new FormData(form);
    body.set("itemId", itemId);
    body.set("token", token);
    try {
      const response = await fetch("/api/uploads", {
        method: "POST",
        body,
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Upload failed.");
        return;
      }
      form.reset();
      router.refresh();
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="token" value={token} />
      <label className="block text-sm font-medium text-ink">
        Choose a file
        <input
          type="file"
          name="file"
          required
          accept="application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif,.pdf,.jpg,.jpeg,.png,.webp,.heic"
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
        />
      </label>
      <p className="text-xs text-ink-soft">
        PDF or photo, up to 10 MB. Use the camera on a phone if that is easier.
      </p>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-accent px-4 text-sm font-semibold text-white hover:bg-[#163828] disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Uploading…" : "Upload document"}
      </button>
    </form>
  );
}
