import { eq } from "drizzle-orm";
import type { BankCode, PaymongoCheckoutMethod, PaymongoPaymentResult } from "@/lib/paymongo";
import { withDb } from "@/lib/server-db.server";
export { siteUrl } from "@/lib/site-url";

const PAYMONGO_API = "https://api.paymongo.com/v1";

type PaymongoResource<T> = {
  data: {
    id: string;
    type: string;
    attributes: T;
  };
};

type PaymentIntentAttrs = {
  amount: number;
  currency: string;
  status: string;
  client_key: string;
  next_action?: {
    type?: string;
    redirect?: { url?: string };
    code?: { image_url?: string };
  };
  payments?: { id: string; attributes: { status: string } }[];
  metadata?: Record<string, string>;
};

function secretKey() {
  const key = process.env["PAYMONGO_SECRET_KEY"];
  if (!key) throw new Error("PAYMONGO_SECRET_KEY is not configured");
  return key;
}

function publicKey() {
  return process.env["PAYMONGO_PUBLIC_KEY"] ?? process.env["VITE_PAYMONGO_PUBLIC_KEY"] ?? "";
}

function authHeader(key: string) {
  return `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
}

async function paymongoRequest<T>(
  path: string,
  init: RequestInit & { usePublicKey?: boolean } = {},
): Promise<PaymongoResource<T>> {
  const key = init.usePublicKey ? publicKey() || secretKey() : secretKey();
  const res = await fetch(`${PAYMONGO_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(key),
      ...(init.headers ?? {}),
    },
  });
  const body = (await res.json()) as {
    data?: PaymongoResource<T>["data"];
    errors?: { detail?: string }[];
  };
  if (!res.ok) {
    const msg = body.errors?.[0]?.detail ?? `PayMongo error (${res.status})`;
    throw new Error(msg);
  }
  return { data: body.data! };
}

export function pesosToCentavos(pesos: number) {
  return Math.round(pesos * 100);
}

function mapMethodToPaymongo(method: PaymongoCheckoutMethod, bankCode?: BankCode) {
  switch (method) {
    case "qr_ph":
      return { allowed: ["qrph"], pmType: "qrph" as const, details: undefined };
    case "gcash":
      return { allowed: ["gcash"], pmType: "gcash" as const, details: undefined };
    case "maya":
      return { allowed: ["paymaya"], pmType: "paymaya" as const, details: undefined };
    case "grab_pay":
      return { allowed: ["grab_pay"], pmType: "grab_pay" as const, details: undefined };
    case "shopee_pay":
      return { allowed: ["shopee_pay"], pmType: "shopee_pay" as const, details: undefined };
    case "billease":
      return { allowed: ["billease"], pmType: "billease" as const, details: undefined };
    case "card":
      return { allowed: ["card"], pmType: "card" as const, details: undefined };
    case "bank": {
      if (!bankCode) throw new Error("Select a bank");
      const dobBanks: BankCode[] = ["bpi", "ubp"];
      const pmType = dobBanks.includes(bankCode) ? "dob" : "brankas";
      return {
        allowed: ["dob", "brankas"],
        pmType,
        details: { bank_code: bankCode },
      };
    }
    default:
      throw new Error("Unsupported payment method");
  }
}

function extractQrImageUrl(attrs: PaymentIntentAttrs) {
  return attrs.next_action?.code?.image_url ?? null;
}

/** QR Ph checkout — always method qrph, secret-key server flow (OpenPay-style). */
export async function createQrPhPayment(
  orderId: string,
  amountPesos: number,
  returnUrl: string,
  extraMetadata?: Record<string, string>,
): Promise<PaymongoPaymentResult> {
  const centavos = pesosToCentavos(amountPesos);
  if (centavos < 100) throw new Error("Minimum payment is ₱1.00");

  const intentRes = await paymongoRequest<PaymentIntentAttrs>("/payment_intents", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          amount: centavos,
          currency: "PHP",
          payment_method_allowed: ["qrph"],
          description: `Lifestyles PH order ${orderId}`,
          statement_descriptor: "Lifestyles PH",
          metadata: {
            order_id: orderId,
            purpose: "lifestyles_order",
            method: "qr_ph",
            ...extraMetadata,
          },
        },
      },
    }),
  });

  const intentId = intentRes.data.id;
  const clientKey = intentRes.data.attributes.client_key;

  const pmRes = await paymongoRequest<{ type: string }>("/payment_methods", {
    method: "POST",
    body: JSON.stringify({
      data: { attributes: { type: "qrph" } },
    }),
  });

  const attachRes = await paymongoRequest<PaymentIntentAttrs>(
    `/payment_intents/${intentId}/attach`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: pmRes.data.id,
            client_key: clientKey,
            return_url: returnUrl,
          },
        },
      }),
    },
  );

  let attrs = attachRes.data.attributes;
  let qrImageUrl = extractQrImageUrl(attrs);

  if (!qrImageUrl) {
    const refreshed = await paymongoRequest<PaymentIntentAttrs>(`/payment_intents/${intentId}`, {
      method: "GET",
    });
    attrs = refreshed.data.attributes;
    qrImageUrl = extractQrImageUrl(attrs);
  }

  if (!qrImageUrl) {
    throw new Error(
      "QR code was not returned by PayMongo. Enable QR Ph in your PayMongo dashboard → Payment methods.",
    );
  }

  return {
    intentId,
    clientKey,
    status: attrs.status,
    qrImageUrl,
  };
}

export async function fetchQrPhImageUrl(intentId: string) {
  const res = await paymongoRequest<PaymentIntentAttrs>(`/payment_intents/${intentId}`, {
    method: "GET",
  });
  return extractQrImageUrl(res.data.attributes);
}

export async function createPaymongoPayment(
  orderId: string,
  amountPesos: number,
  method: PaymongoCheckoutMethod,
  returnUrl: string,
  bankCode?: BankCode,
  extraMetadata?: Record<string, string>,
): Promise<PaymongoPaymentResult> {
  const centavos = pesosToCentavos(amountPesos);
  if (centavos < 100) throw new Error("Minimum payment is ₱1.00");

  if (method === "card") {
    const res = await fetch(`${PAYMONGO_API}/payment_links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(secretKey()),
      },
      body: JSON.stringify({
        amount: centavos,
        currency: "PHP",
        description: `Lifestyles PH order ${orderId}`,
        metadata: { order_id: orderId, purpose: "lifestyles_order", method: "card" },
      }),
    });
    const body = (await res.json()) as {
      data?: { id?: string; url?: string; checkout_url?: string; status?: string };
      errors?: { detail?: string }[];
    };
    if (!res.ok) {
      throw new Error(body.errors?.[0]?.detail ?? "Could not create card checkout");
    }
    const linkId = body.data?.id ?? `link-${orderId}`;
    const checkoutUrl = body.data?.url ?? body.data?.checkout_url;
    if (!checkoutUrl) throw new Error("PayMongo did not return a checkout URL");
    return {
      intentId: linkId,
      clientKey: "",
      status: body.data?.status ?? "active",
      checkoutUrl,
    };
  }

  if (method === "qr_ph") {
    return createQrPhPayment(orderId, amountPesos, returnUrl, extraMetadata);
  }

  const mapped = mapMethodToPaymongo(method, bankCode);

  const intentRes = await paymongoRequest<PaymentIntentAttrs>("/payment_intents", {
    method: "POST",
    body: JSON.stringify({
      data: {
        attributes: {
          amount: centavos,
          currency: "PHP",
          payment_method_allowed: mapped.allowed,
          description: `Lifestyles PH order ${orderId}`,
          statement_descriptor: "Lifestyles PH",
          metadata: {
            order_id: orderId,
            purpose: "lifestyles_order",
            method,
            ...extraMetadata,
          },
        },
      },
    }),
  });

  const intentId = intentRes.data.id;
  const clientKey = intentRes.data.attributes.client_key;

  const pmBody: Record<string, unknown> = {
    data: {
      attributes: {
        type: mapped.pmType,
        ...(mapped.details ? { details: mapped.details } : {}),
      },
    },
  };

  const pmRes = await paymongoRequest<{ type: string }>("/payment_methods", {
    method: "POST",
    body: JSON.stringify(pmBody),
  });

  const attachRes = await paymongoRequest<PaymentIntentAttrs>(
    `/payment_intents/${intentId}/attach`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          attributes: {
            payment_method: pmRes.data.id,
            client_key: clientKey,
            return_url: returnUrl,
          },
        },
      }),
    },
  );

  const attrs = attachRes.data.attributes;
  const qrImageUrl = extractQrImageUrl(attrs);
  const redirectUrl = attrs.next_action?.redirect?.url;

  if (!qrImageUrl && !redirectUrl) {
    throw new Error("PayMongo did not return a payment URL. Try again or pick another method.");
  }

  return {
    intentId,
    clientKey,
    status: attrs.status,
    ...(qrImageUrl ? { qrImageUrl } : {}),
    ...(redirectUrl ? { redirectUrl } : {}),
  };
}

export async function markOrderPaidByIntent(opts: {
  intentId?: string;
  orderId?: string;
  paymentId?: string;
}) {
  const { db, schema } = await withDb();
  let row: Awaited<ReturnType<typeof withDb>>["schema"]["orders"]["$inferSelect"] | undefined;

  if (opts.orderId) {
    [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, opts.orderId));
  } else if (opts.intentId) {
    [row] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.paymongoIntentId, opts.intentId));
  }

  if (!row || row.status === "paid" || row.status === "cancelled") return null;

  const { applyPendingWalletDebitForOrder } = await import("@/lib/wallet.server");
  await applyPendingWalletDebitForOrder(row.id);

  await db
    .update(schema.orders)
    .set({
      status: "paid",
      paymentReference: opts.paymentId ?? opts.intentId ?? row.paymentReference,
    })
    .where(eq(schema.orders.id, row.id));

  return row.id;
}

export async function fetchPaymentIntentStatus(intentId: string) {
  if (intentId.startsWith("link_")) {
    const res = await fetch(`${PAYMONGO_API}/payment_links/${intentId}`, {
      headers: { Authorization: authHeader(secretKey()) },
    });
    const body = (await res.json()) as {
      data?: { status?: string; payments?: unknown[] };
    };
    const status = body.data?.status ?? "unknown";
    const paid = status === "paid" || (body.data?.payments?.length ?? 0) > 0;
    return { status, paid };
  }

  const res = await paymongoRequest<PaymentIntentAttrs>(`/payment_intents/${intentId}`, {
    method: "GET",
  });
  const attrs = res.data.attributes;
  const paid =
    attrs.status === "succeeded" ||
    attrs.payments?.some((p) => p.attributes.status === "paid") === true;
  return { status: attrs.status, paid };
}

export async function handlePaymongoWebhook(request: Request): Promise<Response> {
  try {
    const raw = await request.text();
    let payload: {
      data?: {
        attributes?: {
          type?: string;
          status?: string;
          data?: {
            id?: string;
            attributes?: {
              payment_intent_id?: string;
              status?: string;
              metadata?: Record<string, string>;
            };
          };
        };
      };
    };

    try {
      payload = JSON.parse(raw);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const eventType = payload.data?.attributes?.type;
    const eventData = payload.data?.attributes?.data;
    const metadata = eventData?.attributes?.metadata ?? {};
    const intentId =
      eventData?.attributes?.payment_intent_id ??
      (eventData?.id?.startsWith("pi_") ? eventData.id : undefined);
    const orderId = metadata["order_id"];

    const paidEvents = new Set([
      "payment.paid",
      "payment_intent.succeeded",
      "checkout_session.payment.paid",
      "link.payment.paid",
    ]);
    const failedEvents = new Set(["payment.failed"]);

    if (eventType && paidEvents.has(eventType)) {
      const paymentId = eventData?.id?.startsWith("pay_") ? eventData.id : undefined;
      const linkId = eventData?.id?.startsWith("link_") ? eventData.id : undefined;
      const resolvedIntentId = intentId ?? linkId;
      const purpose = metadata["purpose"];

      if (purpose === "wallet_topup" && metadata["topup_id"]) {
        const { completeWalletTopup } = await import("@/lib/wallet.server");
        await completeWalletTopup({
          topupId: metadata["topup_id"],
          ...(resolvedIntentId ? { intentId: resolvedIntentId } : {}),
          ...(paymentId ? { paymentId } : {}),
        });
      } else {
        await markOrderPaidByIntent({
          ...(resolvedIntentId ? { intentId: resolvedIntentId } : {}),
          ...(orderId ? { orderId } : {}),
          ...(paymentId ? { paymentId } : {}),
        });
      }
    } else if (eventType && failedEvents.has(eventType)) {
      // Keep order pending — customer can retry
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PayMongo webhook error:", error);
    return new Response("Webhook handler error", { status: 500 });
  }
}
