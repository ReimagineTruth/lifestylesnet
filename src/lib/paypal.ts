export type PayPalCheckoutResult = {
  paypalOrderId: string;
  approvalUrl: string | null;
};

export type PayPalPublicConfig = {
  clientId: string;
  env: "live" | "sandbox";
  currency: "PHP";
};

export function paypalClientConfig(): PayPalPublicConfig | null {
  const clientId =
    import.meta.env.VITE_PAYPAL_CLIENT_ID ?? import.meta.env.PUBLIC_PAYPAL_CLIENT_ID ?? "";
  if (!clientId) return null;
  const envRaw = import.meta.env.VITE_PAYPAL_ENV ?? "live";
  const env = envRaw === "sandbox" ? "sandbox" : "live";
  return { clientId, env, currency: "PHP" };
}
