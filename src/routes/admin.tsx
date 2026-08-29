import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  loadOrders,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/lib/orders";
import { peso, products } from "@/lib/products";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Lifestyles Philippines" },
      { name: "description", content: "Manage orders, payments and inventory." },
      { property: "og:title", content: "Admin Dashboard | Lifestyles Philippines" },
      { property: "og:description", content: "Manage orders, payments and inventory." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const statuses: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => setOrders(loadOrders()), []);

  const visible = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const pending = orders.filter((o) => o.status === "pending").length;

  const detail = orders.find((o) => o.id === selected) ?? null;

  return (
    <div className="container-page py-14">
      <h1 className="text-4xl font-semibold">Admin dashboard</h1>
      <p className="mt-3 text-muted-foreground">
        Orders, payments and product catalogue for Lifestyles Philippines.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Total orders" value={String(orders.length)} />
        <Stat label="Awaiting payment" value={String(pending)} />
        <Stat label="Gross revenue" value={peso(revenue)} />
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">Orders</h2>
          <div className="flex flex-wrap gap-2">
            {(["all", ...statuses] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filter === s ? "border-brand bg-brand-soft" : "border-border text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="mt-8 rounded-xl border border-border bg-card p-10 text-center text-muted-foreground">
            No orders in this view yet.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Payment</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visible.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3 font-medium">{o.id}</td>
                    <td className="px-4 py-3">
                      {o.customer.name}
                      <span className="block text-xs text-muted-foreground">
                        {o.customer.city}, {o.customer.province}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString("en-PH")}
                    </td>
                    <td className="px-4 py-3 uppercase text-muted-foreground">
                      {o.paymentMethod}
                    </td>
                    <td className="px-4 py-3 font-semibold">{peso(o.total)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={(e) => {
                          const next = updateOrderStatus(o.id, e.target.value as OrderStatus);
                          setOrders(next);
                          toast.success(`${o.id} marked ${e.target.value}`);
                        }}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs capitalize"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(selected === o.id ? null : o.id)}
                        className="text-xs font-semibold text-ocean hover:underline"
                      >
                        {selected === o.id ? "Hide" : "Details"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {detail && (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{detail.id} details</h3>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="text-sm">
                <p className="font-semibold">Customer</p>
                <p className="mt-1 text-muted-foreground">
                  {detail.customer.name}
                  <br />
                  {detail.customer.email}
                  <br />
                  {detail.customer.phone}
                  <br />
                  {detail.customer.address}, {detail.customer.city}, {detail.customer.province}{" "}
                  {detail.customer.postal}
                </p>
                {detail.customer.notes && (
                  <p className="mt-2 text-muted-foreground">Notes: {detail.customer.notes}</p>
                )}
                {detail.reference && (
                  <p className="mt-2 text-muted-foreground">Payment ref: {detail.reference}</p>
                )}
              </div>
              <div className="text-sm">
                <p className="font-semibold">Items</p>
                <ul className="mt-1 space-y-1 text-muted-foreground">
                  {detail.lines.map((l) => (
                    <li key={l.slug} className="flex justify-between">
                      <span>
                        {l.name} × {l.qty}
                      </span>
                      <span>{peso(l.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{peso(detail.total)}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-semibold">Catalogue</h2>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Units sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => (
                <tr key={p.slug}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 uppercase text-muted-foreground">{p.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.size}</td>
                  <td className="px-4 py-3">{peso(p.price)}</td>
                  <td className="px-4 py-3">
                    {orders
                      .filter((o) => o.status !== "cancelled")
                      .flatMap((o) => o.lines)
                      .filter((l) => l.slug === p.slug)
                      .reduce((n, l) => n + l.qty, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
