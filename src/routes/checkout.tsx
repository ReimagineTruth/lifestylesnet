import { Link, createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ChevronLeft, Loader2, QrCode } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DeliveryAddressForm } from "@/components/checkout/DeliveryAddressForm";
import { PayPalCheckoutPanel } from "@/components/checkout/PayPalCheckoutPanel";
import { useCart } from "@/lib/cart";
import { loadCustomerEmail, saveCustomerEmail } from "@/lib/orders";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/orders";
import { createOrderFn } from "@/lib/orders.server";
import { confirmPaymongoPaymentFn } from "@/lib/paymongo.server";
import { BANK_OPTIONS, type BankCode } from "@/lib/paymongo";
import { getVariant, peso, variantCartLabel } from "@/lib/products";
import { clearOrderQrPhSession, saveOrderQrPhSession } from "@/lib/qrPhPaySession";
import { QRPH_PROVIDERS, qrScanHint, type QrPhProvider } from "@/lib/qrphProviders";
import { tl } from "@/lib/tagalog";

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

type Step = "delivery" | "payment" | "qr" | "paypal" | "done";
type PayChoice = "cod" | "qr_ph" | "bank" | "paypal";

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string;
  notes: string;
};

type CheckoutSummary = {
  lines: {
    item: { variantId: string; qty: number };
    line: NonNullable<ReturnType<typeof getVariant>>;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
};

const STEPS: { id: Step; label: string }[] = [
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
  { id: "qr", label: "Pay" },
  { id: "done", label: "Done" },
];

function CheckoutPage() {
  const { items, clear, ready } = useCart();
  const createOrder = useServerFn(createOrderFn);
  const confirmPayment = useServerFn(confirmPaymongoPaymentFn);

  const [step, setStep] = useState<Step>("delivery");
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [payChoice, setPayChoice] = useState<PayChoice>("qr_ph");
  const [qrProvider, setQrProvider] = useState<QrPhProvider>(QRPH_PROVIDERS[0]!);
  const [bankCode, setBankCode] = useState<BankCode>("bpi");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummary | null>(null);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    const savedEmail = loadCustomerEmail();
    if (savedEmail) {
      setForm((prev) => (prev.email ? prev : { ...prev, email: savedEmail }));
    }
  }, []);

  const lines = items
    .map((i) => ({ item: i, line: getVariant(i.variantId) }))
    .filter(
      (
        l,
      ): l is { item: (typeof items)[number]; line: NonNullable<ReturnType<typeof getVariant>> } =>
        Boolean(l.line),
    );
  const subtotal = lines.reduce((sum, l) => sum + l.line!.variant.price * l.item.qty, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  const summaryLines = checkoutSummary?.lines ?? lines;
  const summarySubtotal = checkoutSummary?.subtotal ?? subtotal;
  const summaryShipping = checkoutSummary?.shipping ?? shipping;
  const summaryTotal = checkoutSummary?.total ?? total;

  const patchForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }, []);

  useEffect(() => {
    if (step !== "qr" || !orderId || paid) return;
    const poll = () => {
      void confirmPayment({ data: { orderId } })
        .then((result) => {
          if (result.paid) {
            setPaid(true);
            clear();
            clearOrderQrPhSession();
            setStep("done");
            toast.success("Payment confirmed! Salamat po.");
          }
        })
        .catch(() => {});
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [step, orderId, paid, confirmPayment, clear]);

  if (!ready) {
    return (
      <div className="container-page flex min-h-[40vh] items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-brand" aria-label="Loading cart" />
      </div>
    );
  }

  if (lines.length === 0 && step !== "done" && step !== "qr" && step !== "paypal") {
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

  function validateDelivery() {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      toast.error(tl.toast.validationError);
      return false;
    }
    setErrors({});
    return true;
  }

  function placeOrder() {
    if (submitting) return;
    if (!validateDelivery()) {
      setStep("delivery");
      return;
    }
    if (payChoice === "bank" && !bankCode) {
      toast.error("Pumili ng bangko para sa online banking.");
      return;
    }

    setSubmitting(true);
    const v = schema.parse(form);
    const orderSnapshot: CheckoutSummary = { lines, subtotal, shipping, total };

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
          ...(v.notes ? { notes: v.notes } : {}),
        },
        paymentMethod:
          payChoice === "cod"
            ? "cod"
            : payChoice === "bank"
              ? "bank"
              : payChoice === "paypal"
                ? "paypal"
                : "qr_ph",
        ...(payChoice === "bank" ? { bankCode } : {}),
        ...(payChoice === "qr_ph"
          ? {
              preferredProvider: qrProvider.id,
              preferredProviderName: qrProvider.label,
            }
          : {}),
        items: lines.map(({ item, line }) => ({
          variantId: line.variant.id,
          qty: item.qty,
        })),
      },
    })
      .then((result) => {
        saveCustomerEmail(v.email);
        setCheckoutSummary(orderSnapshot);
        setOrderId(result.order.id);

        const { order, payment } = result;

        if (payment?.redirectUrl) {
          clear();
          window.location.href = payment.redirectUrl;
          return;
        }
        if (payment?.checkoutUrl) {
          clear();
          window.location.href = payment.checkoutUrl;
          return;
        }

        if (payChoice === "qr_ph") {
          if (!payment?.qrImageUrl) {
            throw new Error(
              "QR code was not returned by PayMongo. Enable QR Ph in your PayMongo dashboard.",
            );
          }
          const hint = qrScanHint(qrProvider);
          saveOrderQrPhSession({
            orderId: order.id,
            intentId: payment.intentId,
            qrImageUrl: payment.qrImageUrl,
            total: order.total,
            scanHint: hint,
            createdAt: Date.now(),
            ...(qrProvider.id !== "qr_ph" ? { providerName: qrProvider.label } : {}),
          });
          setQrImageUrl(payment.qrImageUrl);
          setStep("qr");
          toast.success("Order created — scan the QR to pay.");
          return;
        }

        if (payChoice === "paypal") {
          setStep("paypal");
          toast.success("Order created — complete payment with PayPal.");
          return;
        }

        clear();
        toast.success(tl.toast.orderPlaced(order.id));
        setPaid(true);
        setStep("done");
      })
      .catch((err: Error) => {
        toast.error(err.message || "Could not place order. Please try again.");
      })
      .finally(() => setSubmitting(false));
  }

  const stepIndex = STEPS.findIndex((s) => s.id === (step === "paypal" ? "qr" : step));

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-semibold">Checkout</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Delivery → payment → scan QR (Shopee-style)
      </p>

      <ol className="mt-8 flex gap-2">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            className={`flex-1 rounded-full py-2 text-center text-xs font-semibold sm:text-sm ${
              i <= stepIndex ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1}. {s.label}
          </li>
        ))}
      </ol>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {step === "delivery" && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Delivery address</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Select region, province, city, and barangay, then enter your street details.
              </p>
              <div className="mt-6">
                <DeliveryAddressForm values={form} errors={errors} onChange={patchForm} />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (validateDelivery()) setStep("payment");
                }}
                className="mt-8 w-full rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground"
              >
                Continue to payment
              </button>
            </section>
          )}

          {step === "payment" && (
            <section className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <button
                  type="button"
                  onClick={() => setStep("delivery")}
                  className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" /> Edit delivery address
                </button>
                <h2 className="text-lg font-semibold">Payment method</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick the app you&apos;ll use to scan. All e-wallet tiles use one PayMongo QR Ph
                  code.
                </p>

                <label
                  className={`mt-5 flex cursor-pointer items-start gap-3 rounded-lg border p-4 ${
                    payChoice === "cod" ? "border-brand bg-brand-soft" : "border-border"
                  }`}
                >
                  <input
                    type="radio"
                    checked={payChoice === "cod"}
                    onChange={() => setPayChoice("cod")}
                    className="mt-1 accent-brand"
                  />
                  <span>
                    <span className="block text-sm font-semibold">Cash on delivery</span>
                    <span className="text-sm text-muted-foreground">
                      Pay when your order arrives.
                    </span>
                  </span>
                </label>

                <p className="mt-6 text-sm font-semibold">QR Ph & e-wallets</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {QRPH_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => {
                        setPayChoice("qr_ph");
                        setQrProvider(provider);
                      }}
                      className={`rounded-lg border px-3 py-4 text-left text-sm transition-colors ${
                        payChoice === "qr_ph" && qrProvider.id === provider.id
                          ? "border-brand bg-brand-soft"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <span className="block font-semibold">{provider.label}</span>
                      {provider.hint && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {provider.hint}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <p className="mt-6 text-sm font-semibold">Other options</p>
                <div className="mt-3 space-y-2">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                      payChoice === "bank" ? "border-brand bg-brand-soft" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={payChoice === "bank"}
                      onChange={() => setPayChoice("bank")}
                      className="accent-brand"
                    />
                    <span className="text-sm font-semibold">Online banking (redirect)</span>
                  </label>
                  {payChoice === "bank" && (
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value as BankCode)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {BANK_OPTIONS.map((b) => (
                        <option key={b.code} value={b.code}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  )}
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                      payChoice === "paypal" ? "border-brand bg-brand-soft" : "border-border"
                    }`}
                  >
                    <input
                      type="radio"
                      checked={payChoice === "paypal"}
                      onChange={() => setPayChoice("paypal")}
                      className="accent-brand"
                    />
                    <span>
                      <span className="block text-sm font-semibold">PayPal or card</span>
                      <span className="text-sm text-muted-foreground">
                        PayPal wallet, debit/credit card, and other PayPal checkout options.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={placeOrder}
                className="w-full rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground disabled:opacity-50"
              >
                {submitting
                  ? "Processing…"
                  : payChoice === "cod"
                    ? "Place order"
                    : payChoice === "qr_ph"
                      ? `Pay ${peso(total)} · Show QR`
                      : payChoice === "paypal"
                        ? "Continue to PayPal"
                        : "Continue to PayMongo"}
              </button>
            </section>
          )}

          {step === "paypal" && orderId && (
            <section className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold">Pay with PayPal</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Order {orderId} · {peso(summaryTotal)}
              </p>
              <div className="mt-6">
                <PayPalCheckoutPanel
                  orderId={orderId}
                  total={summaryTotal}
                  onPaid={() => {
                    clear();
                    setPaid(true);
                    setStep("done");
                  }}
                  onCancel={() => setStep("payment")}
                />
              </div>
            </section>
          )}

          {step === "qr" && orderId && (
            <section className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="flex items-center justify-center gap-2 font-semibold">
                <QrCode className="h-5 w-5" />
                Scan to pay {peso(summaryTotal)}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{qrScanHint(qrProvider)}</p>
              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="QR Ph payment code"
                  className="mx-auto mt-6 h-64 w-64 rounded-lg border border-border bg-white p-2"
                />
              ) : (
                <div className="mx-auto mt-6 flex h-64 w-64 items-center justify-center rounded-lg border border-border bg-muted/30">
                  <Loader2 className="h-8 w-8 animate-spin text-brand" />
                </div>
              )}
              <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for payment · Order {orderId}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">QR expires in ~30 minutes</p>
              <Link
                to="/order/$id"
                params={{ id: orderId }}
                className="mt-4 inline-block text-sm font-medium text-brand hover:underline"
              >
                Open full-screen QR on order page
              </Link>
            </section>
          )}

          {step === "done" && orderId && (
            <section className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-brand" />
              <h2 className="mt-4 text-2xl font-semibold">Order complete</h2>
              <p className="mt-2 text-muted-foreground">
                Order <span className="font-semibold text-foreground">{orderId}</span>
                {paid ? " — payment confirmed." : " — thank you!"}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/order/$id"
                  params={{ id: orderId }}
                  className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground"
                >
                  View order
                </Link>
                <Link
                  to="/products"
                  className="rounded-md border border-border px-6 py-2.5 text-sm font-semibold"
                >
                  Continue shopping
                </Link>
              </div>
            </section>
          )}
        </div>

        <OrderSummary
          lines={summaryLines}
          subtotal={summarySubtotal}
          shipping={summaryShipping}
          total={summaryTotal}
        />
      </div>
    </div>
  );
}

function OrderSummary({
  lines,
  subtotal,
  shipping,
  total,
}: {
  lines: {
    item: { variantId: string; qty: number };
    line: NonNullable<ReturnType<typeof getVariant>>;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
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
    </aside>
  );
}
