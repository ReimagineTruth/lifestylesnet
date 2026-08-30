import type { AppDb } from "./types";
import * as schema from "./schema";
import { getNitroCloudflareEnv, pickD1Binding } from "@/lib/cloudflare-env.server";

export type { AppDb } from "./types";

const DB_SETUP_HINT =
  "Create a Cloudflare D1 database named lifestylesnet, bind it as DB in wrangler.jsonc (database_id required), then redeploy. Locally: npx wrangler d1 create lifestylesnet --binding DB --update-config";

async function resolveDatabaseTarget() {
  const nitroEnv = getNitroCloudflareEnv();
  const d1FromNitro = pickD1Binding(nitroEnv);

  let d1FromWorkers: unknown = null;
  let workersModuleLoaded = false;
  try {
    // @ts-expect-error - virtual module only available in the Cloudflare Worker runtime
    const { env } = await import("cloudflare:workers");
    workersModuleLoaded = true;
    d1FromWorkers = pickD1Binding(env as Record<string, unknown>);
  } catch {
    // Not in a Workers runtime with cloudflare:workers (local Vite dev uses SQLite).
  }

  const d1 = d1FromNitro ?? d1FromWorkers ?? null;
  if (d1) {
    return { d1, onCloudflare: true as const };
  }

  // Nitro only sets __env__ on real Cloudflare Worker requests — missing DB means deploy config.
  if (nitroEnv !== undefined) {
    throw new Error(`Database binding DB is not configured. ${DB_SETUP_HINT}`);
  }

  // cloudflare:workers may load in some dev tooling without a real binding — keep local SQLite.
  if (workersModuleLoaded) {
    return { d1: null, onCloudflare: false as const };
  }

  return { d1: null, onCloudflare: false as const };
}

export async function ensureDbReady(): Promise<AppDb> {
  const { d1, onCloudflare } = await resolveDatabaseTarget();
  if (d1) {
    const { ensureD1DbReady } = await import("./d1.server");
    return ensureD1DbReady(d1 as Parameters<typeof ensureD1DbReady>[0]);
  }
  if (onCloudflare) {
    throw new Error(`Database binding DB is not configured. ${DB_SETUP_HINT}`);
  }
  const { ensureSqliteDbReady } = await import("./sqlite.server");
  return ensureSqliteDbReady();
}

export { schema };
