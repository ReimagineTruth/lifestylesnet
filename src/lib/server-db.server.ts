/** Lazy DB access — server-only; never import from client components. */
export async function withDb() {
  const { ensureDbReady, schema } = await import("@/db/index.server");
  const db = await ensureDbReady();
  return { db, schema };
}

/**
 * Same as withDb(), but returns null instead of throwing when no database is
 * available (e.g. edge deploy without a D1 binding). Use this for public read
 * paths that can safely fall back to the static catalogue/defaults so the
 * storefront still renders instead of returning a 500.
 */
export async function tryWithDb() {
  try {
    return await withDb();
  } catch {
    return null;
  }
}
