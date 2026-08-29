import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { requireCustomer } from "@/lib/auth.server";
import { newId } from "@/lib/id";
import type { BankCode, PaymongoCheckoutMethod } from "@/lib/paymongo";
import { paymentMethodToCheckoutChoice } from "@/lib/payment-methods";
import { withDb } from "@/lib/server-db.server";
import type { WalletTransactionView } from "@/lib/wallet";

export type { WalletTransactionView } from "@/lib/wallet";

const topupInput = z.object({
  token: z.string(),
  amount: z.number().int().min(100).max(500_000),
  paymentMethod: z.enum(["qr_ph", "bank", "paypal"]),
  bankCode: z.enum(["bpi", "ubp", "bdo", "landbank", "metrobank"]).optional(),
});

export async function completeWalletTopup(opts: {
  topupId?: string;
  intentId?: string;
  paymentId?: string;
}) {
  const { db, schema } = await withDb();
  let tx: (typeof schema.walletTransactions.$inferSelect) | undefined;

  if (opts.topupId) {
    [tx] = await db
      .select()
      .from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.id, opts.topupId));
  } else if (opts.intentId) {
    [tx] = await db
      .select()
      .from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.paymongoIntentId, opts.intentId));
  }

  if (!tx || tx.status !== "pending" || tx.type !== "topup") return null;

  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.customerId, tx.customerId));
  if (!wallet) return null;

  const now = new Date().toISOString();
  const balanceAfter = wallet.balance + tx.amount;

  await db
    .update(schema.wallets)
    .set({ balance: balanceAfter, updatedAt: now })
    .where(eq(schema.wallets.customerId, tx.customerId));

  await db
    .update(schema.walletTransactions)
    .set({
      status: "completed",
      balanceAfter,
      reference: opts.paymentId ?? opts.intentId ?? tx.reference,
      completedAt: now,
    })
    .where(eq(schema.walletTransactions.id, tx.id));

  return { topupId: tx.id, customerId: tx.customerId, balanceAfter };
}

export async function debitWalletForOrder(customerId: string, orderId: string, amount: number) {
  const { db, schema } = await withDb();
  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.customerId, customerId));
  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient wallet balance.");
  }

  const now = new Date().toISOString();
  const balanceAfter = wallet.balance - amount;
  const txId = newId("wtx-");

  await db
    .update(schema.wallets)
    .set({ balance: balanceAfter, updatedAt: now })
    .where(eq(schema.wallets.customerId, customerId));

  await db.insert(schema.walletTransactions).values({
    id: txId,
    customerId,
    type: "debit",
    amount: -amount,
    balanceAfter,
    status: "completed",
    reference: orderId,
    paymongoIntentId: null,
    paypalOrderId: null,
    metadata: JSON.stringify({ orderId }),
    createdAt: now,
    completedAt: now,
  });

  return { txId, balanceAfter };
}

export async function applyPendingWalletDebitForOrder(orderId: string) {
  const { db, schema } = await withDb();
  const [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
  if (!row?.customerId || !row.walletApplied || row.walletApplied <= 0) return null;

  const [existing] = await db
    .select()
    .from(schema.walletTransactions)
    .where(eq(schema.walletTransactions.reference, orderId));
  if (existing) return null;

  return debitWalletForOrder(row.customerId, orderId, row.walletApplied);
}

export async function getCustomerWalletBalance(customerId: string) {
  const { db, schema } = await withDb();
  const [wallet] = await db
    .select()
    .from(schema.wallets)
    .where(eq(schema.wallets.customerId, customerId));
  return wallet?.balance ?? 0;
}

export const getWalletSummaryFn = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const customerId = await requireCustomer(token);
    const { db, schema } = await withDb();
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.customerId, customerId));
    const rows = await db
      .select()
      .from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.customerId, customerId))
      .orderBy(desc(schema.walletTransactions.createdAt))
      .limit(20);

    const transactions: WalletTransactionView[] = rows.map((row) => ({
      id: row.id,
      type: row.type,
      amount: row.amount,
      balanceAfter: row.balanceAfter,
      status: row.status,
      reference: row.reference,
      createdAt: row.createdAt,
      completedAt: row.completedAt,
    }));

    return { balance: wallet?.balance ?? 0, transactions };
  });

export const createWalletTopupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => topupInput.parse(data))
  .handler(async ({ data }) => {
    const customerId = await requireCustomer(data.token);
    const { readEffectivePaymentMethodsForOrder } = await import("@/lib/settings.server");
    const enabled = await readEffectivePaymentMethodsForOrder();
    const choice = paymentMethodToCheckoutChoice(data.paymentMethod);
    if (!choice || !enabled[choice]) {
      throw new Error("This payment method is not available for top-up.");
    }

    const { db, schema } = await withDb();
    const topupId = newId("top-");
    const now = new Date().toISOString();
    const [wallet] = await db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.customerId, customerId));

    await db.insert(schema.walletTransactions).values({
      id: topupId,
      customerId,
      type: "topup",
      amount: data.amount,
      balanceAfter: wallet?.balance ?? 0,
      status: "pending",
      reference: null,
      paymongoIntentId: null,
      paypalOrderId: null,
      metadata: JSON.stringify({ paymentMethod: data.paymentMethod }),
      createdAt: now,
      completedAt: null,
    });

    const { siteUrl } = await import("@/lib/site-url");
    const returnUrl = `${siteUrl()}/account?topup=${topupId}`;

    if (data.paymentMethod === "paypal") {
      const { createPayPalCheckoutOrder, paypalTopupReturnUrls } = await import(
        "@/lib/paypal-core.server"
      );
      const { returnUrl: paypalReturn, cancelUrl } = paypalTopupReturnUrls(topupId);
      const result = await createPayPalCheckoutOrder(
        topupId,
        data.amount,
        paypalReturn,
        cancelUrl,
        { description: `Lifestyles PH wallet top-up ${topupId}` },
      );
      await db
        .update(schema.walletTransactions)
        .set({ paypalOrderId: result.paypalOrderId })
        .where(eq(schema.walletTransactions.id, topupId));
      return {
        topupId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        paypalOrderId: result.paypalOrderId,
      };
    }

    const { createPaymongoPayment } = await import("@/lib/paymongo-core.server");
    const payment = await createPaymongoPayment(
      topupId,
      data.amount,
      data.paymentMethod as PaymongoCheckoutMethod,
      returnUrl,
      data.bankCode as BankCode | undefined,
      { purpose: "wallet_topup", topup_id: topupId },
    );

    await db
      .update(schema.walletTransactions)
      .set({ paymongoIntentId: payment.intentId })
      .where(eq(schema.walletTransactions.id, topupId));

    return {
      topupId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      payment,
    };
  });

export const confirmWalletTopupFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z.object({ token: z.string(), topupId: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    await requireCustomer(data.token);
    const { db, schema } = await withDb();
    const [tx] = await db
      .select()
      .from(schema.walletTransactions)
      .where(eq(schema.walletTransactions.id, data.topupId));
    if (!tx) throw new Error("Top-up not found");

    if (tx.status === "completed") {
      const [wallet] = await db
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.customerId, tx.customerId));
      return { paid: true, balance: wallet?.balance ?? 0 };
    }

    if (tx.paymongoIntentId) {
      const { fetchPaymentIntentStatus } = await import("@/lib/paymongo-core.server");
      const { paid } = await fetchPaymentIntentStatus(tx.paymongoIntentId);
      if (paid) {
        const result = await completeWalletTopup({
          topupId: tx.id,
          intentId: tx.paymongoIntentId,
        });
        return { paid: true, balance: result?.balanceAfter ?? 0 };
      }
      return { paid: false, balance: 0 };
    }

    if (tx.paypalOrderId) {
      const { capturePayPalCheckoutOrder } = await import("@/lib/paypal-core.server");
      const { paid, captureId } = await capturePayPalCheckoutOrder(tx.paypalOrderId);
      if (paid) {
        const result = await completeWalletTopup({
          topupId: tx.id,
          paymentId: captureId ?? tx.paypalOrderId,
        });
        return { paid: true, balance: result?.balanceAfter ?? 0 };
      }
      return { paid: false, balance: 0 };
    }

    return { paid: false, balance: 0 };
  });

export const captureWalletTopupPayPalFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        token: z.string(),
        topupId: z.string(),
        paypalOrderId: z.string(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    await requireCustomer(data.token);
    const { capturePayPalCheckoutOrder } = await import("@/lib/paypal-core.server");
    const { paid, captureId } = await capturePayPalCheckoutOrder(data.paypalOrderId);
    if (!paid) return { paid: false, balance: 0 };
    const result = await completeWalletTopup({
      topupId: data.topupId,
      paymentId: captureId ?? data.paypalOrderId,
    });
    return { paid: true, balance: result?.balanceAfter ?? 0 };
  });
