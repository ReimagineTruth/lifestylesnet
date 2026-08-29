import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/lib/cart";
import { getProduct, peso } from "@/lib/products";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT,
  addOrder,
  newOrderId,
  type Order,
} from "@/lib/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Lifestyles Philippines" },
      { name: "description", content: "Complete your Lifestyles Philippines order securely." },
      { property: "og:title", content: "Checkout | Lifestyles Philippines" },
      { property: "og:description", content: "Complete your Lifestyles Philippines order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().min(7, "Enter a contact number").max(20),
  address: z.string().trim().min(5, "Enter your street address").max(200),
  city: z.string().trim().min(2, "Enter your city").max(80),
  province: z.string().trim().min(2, "Enter your province").max(80),
  postal: z.string().trim().min(4, "Enter your postal code").max(10),
  notes: z.string().trim().max(500).optional(),
  paymentMethod: z.enum(["cod", "bank", "gcash"]),
  reference: z.string().trim().max(60).optional(),
});

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function CheckoutPage() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [method, setMethod] = useState<"cod" | "bank" | "gcash">("cod");

  const lines = items
    .map((i) => ({ item: i, product: getProduct(i.slug) }))
    .filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + l.product!.price * l.item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  if (lines.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = schema.safeParse({ ...data, paymentMethod: method });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error("Please check the highlighted fields");
      return;
    }
    setErrors({});
    const v = parsed.data;
    const order: Order = {
      id: newOrderId(),
      createdAt: new Date().toISOString(),
      customer: {
        name: v.name,
        email: v.email,
        phone: v.phone,
        address: v.address,
        city: v.city,
        province: v.province,
        postal: v.postal,
        notes: v.notes ?? "",
      },
      paymentMethod: v.paymentMethod,
      reference: v.reference ?? "",
      lines: lines.map((l) => ({
        slug: l.product!.slug,
        name: l.product!.name,
        qty: l.item.qty,
        price: l.product!.price,
      })),
      subtotal,
      shipping,
      total,
      status: "pending",
    };
    addOrder(order);
    clear();
    toast.success(`Order ${order.id} placed`);
    navigate({ to: "/order/$id", params: { id: order.id } });
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-4xl font-semibold">Checkout</h1>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-10">
          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Delivery details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" name="name" error={errors["name"]} />
              <Field label="Email" name="email" type="email" error={errors["email"]} />
              <Field label="Mobile number" name="phone" error={errors["phone"]} />
              <Field label="Postal code" name="postal" error={errors["postal"]} />
              <div className="sm:col-span-2">
                <Field label="Street address" name="address" error={errors["address"]} />
              </div>
              <Field label="City / Municipality" name="city" error={errors["city"]} />
              <Field label="Province" name="province" error={errors["province"]} />
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">
                  Delivery notes (optional)
                  <textarea name="notes" rows={3} className={field} />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Payment method</h2>
            <div className="mt-5 space-y-3">
              {(
                [
                  { id: "cod", title: "Cash on delivery", desc: "Pay the courier upon arrival." },
                  {
                    id: "bank",
                    title: "Bank transfer",
                    desc: "BPI · Lifestyles Philippines Inc. · 1234-5678-90",
                  },
                  { id: "gcash", title: "GCash", desc: "Send to 0917 000 0000 (Lifestyles PH)." },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                    method === opt.id ? "border-brand bg-brand-soft" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethodRadio"
                    checked={method === opt.id}
                    onChange={() => setMethod(opt.id)}
                    className="mt-1 accent-[var(--brand)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{opt.title}</span>
                    <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
            {method !== "cod" && (
              <div className="mt-5">
                <Field
                  label="Payment reference number"
                  name="reference"
                  error={errors["reference"]}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Enter the reference after sending payment. Our team verifies it before shipping.
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {lines.map(({ item, product }) => (
              <li key={item.slug} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {product!.name} × {item.qty}
                </span>
                <span>{peso(product!.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd>{peso(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd>{shipping === 0 ? "Free" : peso(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{peso(total)}</dd>
            </div>
          </dl>
          <button
            type="submit"
            className="mt-6 w-full rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            Place order
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  type?: string;
  error?: string | undefined;
}) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} className={field} />
      {error && <span className="mt-1 block text-xs font-normal text-destructive">{error}</span>}
    </label>
  );
}
