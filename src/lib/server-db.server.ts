/** Lazy DB access — server-only; never import from client components. */
export async function withDb() {
  const { ensureDbReady } = await import("@/db/index");
  const schema = await import("@/db/schema");
  const db = await ensureDbReady();
  return { db, schema };
}
