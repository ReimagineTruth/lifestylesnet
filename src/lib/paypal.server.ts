import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { ensureDbReady } from "@/db/index";
import * as schema from "@/db/schema";
import {
  capturePayPalCheckoutOrder,
  createPayPalCheckoutOrder,
  getPayPalPublicConfig,
  markOrderPaidByPayPal,
  paypalReturnUrls,
} from "@/lib/paypal-core.server";

export const getPayPalConfigFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return getPayPalPublicConfig();
  } catch {
    return null;
  }
});

const createInput = z.object({
  orderId: z.string(),
});

export const createPayPalOrderFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => createInput.parse(data))
  .handler(async ({ data }) => {
    const db = await ensureDbReady();
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, data.orderId));
    if (!row) throw new Error("Order not found");
    if (row.paymentMethod !== "paypal") throw new Error("Order is not a PayPal checkout");
    if (row.status === "paid") throw new Error("Order is already paid");

    const { returnUrl, cancelUrl } = paypalReturnUrls(row.id);
    const result = await createPayPalCheckoutOrder(row.id, row.total, returnUrl, cancelUrl);

    await db
      .update(schema.orders)
      .set({ paypalOrderId: result.paypalOrderId })
      .where(eq(schema.orders.id, row.id));

    return result;
  });

const captureInput = z.object({
  orderId: z.string(),
  paypalOrderId: z.string().optional(),
});

export const capturePayPalPaymentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => captureInput.parse(data))
  .handler(async ({ data }) => {
    const db = await ensureDbReady();
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, data.orderId));
    if (!row) throw new Error("Order not found");

    const paypalOrderId = data.paypalOrderId ?? row.paypalOrderId;
    if (!paypalOrderId) return { paid: row.status === "paid", status: row.status };

    const { paid, status, captureId } = await capturePayPalCheckoutOrder(paypalOrderId);
    if (paid) {
      await markOrderPaidByPayPal({
        orderId: data.orderId,
        paypalOrderId,
        ...(captureId ? { captureId } : {}),
      });
      return { paid: true, status: "paid" };
    }

    return { paid: row.status === "paid", status };
  });
