import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { withDb } from "@/lib/server-db.server";

const confirmInput = z.object({
  orderId: z.string(),
  intentId: z.string().optional(),
});

export const fetchOrderQrFn = createServerFn({ method: "GET" })
  .validator((orderId: string) => orderId)
  .handler(async ({ data: orderId }) => {
    const { db, schema } = await withDb();
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
    if (!row?.paymongoIntentId) return { qrImageUrl: null as string | null };
    if (row.paymentMethod !== "qr_ph" || row.status === "paid") {
      return { qrImageUrl: null as string | null };
    }
    const { fetchQrPhImageUrl } = await import("@/lib/paymongo-core.server");
    const qrImageUrl = await fetchQrPhImageUrl(row.paymongoIntentId);
    return { qrImageUrl };
  });

export const confirmPaymongoPaymentFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => confirmInput.parse(data))
  .handler(async ({ data }) => {
    const { db, schema } = await withDb();
    const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, data.orderId));
    if (!row) throw new Error("Order not found");

    const intentId = data.intentId ?? row.paymongoIntentId;
    if (!intentId) return { paid: row.status === "paid", status: row.status };

    const { fetchPaymentIntentStatus, markOrderPaidByIntent } = await import(
      "@/lib/paymongo-core.server"
    );
    const { status, paid } = await fetchPaymentIntentStatus(intentId);
    if (paid && row.status !== "paid") {
      await markOrderPaidByIntent({ intentId, orderId: data.orderId });
      return { paid: true, status: "paid" };
    }
    return { paid: row.status === "paid", status };
  });
