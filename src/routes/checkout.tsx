import { Link, useNavigate, createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { useCart } from "@/lib/cart";
import { getVariant, peso, variantCartLabel } from "@/lib/products";
import { saveCustomerEmail } from "@/lib/orders";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/orders";
import { createOrderFn } from "@/lib/orders.server";
import { tl } from "@/lib/tagalog";
import {
  BANK_OPTIONS,
  PAYMONGO_METHODS,
  type BankCode,
  type PaymongoCheckoutMethod,
} from "@/lib/paymongo";

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
});

type CheckoutMethod = "cod" | PaymongoCheckoutMethod;

const field =
  "mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/30";

function CheckoutPage() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const createOrder = useServerFn(createOrderFn);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<CheckoutMethod>("cod");
  const [bankCode, setBankCode] = useState<BankCode>("bpi");

  const lines = items
    .map((i) => ({ item: i, line: getVariant(i.variantId) }))
    .filter((l) => l.line);
  const subtotal = lines.reduce((sum, l) => sum + l.line!.variant.price * l.item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const selectedPaymongo = PAYMONGO_METHODS.find((m) => m.id === method);

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
    if (submitting) return;
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error(tl.toast.validationError);
      return;
    }
    if (method === "bank" && !bankCode) {
      toast.error("Pumili ng bangko para sa online banking.");
      return;
    }
    setErrors({});
    const v = parsed.data;
    setSubmitting(true);
    void createOrder({
      data: {
        customer: {
          name: v.name,
          email: v.email,
          phone: v.phone,
          address: v.address,
          city: v.city,
          province: v.province,
          postal: v.postal,
          notes: v.notes,
        },
        paymentMethod: method,
        bankCode: method === "bank" ? bankCode : undefined,
        items: lines.map(({ item }) => ({ variantId: item.variantId, qty: item.qty })),
      },
    })
      .then((result) => {
        saveCustomerEmail(v.email);
        clear();
        toast.success(tl.toast.orderPlaced(result.order.id));

        const { order, payment } = result;
        if (payment?.redirectUrl) {
          window.location.href = payment.redirectUrl;
          return;
        }
        if (payment?.checkoutUrl) {
          window.location.href = payment.checkoutUrl;
          return;
        }
        if (payment?.qrImageUrl) {
          sessionStorage.setItem(`paymongo-qr-${order.id}`, payment.qrImageUrl);
        }
        navigate({
          to: "/order/$id",
          params: { id: order.id },
          search: payment ? { payment: "pending" } : {},
        });
      })
      .catch((err: Error) => {
        toast.error(err.message || "Could not place order. Please try again.");
      })
      .finally(() => setSubmitting(false));
  }

  return (
    <div className="container-page py-14">
      <h1 className="text-4xl font-semibold">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Secure payments powered by PayMongo — QR Ph, e-wallets, online banking, and cards.
      </p>

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
            <p className="mt-1 text-sm text-muted-foreground">
              Pay online via PayMongo or choose cash on delivery.
            </p>
            <div className="mt-5 space-y-3">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                  method === "cod" ? "border-brand bg-brand-soft" : "border-border"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethodRadio"
                  checked={method === "cod"}
                  onChange={() => setMethod("cod")}
                  className="mt-1 accent-brand"
                />
                <span>
                  <span className="block text-sm font-semibold">Cash on delivery</span>
                  <span className="block text-sm text-muted-foreground">
                    Pay the courier upon arrival.
                  </span>
                </span>
              </label>

              {PAYMONGO_METHODS.map((opt) => (
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
                    className="mt-1 accent-brand"
                  />
                  <span>
                    <span className="block text-sm font-semibold">{opt.title}</span>
                    <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>

            {selectedPaymongo?.needsBank && method === "bank" && (
              <div className="mt-5">
                <label className="text-sm font-medium">
                  Select bank
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value as BankCode)}
                    className={field}
                  >
                    {BANK_OPTIONS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
          </section>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {lines.map(({ item, line }) => (
              <li key={item.variantId} className="flex justify-between gap-3">
                <span className="text-muted-foreground">
                  {variantCartLabel(line!.product, line!.variant)} × {item.qty}
                </span>
                <span>{peso(line!.variant.price * item.qty)}</span>
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
            disabled={submitting}
            className="mt-6 w-full rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Processing…" : method === "cod" ? "Place order" : "Pay with PayMongo"}
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
