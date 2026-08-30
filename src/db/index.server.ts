import type { AppDb } from "./types";
import * as schema from "./schema";

export type { AppDb } from "./types";

async function resolveDatabaseTarget() {
  try {
    // @ts-expect-error - virtual module only available in the Cloudflare Worker runtime
    const { env } = await import("cloudflare:workers");
    const d1 = (env as { DB?: unknown }).DB ?? null;
    return { d1, onCloudflare: true as const };
  } catch {
    return { d1: null, onCloudflare: false as const };
  }
}

export async function ensureDbReady(): Promise<AppDb> {
  const { d1, onCloudflare } = await resolveDatabaseTarget();
  if (d1) {
    const { ensureD1DbReady } = await import("./d1.server");
    return ensureD1DbReady(d1 as Parameters<typeof ensureD1DbReady>[0]);
  }
  if (onCloudflare) {
    throw new Error(
      "Database binding DB is not configured. Create a Cloudflare D1 database and bind it as DB.",
    );
  }
  const { ensureSqliteDbReady } = await import("./sqlite.server");
  return ensureSqliteDbReady();
}

export { schema };
