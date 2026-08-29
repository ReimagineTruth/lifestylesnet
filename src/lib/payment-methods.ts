/** Checkout payment groups — each maps to one or more stored `paymentMethod` values. */
export const CHECKOUT_PAY_CHOICES = ["cod", "qr_ph", "bank", "paypal"] as const;

export type CheckoutPayChoice = (typeof CHECKOUT_PAY_CHOICES)[number];

export const PAYMENT_METHODS_SETTING_KEY = "payment_methods_enabled";

export const DEFAULT_PAYMENT_METHODS_ENABLED: Record<CheckoutPayChoice, boolean> = {
  cod: true,
  qr_ph: true,
  bank: true,
  paypal: true,
};

export const PAYMENT_METHOD_META: Record<
  CheckoutPayChoice,
  { label: string; description: string; configureHint?: string }
> = {
  cod: {
    label: "Cash on delivery",
    description: "Customer pays when the order arrives.",
  },
  qr_ph: {
    label: "QR Ph & e-wallets",
    description: "GCash, Maya, GrabPay, ShopeePay, and other QR Ph apps.",
    configureHint: "Set PAYMONGO_SECRET_KEY in environment variables.",
  },
  bank: {
    label: "Online banking",
    description: "Redirect to BPI, BDO, Metrobank, UnionBank, or Land Bank.",
    configureHint: "Set PAYMONGO_SECRET_KEY in environment variables.",
  },
  paypal: {
    label: "PayPal or card",
    description: "PayPal wallet, debit/credit card, and other PayPal checkout options.",
    configureHint: "Set PAYPAL_CLIENT_ID and VITE_PAYPAL_CLIENT_ID in environment variables.",
  },
};

export function parsePaymentMethodsEnabled(
  raw: string | undefined,
): Record<CheckoutPayChoice, boolean> {
  if (!raw) return { ...DEFAULT_PAYMENT_METHODS_ENABLED };
  try {
    const parsed = JSON.parse(raw) as Partial<Record<CheckoutPayChoice, boolean>>;
    return {
      ...DEFAULT_PAYMENT_METHODS_ENABLED,
      ...Object.fromEntries(
        CHECKOUT_PAY_CHOICES.map((key) => [
          key,
          typeof parsed[key] === "boolean" ? parsed[key]! : DEFAULT_PAYMENT_METHODS_ENABLED[key],
        ]),
      ),
    } as Record<CheckoutPayChoice, boolean>;
  } catch {
    return { ...DEFAULT_PAYMENT_METHODS_ENABLED };
  }
}

export function serializePaymentMethodsEnabled(
  methods: Record<CheckoutPayChoice, boolean>,
): string {
  return JSON.stringify(methods);
}

export function isPaymongoConfigured() {
  return Boolean(process.env["PAYMONGO_SECRET_KEY"]?.trim());
}

export function isPaypalConfigured() {
  return Boolean(
    process.env["PAYPAL_CLIENT_ID"]?.trim() || process.env["VITE_PAYPAL_CLIENT_ID"]?.trim(),
  );
}

/** Whether provider credentials exist — independent of admin toggles. */
export function paymentProviderConfigured(): Record<CheckoutPayChoice, boolean> {
  const paymongo = isPaymongoConfigured();
  return {
    cod: true,
    qr_ph: paymongo,
    bank: paymongo,
    paypal: isPaypalConfigured(),
  };
}

export function effectivePaymentMethods(
  admin: Record<CheckoutPayChoice, boolean>,
): Record<CheckoutPayChoice, boolean> {
  const configured = paymentProviderConfigured();
  return Object.fromEntries(
    CHECKOUT_PAY_CHOICES.map((key) => [key, admin[key] && configured[key]]),
  ) as Record<CheckoutPayChoice, boolean>;
}

export function firstAvailablePaymentMethod(
  methods: Record<CheckoutPayChoice, boolean>,
): CheckoutPayChoice | null {
  return CHECKOUT_PAY_CHOICES.find((key) => methods[key]) ?? null;
}

/** Map stored order paymentMethod to checkout UI group for availability checks. */
export function paymentMethodToCheckoutChoice(method: string): CheckoutPayChoice | null {
  if (method === "cod") return "cod";
  if (method === "paypal") return "paypal";
  if (method === "bank") return "bank";
  if (
    method === "qr_ph" ||
    method === "gcash" ||
    method === "maya" ||
    method === "grab_pay" ||
    method === "shopee_pay" ||
    method === "billease"
  ) {
    return "qr_ph";
  }
  if (method === "card") return null;
  return null;
}
