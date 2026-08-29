import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { loadOrders, type Order } from "@/lib/orders";
import { peso } from "@/lib/products";

export const Route = createFileRoute("/order/$id")({
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

const methodLabel = { cod: "Cash on delivery", bank: "Bank transfer", gcash: "GCash" } as const;

function OrderPage() {
  const { id } = Route.useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOrder(loadOrders().find((o) => o.id === id) ?? null);
    setReady(true);
  }, [id]);

  if (!ready) return <div className="container-page py-24 text-muted-foreground">Loading…</div>;

  if (!order) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-semibold">Order not found</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn't find order {id} on this device. Contact support with your order number.
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

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-wrap justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold">Status</p>
            <p className="mt-1 capitalize text-muted-foreground">{order.status}</p>
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
            <li key={l.slug} className="flex justify-between py-3 text-sm">
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
