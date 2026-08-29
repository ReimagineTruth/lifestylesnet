import { eq } from "drizzle-orm";
import { withDb } from "@/lib/server-db.server";

export async function requireAdmin(token: string) {
  const { db, schema } = await withDb();
  const [session] = await db
    .select()
    .from(schema.adminSessions)
    .where(eq(schema.adminSessions.token, token));
  if (!session || session.expiresAt < new Date().toISOString()) {
    throw new Error("Unauthorized");
  }
}

export async function requireCustomer(token: string) {
  const { db, schema } = await withDb();
  const [session] = await db
    .select()
    .from(schema.customerSessions)
    .where(eq(schema.customerSessions.token, token));
  if (!session || session.expiresAt < new Date().toISOString()) {
    throw new Error("Unauthorized");
  }
  return session.customerId;
}

export async function isAdmin(token: string) {
  try {
    await requireAdmin(token);
    return true;
  } catch {
    return false;
  }
}

export async function isCustomer(token: string) {
  try {
    await requireCustomer(token);
    return true;
  } catch {
    return false;
  }
}
