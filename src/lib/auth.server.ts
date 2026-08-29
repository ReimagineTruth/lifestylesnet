import { eq } from "drizzle-orm";
import { ensureDbReady } from "@/db/index";
import * as schema from "@/db/schema";

export async function requireAdmin(token: string) {
  const db = await ensureDbReady();
  const [session] = await db
    .select()
    .from(schema.adminSessions)
    .where(eq(schema.adminSessions.token, token));
  if (!session || session.expiresAt < new Date().toISOString()) {
    throw new Error("Unauthorized");
  }
}

export async function isAdmin(token: string) {
  try {
    await requireAdmin(token);
    return true;
  } catch {
    return false;
  }
}
