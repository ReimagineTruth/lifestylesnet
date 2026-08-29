import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { ensureDbReady } from "@/db/index";
import * as schema from "@/db/schema";
import type { Order, OrderLine, OrderStatus } from "@/lib/orders";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT, newOrderId } from "@/lib/orders";
import { dbGetVariant, newId } from "./db-mapper";
import { isAdmin, requireAdmin } from "./auth.server";
import { createPaymongoPayment, siteUrl } from "./paymongo-core.server";
import type { BankCode, PaymongoCheckoutMethod } from "./paymongo";

const createOrderInput = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    province: z.string(),
    postal: z.string(),
    notes: z.string().optional(),
  }),
  paymentMethod: z.enum([
    "cod",
    "qr_ph",
    "gcash",
    "maya",
    "grab_pay",
    "shopee_pay",
    "billease",
    "bank",
    "card",
    "paypal",
  ]),
  bankCode: z.enum(["bpi", "ubp", "bdo", "landbank", "metrobank"]).optional(),
  preferredProvider: z.string().optional(),
  preferredProviderName: z.string().optional(),
  items: z.array(
    z.object({
      variantId: z.string(),
      qty: z.number().int().positive(),
    }),
  ),
});

function mapOrder(
  row: typeof schema.orders.$inferSelect,
  lines: (typeof schema.orderLines.$inferSelect)[],
): Order {
  const customer: Order["customer"] = {
    name: row.customerName,
    email: row.customerEmail,
    phone: row.customerPhone,
    address: row.customerAddress,
    city: row.customerCity,
    province: row.customerProvince,
    postal: row.customerPostal,
  };
  if (row.customerNotes) customer.notes = row.customerNotes;

  return {
    id: row.id,
    createdAt: row.createdAt,
    status: row.status as OrderStatus,
    customer,
    paymentMethod: row.paymentMethod as Order["paymentMethod"],
    ...(row.paymentReference ? { reference: row.paymentReference } : {}),
    ...(row.paymongoIntentId ? { paymongoIntentId: row.paymongoIntentId } : {}),
    ...(row.paypalOrderId ? { paypalOrderId: row.paypalOrderId } : {}),
    ...(row.bankCode ? { bankCode: row.bankCode as BankCode } : {}),
    lines: lines.map((l): OrderLine => ({
      slug: l.productSlug,
      variantId: l.variantId,
      code: l.skuCode,
      name: l.name,
      qty: l.qty,
      price: l.unitPrice,
    })),
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
  };
}

export const createOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createOrderInput.parse(data))
  .handler(async ({ data }) => {
    const db = await ensureDbReady();
    const resolvedLines: OrderLine[] = [];

    for (const item of data.items) {
      const line = await dbGetVariant(item.variantId);
      if (!line) throw new Error(`Unknown product variant: ${item.variantId}`);
      resolvedLines.push({
        slug: line.product.slug,
        variantId: line.variant.id,
        code: line.variant.code,
        name: `${line.product.name} (${line.variant.label})`,
        qty: item.qty,
        price: line.variant.price,
      });
    }

    const subtotal = resolvedLines.reduce((sum, l) => sum + l.price * l.qty, 0);
    const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
    const total = subtotal + shipping;
    const orderId = newOrderId();
    const now = new Date().toISOString();

    const { readEffectivePaymentMethodsForOrder } = await import("@/lib/settings.server");
    const { paymentMethodToCheckoutChoice } = await import("@/lib/payment-methods");
    const enabledMethods = await readEffectivePaymentMethodsForOrder();
    const checkoutChoice = paymentMethodToCheckoutChoice(data.paymentMethod);
    if (!checkoutChoice || !enabledMethods[checkoutChoice]) {
      throw new Error("This payment method is not available. Please choose another option.");
    }

    let paymongoIntentId: string | null = null;
    let paymentResult: Awaited<ReturnType<typeof createPaymongoPayment>> | null = null;

    if (data.paymentMethod !== "cod" && data.paymentMethod !== "paypal") {
      const returnUrl = `${siteUrl()}/order/${orderId}?payment=return`;
      const extraMetadata: Record<string, string> = {};
      if (data.preferredProvider) {
        extraMetadata["preferred_provider"] = data.preferredProvider;
        if (data.preferredProviderName) {
          extraMetadata["preferred_provider_name"] = data.preferredProviderName;
        }
      }
      paymentResult = await createPaymongoPayment(
        orderId,
        total,
        data.paymentMethod as PaymongoCheckoutMethod,
        returnUrl,
        data.bankCode as BankCode | undefined,
        extraMetadata,
      );
      paymongoIntentId = paymentResult.intentId;
    }

    await db.insert(schema.orders).values({
      id: orderId,
      createdAt: now,
      status: "pending",
      paymentMethod: data.paymentMethod,
      paymentReference: null,
      paymongoIntentId,
      bankCode: data.bankCode ?? null,
      customerName: data.customer.name,
      customerEmail: data.customer.email.toLowerCase(),
      customerPhone: data.customer.phone,
      customerAddress: data.customer.address,
      customerCity: data.customer.city,
      customerProvince: data.customer.province,
      customerPostal: data.customer.postal,
      customerNotes: data.customer.notes ?? null,
      subtotal,
      shipping,
      total,
    });

    for (const line of resolvedLines) {
      await db.insert(schema.orderLines).values({
        orderId,
        variantId: line.variantId!,
        productSlug: line.slug,
        skuCode: line.code!,
        name: line.name,
        qty: line.qty,
        unitPrice: line.price,
      });
    }

    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
    const dbLines = await db
      .select()
      .from(schema.orderLines)
      .where(eq(schema.orderLines.orderId, orderId));
    const order = mapOrder(row!, dbLines);

    return {
      order,
      payment: paymentResult,
    };
  });

export const getOrderFn = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const db = await ensureDbReady();
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    if (!row) return null;
    const lines = await db
      .select()
      .from(schema.orderLines)
      .where(eq(schema.orderLines.orderId, id));
    return mapOrder(row, lines);
  });

export const listOrdersByEmailFn = createServerFn({ method: "GET" })
  .validator((email: string) => email.trim().toLowerCase())
  .handler(async ({ data: email }) => {
    const db = await ensureDbReady();
    const rows = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.customerEmail, email))
      .orderBy(desc(schema.orders.createdAt));
    const allLines = await db.select().from(schema.orderLines);
    return rows
      .map((row) =>
        mapOrder(
          row,
          allLines.filter((l) => l.orderId === row.id),
        ),
      )
      .reverse();
  });

export const listAllOrdersFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    await requireAdmin(token);
    const db = await ensureDbReady();
    const rows = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
    const allLines = await db.select().from(schema.orderLines);
    return rows
      .map((row) =>
        mapOrder(
          row,
          allLines.filter((l) => l.orderId === row.id),
        ),
      )
      .reverse();
  });

export const updateOrderStatusFn = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string; status: OrderStatus }) => data)
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const db = await ensureDbReady();
    await db
      .update(schema.orders)
      .set({ status: data.status })
      .where(eq(schema.orders.id, data.id));
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, data.id));
    const lines = await db
      .select()
      .from(schema.orderLines)
      .where(eq(schema.orderLines.orderId, data.id));
    return mapOrder(row!, lines);
  });

const updateOrderAdminInput = z.object({
  token: z.string(),
  id: z.string(),
  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]).optional(),
  reference: z.string().optional(),
});

export const updateOrderAdminFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => updateOrderAdminInput.parse(data))
  .handler(async ({ data }) => {
    await requireAdmin(data.token);
    const db = await ensureDbReady();
    const patch: Partial<typeof schema.orders.$inferInsert> = {};
    if (data.status) patch.status = data.status;
    if (data.reference !== undefined) patch.paymentReference = data.reference || null;
    if (Object.keys(patch).length === 0) throw new Error("Nothing to update");
    await db.update(schema.orders).set(patch).where(eq(schema.orders.id, data.id));
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, data.id));
    if (!row) throw new Error("Order not found");
    const lines = await db
      .select()
      .from(schema.orderLines)
      .where(eq(schema.orderLines.orderId, data.id));
    return mapOrder(row, lines);
  });

export const getAdminDashboardFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    await requireAdmin(token);
    const db = await ensureDbReady();
    const rows = await db.select().from(schema.orders);
    const threads = await db.select().from(schema.feedbackThreads);
    const today = new Date().toISOString().slice(0, 10);

    const byStatus = (status: OrderStatus) => rows.filter((r) => r.status === status).length;
    const revenue = rows
      .filter((r) => r.status !== "cancelled")
      .reduce((sum, r) => sum + r.total, 0);

    return {
      totalOrders: rows.length,
      pending: byStatus("pending"),
      paid: byStatus("paid"),
      shipped: byStatus("shipped"),
      delivered: byStatus("delivered"),
      cancelled: byStatus("cancelled"),
      revenue,
      ordersToday: rows.filter((r) => r.createdAt.startsWith(today)).length,
      feedbackThreads: threads.length,
      byPayment: {
        cod: rows.filter((r) => r.paymentMethod === "cod").length,
        qr_ph: rows.filter((r) => r.paymentMethod === "qr_ph").length,
        gcash: rows.filter((r) => r.paymentMethod === "gcash").length,
        maya: rows.filter((r) => r.paymentMethod === "maya").length,
        grab_pay: rows.filter((r) => r.paymentMethod === "grab_pay").length,
        shopee_pay: rows.filter((r) => r.paymentMethod === "shopee_pay").length,
        billease: rows.filter((r) => r.paymentMethod === "billease").length,
        bank: rows.filter((r) => r.paymentMethod === "bank").length,
        card: rows.filter((r) => r.paymentMethod === "card").length,
        paypal: rows.filter((r) => r.paymentMethod === "paypal").length,
      },
    };
  });

export const adminLoginFn = createServerFn({ method: "POST" })
  .validator((password: string) => password)
  .handler(async ({ data: password }) => {
    const expected = process.env["ADMIN_PASSWORD"] ?? "lifestyles-admin";
    if (password !== expected) throw new Error("Invalid password");
    const db = await ensureDbReady();
    const token = newId("adm-");
    const now = new Date();
    const expires = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(schema.adminSessions).values({
      token,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    });
    return { token, expiresAt: expires.toISOString() };
  });

export const verifyAdminFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => isAdmin(token));
