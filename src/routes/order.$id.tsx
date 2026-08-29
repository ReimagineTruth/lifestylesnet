import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { confirmPaymongoPaymentFn, fetchOrderQrFn } from "@/lib/paymongo.server";
import { capturePayPalPaymentFn } from "@/lib/paypal.server";
import { loadOrderQrPhSession, legacyQrKey } from "@/lib/qrPhPaySession";
import { getOrderFn } from "@/lib/orders.server";
import type { PaymentMethod } from "@/lib/orders";

import { peso } from "@/lib/products";

const searchSchema = z.object({
  payment: z.enum(["pending", "return"]).optional(),
  status: z.enum(["success", "cancel"]).optional(),
});

export const Route = createFileRoute("/order/$id")({
  validateSearch: searchSchema,
  loader: ({ params }) => getOrderFn({ data: params.id }),
  head: () => ({
    meta: [
      { title: "Order Confirmation | Lifestyles Philippines" },
      { name: "description", content: "Your Lifestyles Philippines order details and status." },
      { property: "og:title", content: "Order Confirmation | Lifestyles Philippines" },
      { property: "og:description", content: "Your Lifestyles order details and status." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

const methodLabel: Record<PaymentMethod, string> = {
  cod: "Cash on delivery",
  qr_ph: "QR Ph (PayMongo)",
  gcash: "GCash (PayMongo)",
  maya: "Maya (PayMongo)",
  grab_pay: "GrabPay (PayMongo)",
  shopee_pay: "ShopeePay (PayMongo)",
  billease: "BillEase (PayMongo)",
  bank: "Online banking (PayMongo)",
  card: "Card (PayMongo)",
  paypal: "PayPal or card",
  wallet: "Wallet balance",
};

function OrderPage() {
  const order = Route.useLoaderData();
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const confirmPayment = useServerFn(confirmPaymongoPaymentFn);
  const capturePayPalPayment = useServerFn(capturePayPalPaymentFn);
  const fetchOrderQr = useServerFn(fetchOrderQrFn);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [paid, setPaid] = useState(order?.status === "paid");

  useEffect(() => {
    if (!order) return;
    setPaid(order.status === "paid");

    const session = loadOrderQrPhSession();
    const legacy = sessionStorage.getItem(legacyQrKey(order.id));
    const url = session?.orderId === order.id ? session.qrImageUrl : (legacy ?? null);
    if (url) {
      setQrImage(url);
      return;
    }

    if (order.paymentMethod === "qr_ph" && order.status !== "paid" && order.paymongoIntentId) {
      void fetchOrderQr({ data: order.id })
        .then(({ qrImageUrl }) => {
          if (qrImageUrl) setQrImage(qrImageUrl);
        })
        .catch(() => {});
    }
  }, [order, fetchOrderQr]);

  useEffect(() => {
    if (!order || order.paymentMethod === "cod" || paid) return;

    const poll = () => {
      void confirmPayment({ data: { orderId: order.id, intentId: order.paymongoIntentId } })
        .then((result) => {
          if (result.paid) {
            setPaid(true);
            sessionStorage.removeItem(`paymongo-qr-${order.id}`);
            toast.success("Payment confirmed! Salamat po.");
          }
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [order, confirmPayment, paid]);

  useEffect(() => {
    if (search.status === "success") toast.success("Payment received — confirming…");
    if (search.status === "cancel") toast.error("Payment was cancelled.");
  }, [search.status]);

  useEffect(() => {
    if (!order || order.paymentMethod !== "paypal" || paid) return;
    if (search.payment !== "return" || search.status !== "success") return;

    void capturePayPalPayment({ data: { orderId: order.id } })
      .then((result) => {
        if (result.paid) {
          setPaid(true);
          toast.success("Payment confirmed via PayPal!");
        }
      })
      .catch(() => {});
  }, [order, capturePayPalPayment, paid, search.payment, search.status]);

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-semibold">Order not found</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn't find that order. Check the order number or contact support.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  const awaitingPayment = order.paymentMethod !== "cod" && !paid && order.status !== "cancelled";

  return (
    <div className="container-page max-w-3xl py-16">
      <div className="flex items-center gap-3">
        <CheckCircle2 className="h-8 w-8 text-brand" />
        <h1 className="text-3xl font-semibold">Thank you, {order.customer.name.split(" ")[0]}!</h1>
      </div>
      <p className="mt-3 text-muted-foreground">
        Order <span className="font-semibold text-foreground">{order.id}</span> was received on{" "}
        {new Date(order.createdAt).toLocaleString("en-PH")}. We'll email updates to{" "}
        {order.customer.email}.
      </p>

      {awaitingPayment && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <Loader2 className="h-5 w-5 animate-spin" />
            Awaiting payment via PayMongo
          </div>
          <p className="mt-2 text-sm text-amber-800">
            {qrImage
              ? "I-scan ang QR code sa ibaba gamit ang GCash, Maya, o anumang QR Ph app."
              : order.paymentMethod === "paypal"
                ? "Kumpletohin ang bayad sa PayPal. Awtomatikong mag-u-update ang status pag na-confirm."
                : search.payment === "return"
                  ? "Bumalik ka mula sa bangko o e-wallet. Kino-confirm namin ang bayad…"
                  : "Kumpletohin ang bayad sa PayMongo. Awtomatikong mag-u-update ang status."}
          </p>
          {qrImage && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <img
                src={qrImage}
                alt="QR Ph payment code"
                className="h-56 w-56 rounded-lg border border-border bg-white p-2"
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <QrCode className="h-4 w-4" />
                Expires in ~30 minutes · Total {peso(order.total)}
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={checking}
            onClick={() => {
              setChecking(true);
              void confirmPayment({ data: { orderId: id, intentId: order.paymongoIntentId } })
                .then((result) => {
                  if (result.paid) {
                    setPaid(true);
                    sessionStorage.removeItem(`paymongo-qr-${order.id}`);
                    toast.success("Payment confirmed!");
                  } else {
                    toast.message("Hindi pa natatanggap ang bayad. Subukan muli.");
                  }
                })
                .finally(() => setChecking(false));
            }}
            className="mt-4 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50"
          >
            {checking ? "Checking…" : "Check payment status"}
          </button>
        </div>
      )}

      {paid && order.paymentMethod !== "cod" && (
        <div className="mt-8 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-800">
          Payment confirmed via PayMongo.
        </div>
      )}

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold">Status</p>
            <p className="mt-1 capitalize text-muted-foreground">{paid ? "paid" : order.status}</p>
          </div>
          <div>
            <p className="font-semibold">Payment</p>
            <p className="mt-1 text-muted-foreground">
              {methodLabel[order.paymentMethod]}
              {order.reference ? ` · Ref ${order.reference}` : ""}
            </p>
          </div>
          <div className="max-w-xs">
            <p className="font-semibold">Deliver to</p>
            <p className="mt-1 text-muted-foreground">
              {order.customer.address}, {order.customer.city}, {order.customer.province}{" "}
              {order.customer.postal}
            </p>
          </div>
        </div>

        <ul className="mt-8 divide-y divide-border border-t border-border">
          {order.lines.map((l) => (
            <li
              key={`${l.variantId ?? l.slug}-${l.name}`}
              className="flex justify-between py-3 text-sm"
            >
              <span className="text-muted-foreground">
                {l.name} × {l.qty}
              </span>
              <span>{peso(l.price * l.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>{peso(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Shipping</dt>
            <dd>{order.shipping === 0 ? "Free" : peso(order.shipping)}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{peso(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex gap-3">
        <Link
          to="/account"
          className="rounded-md border border-border px-5 py-2.5 text-sm font-semibold hover:bg-accent"
        >
          My orders
        </Link>
        <Link
          to="/products"
          className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
