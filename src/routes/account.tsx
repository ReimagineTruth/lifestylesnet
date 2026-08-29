import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { loadCustomerEmail, type Order } from "@/lib/orders";
import { peso } from "@/lib/products";
import { listOrdersByEmailFn } from "@/lib/orders.server";

export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Orders | Lifestyles Philippines" },
      { name: "description", content: "Track your Lifestyles Philippines orders and deliveries." },
      { property: "og:title", content: "My Orders | Lifestyles Philippines" },
      { property: "og:description", content: "Track your Lifestyles orders and deliveries." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const listOrders = useServerFn(listOrdersByEmailFn);
  const [email, setEmail] = useState("");
  const [queryEmail, setQueryEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = loadCustomerEmail();
    if (saved) {
      setEmail(saved);
      setQueryEmail(saved);
    }
  }, []);

  useEffect(() => {
    if (!queryEmail) return;
    setLoading(true);
    void listOrders({ data: queryEmail })
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [queryEmail, listOrders]);

  return (
    <div className="container-page py-14">
      <h1 className="text-4xl font-semibold">My orders</h1>
      <p className="mt-3 text-muted-foreground">
        Enter the email you used at checkout to view your orders from our database.
      </p>

      <form
        className="mt-8 flex max-w-md flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setQueryEmail(email.trim().toLowerCase());
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="min-w-55 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-brand px-5 py-2 text-sm font-semibold text-brand-foreground"
        >
          View orders
        </button>
      </form>

      {loading ? (
        <p className="mt-10 text-muted-foreground">Loading orders…</p>
      ) : queryEmail && orders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No orders found for {queryEmail}.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-10 space-y-4">
          {orders.map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-5"
            >
              <div>
                <p className="font-semibold">{o.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleDateString("en-PH")} ·{" "}
                  {o.lines.reduce((n, l) => n + l.qty, 0)} item(s)
                </p>
              </div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold capitalize text-brand">
                {o.status}
              </span>
              <p className="font-semibold">{peso(o.total)}</p>
              <Link
                to="/order/$id"
                params={{ id: o.id }}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
              >
                View
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
