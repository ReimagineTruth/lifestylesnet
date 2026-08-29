/** Lazy DB access — server-only; never import from client components. */
export async function withDb() {
  const { ensureDbReady, schema } = await import("@/db/index.server");
  const db = await ensureDbReady();
  return { db, schema };
}
