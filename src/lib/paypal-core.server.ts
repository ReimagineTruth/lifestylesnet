import { eq } from "drizzle-orm";
import { withDb } from "@/lib/server-db.server";
import { siteUrl } from "@/lib/site-url";

const PAYPAL_API = {
  live: "https://api-m.paypal.com",
  sandbox: "https://api-m.sandbox.paypal.com",
} as const;

type PayPalEnv = keyof typeof PAYPAL_API;

type PayPalLink = { href: string; rel: string; method?: string };

type PayPalOrder = {
  id: string;
  status: string;
  purchase_units?: {
    custom_id?: string;
    reference_id?: string;
    payments?: { captures?: { id: string; status: string }[] };
  }[];
  links?: PayPalLink[];
};

let cachedToken: { value: string; expiresAt: number } | null = null;

function paypalEnv(): PayPalEnv {
  const env = process.env["PAYPAL_ENV"] ?? process.env["VITE_PAYPAL_ENV"] ?? "live";
  return env === "sandbox" ? "sandbox" : "live";
}

function clientId() {
  const id = process.env["PAYPAL_CLIENT_ID"] ?? process.env["VITE_PAYPAL_CLIENT_ID"];
  if (!id) throw new Error("PayPal is not configured. Set PAYPAL_CLIENT_ID.");
  return id;
}

function clientSecret() {
  const secret = process.env["PAYPAL_CLIENT_SECRET"] ?? process.env["PAYPAL_SECRET"];
  if (!secret) throw new Error("PayPal secret is not configured. Set PAYPAL_CLIENT_SECRET.");
  return secret;
}

function apiBase() {
  return PAYPAL_API[paypalEnv()];
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const auth = Buffer.from(`${clientId()}:${clientSecret()}`).toString("base64");
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const body = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error_description?: string;
  };

  if (!res.ok || !body.access_token) {
    throw new Error(body.error_description ?? `PayPal auth failed (${res.status})`);
  }

  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
  };
  return body.access_token;
}

async function paypalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await res.json()) as T & {
    message?: string;
    details?: { issue?: string; description?: string }[];
  };

  if (!res.ok) {
    const detail = body.details?.[0]?.description ?? body.message;
    throw new Error(detail ?? `PayPal error (${res.status})`);
  }

  return body;
}

function formatPhpAmount(pesos: number) {
  return pesos.toFixed(2);
}

export function getPayPalPublicConfig() {
  return {
    clientId: clientId(),
    env: paypalEnv(),
    currency: "PHP" as const,
  };
}

export async function createPayPalCheckoutOrder(
  referenceId: string,
  amountPhp: number,
  returnUrl: string,
  cancelUrl: string,
  options?: { description?: string },
) {
  const order = await paypalRequest<PayPalOrder>("/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          custom_id: referenceId,
          description: options?.description ?? `Lifestyles PH order ${referenceId}`,
          amount: {
            currency_code: "PHP",
            value: formatPhpAmount(amountPhp),
          },
        },
      ],
      application_context: {
        brand_name: "Lifestyles Philippines",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    }),
  });

  const approvalUrl = order.links?.find((link) => link.rel === "approve")?.href ?? null;
  return { paypalOrderId: order.id, approvalUrl };
}

export async function fetchPayPalOrder(paypalOrderId: string) {
  return paypalRequest<PayPalOrder>(`/v2/checkout/orders/${paypalOrderId}`, { method: "GET" });
}

export async function capturePayPalCheckoutOrder(paypalOrderId: string) {
  const existing = await fetchPayPalOrder(paypalOrderId);

  if (existing.status === "COMPLETED") {
    const captureId = existing.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;
    return { status: existing.status, captureId, paid: true };
  }

  if (existing.status !== "APPROVED") {
    return { status: existing.status, captureId: null as string | null, paid: false };
  }

  const captured = await paypalRequest<PayPalOrder>(
    `/v2/checkout/orders/${paypalOrderId}/capture`,
    { method: "POST", body: "{}" },
  );

  const captureId = captured.purchase_units?.[0]?.payments?.captures?.[0]?.id ?? paypalOrderId;
  const paid = captured.status === "COMPLETED";
  return { status: captured.status, captureId, paid };
}

export async function markOrderPaidByPayPal(opts: {
  orderId?: string;
  paypalOrderId?: string;
  captureId?: string;
}) {
  const { db, schema } = await withDb();
  let row: Awaited<ReturnType<typeof withDb>>["schema"]["orders"]["$inferSelect"] | undefined;

  if (opts.orderId) {
    [row] = await db.select().from(schema.orders).where(eq(schema.orders.id, opts.orderId));
  } else if (opts.paypalOrderId) {
    [row] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.paypalOrderId, opts.paypalOrderId));
  }

  if (!row || row.status === "paid" || row.status === "cancelled") return null;

  const { applyPendingWalletDebitForOrder } = await import("@/lib/wallet.server");
  await applyPendingWalletDebitForOrder(row.id);

  await db
    .update(schema.orders)
    .set({
      status: "paid",
      paymentReference: opts.captureId ?? opts.paypalOrderId ?? row.paymentReference,
    })
    .where(eq(schema.orders.id, row.id));

  return row.id;
}

export async function handlePayPalWebhook(request: Request): Promise<Response> {
  try {
    const raw = await request.text();
    let payload: {
      event_type?: string;
      resource?: {
        id?: string;
        status?: string;
        custom_id?: string;
        supplementary_data?: { related_ids?: { order_id?: string } };
      };
    };

    try {
      payload = JSON.parse(raw);
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const eventType = payload.event_type;
    const resource = payload.resource;
    const paidEvents = new Set(["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.COMPLETED"]);

    if (eventType && paidEvents.has(eventType) && resource?.status === "COMPLETED") {
      const captureId = resource.id?.startsWith("pay_") ? resource.id : undefined;
      const paypalOrderId = resource.supplementary_data?.related_ids?.order_id;
      const referenceId = resource.custom_id;

      const orderPaid = await markOrderPaidByPayPal({
        ...(referenceId ? { orderId: referenceId } : {}),
        ...(paypalOrderId ? { paypalOrderId } : {}),
        ...(captureId ? { captureId } : {}),
      });

      if (!orderPaid && referenceId?.startsWith("top-")) {
        const { completeWalletTopup } = await import("@/lib/wallet.server");
        await completeWalletTopup({
          topupId: referenceId,
          ...(paypalOrderId ? { paymentId: captureId ?? paypalOrderId } : {}),
        });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("PayPal webhook error:", error);
    return new Response("Webhook handler error", { status: 500 });
  }
}

export function paypalReturnUrls(orderId: string) {
  const base = siteUrl();
  return {
    returnUrl: `${base}/order/${orderId}?payment=return&status=success`,
    cancelUrl: `${base}/order/${orderId}?payment=return&status=cancel`,
  };
}

export function paypalTopupReturnUrls(topupId: string) {
  const base = siteUrl();
  return {
    returnUrl: `${base}/account?topup=${topupId}&status=success`,
    cancelUrl: `${base}/account?topup=${topupId}&status=cancel`,
  };
}
