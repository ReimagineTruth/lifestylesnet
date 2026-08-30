import { createServerFn } from "@tanstack/react-start";
import {
  CHECKOUT_PAY_CHOICES,
  DEFAULT_PAYMENT_METHODS_ENABLED,
  PAYMENT_METHODS_SETTING_KEY,
  effectivePaymentMethods,
  parsePaymentMethodsEnabled,
  paymentProviderConfigured,
  serializePaymentMethodsEnabled,
  type CheckoutPayChoice,
} from "@/lib/payment-methods";
import { tryWithDb, withDb } from "@/lib/server-db.server";
import { TEST_PRODUCT_SETTING_KEY } from "@/lib/test-product";

export { TEST_PRODUCT_SETTING_KEY };

async function readTestProductVisible() {
  const conn = await tryWithDb();
  if (!conn) return true;
  const { db, schema } = conn;
  const { eq } = await import("drizzle-orm");
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (!row) return true;
  return row.value === "true";
}

async function writeTestProductVisible(visible: boolean) {
  const { db, schema } = await withDb();
  const { eq } = await import("drizzle-orm");
  const value = visible ? "true" : "false";
  const [existing] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
  if (!existing) {
    await db.insert(schema.appSettings).values({ key: TEST_PRODUCT_SETTING_KEY, value });
    return;
  }
  await db
    .update(schema.appSettings)
    .set({ value })
    .where(eq(schema.appSettings.key, TEST_PRODUCT_SETTING_KEY));
}

export const getTestProductVisibleFn = createServerFn({ method: "GET" }).handler(async () => {
  return { visible: await readTestProductVisible() };
});

export const setTestProductVisibleFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = data as { token?: string; visible?: boolean };
    if (typeof parsed.token !== "string" || typeof parsed.visible !== "boolean") {
      throw new Error("Invalid input");
    }
    return parsed as { token: string; visible: boolean };
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/auth.server");
    await requireAdmin(data.token);
    await writeTestProductVisible(data.visible);
    return { visible: data.visible };
  });

async function readPaymentMethodsAdminEnabled() {
  const conn = await tryWithDb();
  if (!conn) return parsePaymentMethodsEnabled(undefined);
  const { db, schema } = conn;
  const { eq } = await import("drizzle-orm");
  const [row] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, PAYMENT_METHODS_SETTING_KEY));
  return parsePaymentMethodsEnabled(row?.value);
}

async function writePaymentMethodsAdminEnabled(methods: Record<CheckoutPayChoice, boolean>) {
  const { db, schema } = await withDb();
  const { eq } = await import("drizzle-orm");
  const value = serializePaymentMethodsEnabled(methods);
  const [existing] = await db
    .select()
    .from(schema.appSettings)
    .where(eq(schema.appSettings.key, PAYMENT_METHODS_SETTING_KEY));
  if (!existing) {
    await db.insert(schema.appSettings).values({ key: PAYMENT_METHODS_SETTING_KEY, value });
    return;
  }
  await db
    .update(schema.appSettings)
    .set({ value })
    .where(eq(schema.appSettings.key, PAYMENT_METHODS_SETTING_KEY));
}

export async function readEffectivePaymentMethodsForOrder() {
  const admin = await readPaymentMethodsAdminEnabled();
  return effectivePaymentMethods(admin);
}

export const getPaymentMethodsForCheckoutFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const admin = await readPaymentMethodsAdminEnabled();
    const configured = paymentProviderConfigured();
    const methods = effectivePaymentMethods(admin);
    return { methods, configured };
  },
);

export const getPaymentMethodsAdminFn = createServerFn({ method: "GET" }).handler(async () => {
  const admin = await readPaymentMethodsAdminEnabled();
  const configured = paymentProviderConfigured();
  const effective = effectivePaymentMethods(admin);
  return { admin, configured, effective };
});

export const setPaymentMethodsAdminFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = data as {
      token?: string;
      methods?: Partial<Record<CheckoutPayChoice, boolean>>;
    };
    if (typeof parsed.token !== "string" || !parsed.methods || typeof parsed.methods !== "object") {
      throw new Error("Invalid input");
    }
    const methods = { ...DEFAULT_PAYMENT_METHODS_ENABLED };
    for (const key of CHECKOUT_PAY_CHOICES) {
      const value = parsed.methods[key];
      if (value !== undefined && typeof value !== "boolean") {
        throw new Error("Invalid input");
      }
      if (typeof value === "boolean") methods[key] = value;
    }
    return { token: parsed.token, methods };
  })
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/auth.server");
    await requireAdmin(data.token);
    await writePaymentMethodsAdminEnabled(data.methods);
    const configured = paymentProviderConfigured();
    return {
      admin: data.methods,
      configured,
      effective: effectivePaymentMethods(data.methods),
    };
  });
