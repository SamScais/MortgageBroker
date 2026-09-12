/**
 * Seed SAMPLE demo data when a Node server instance boots.
 * On Vercel this writes into the writable temp dir (see lib/paths.ts).
 * Skipped during `next build` so the compile does not touch disk.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  const { loadDb } = await import("./lib/store");
  loadDb();
}
