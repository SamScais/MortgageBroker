/** True while `next build` is compiling. Storage must not touch disk then. */
export function isProductionBuild(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}
