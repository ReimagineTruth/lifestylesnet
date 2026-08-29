import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth.server";
import type { CustomerProfile } from "@/lib/customer-auth";
import { newId } from "@/lib/id";
import { hashPassword, verifyPassword } from "@/lib/password.server";
import { withDb } from "@/lib/server-db.server";

const SESSION_DAYS = 30;

async function getWalletBalance(
  db: Awaited<ReturnType<typeof withDb>>["db"],
  schema: Awaited<ReturnType<typeof withDb>>["schema"],
  customerId: string,
) {
  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.customerId, customerId));
  return wallet?.balance ?? 0;
}

async function createCustomerSession(
  db: Awaited<ReturnType<typeof withDb>>["db"],
  schema: Awaited<ReturnType<typeof withDb>>["schema"],
  customerId: string,
) {
  const token = newId("cust-");
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(schema.customerSessions).values({
    token,
    customerId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  });
  return { token, expiresAt: expires.toISOString() };
}

async function profileForCustomer(
  db: Awaited<ReturnType<typeof withDb>>["db"],
  schema: Awaited<ReturnType<typeof withDb>>["schema"],
  customer: Awaited<ReturnType<typeof withDb>>["schema"]["customers"]["$inferSelect"],
): Promise<CustomerProfile> {
  return {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    phone: customer.phone,
    balance: await getWalletBalance(db, schema, customer.id),
  };
}

const registerInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(20).optional(),
});

export const customerRegisterFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => registerInput.parse(data))
  .handler(async ({ data }) => {
    const { db, schema } = await withDb();
    const email = data.email.toLowerCase();
    const [existing] = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.email, email));
    if (existing) throw new Error("An account with this email already exists.");

    const now = new Date().toISOString();
    const customerId = newId("u-");
    const passwordHash = await hashPassword(data.password);

    await db.insert(schema.customers).values({
      id: customerId,
      email,
      passwordHash,
      name: data.name,
      phone: data.phone ?? null,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(schema.wallets).values({
      customerId,
      balance: 0,
      updatedAt: now,
    });

    const session = await createCustomerSession(db, schema, customerId);
    const [customer] = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.id, customerId));
    return {
      ...session,
      customer: await profileForCustomer(db, schema, customer!),
    };
  });

const loginInput = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const customerLoginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginInput.parse(data))
  .handler(async ({ data }) => {
    const { db, schema } = await withDb();
    const [customer] = await db
      .select()
      .from(schema.customers)
      .where(eq(schema.customers.email, data.email.toLowerCase()));
    if (!customer || !(await verifyPassword(data.password, customer.passwordHash))) {
      throw new Error("Invalid email or password.");
    }
    const session = await createCustomerSession(db, schema, customer.id);
    return {
      ...session,
      customer: await profileForCustomer(db, schema, customer),
    };
  });

export const verifyCustomerFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    try {
      const { db, schema } = await withDb();
      const customerId = await requireCustomer(token);
      const [customer] = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, customerId));
      if (!customer) return null;
      return profileForCustomer(db, schema, customer);
    } catch {
      return null;
    }
  });

export const customerLogoutFn = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const { db, schema } = await withDb();
    await db.delete(schema.customerSessions).where(eq(schema.customerSessions.token, token));
    return { ok: true };
  });
