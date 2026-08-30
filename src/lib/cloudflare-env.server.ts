/** Nitro's Cloudflare preset sets `globalThis.__env__` on each Worker fetch. */
type CfEnv = Record<string, unknown>;

export function getNitroCloudflareEnv(): CfEnv | undefined {
  return (globalThis as { __env__?: CfEnv }).__env__;
}

/** Accept common D1 binding names used in Wrangler / platform configs. */
export function pickD1Binding(env: CfEnv | undefined): unknown {
  if (!env) return null;
  for (const key of ["DB", "D1", "DATABASE", "d1", "lifestylesnet"]) {
    const candidate = env[key];
    if (candidate && typeof candidate === "object" && "prepare" in candidate) {
      return candidate;
    }
  }
  return null;
}
