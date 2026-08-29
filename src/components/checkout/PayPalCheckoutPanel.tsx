import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import {
  capturePayPalPaymentFn,
  createPayPalOrderFn,
  getPayPalConfigFn,
} from "@/lib/paypal.server";
import { paypalClientConfig } from "@/lib/paypal";
import { peso } from "@/lib/products";

type Props = {
  orderId: string;
  total: number;
  onPaid: () => void;
  onCancel?: () => void;
};

export function PayPalCheckoutPanel({ orderId, total, onPaid, onCancel }: Props) {
  const createPayPalOrder = useServerFn(createPayPalOrderFn);
  const capturePayPalPayment = useServerFn(capturePayPalPaymentFn);
  const fetchConfig = useServerFn(getPayPalConfigFn);
  const [config, setConfig] = useState(paypalClientConfig());
  const [ready, setReady] = useState(Boolean(config?.clientId));

  useEffect(() => {
    if (config?.clientId) return;
    void fetchConfig()
      .then((serverConfig) => {
        if (serverConfig) setConfig(serverConfig);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, [config?.clientId, fetchConfig]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!config?.clientId) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        PayPal is not configured. Add <code className="font-mono">VITE_PAYPAL_CLIENT_ID</code> and{" "}
        <code className="font-mono">PAYPAL_CLIENT_SECRET</code> to your environment.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Pay {peso(total)} with PayPal, debit/credit card, or other PayPal checkout options.
      </p>
      <PayPalScriptProvider
        options={{
          clientId: config.clientId,
          currency: config.currency,
          intent: "capture",
          components: "buttons",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "paypal" }}
          createOrder={async () => {
            const result = await createPayPalOrder({ data: { orderId } });
            return result.paypalOrderId;
          }}
          onApprove={async (data) => {
            const paypalOrderId = data.orderID;
            if (!paypalOrderId) throw new Error("PayPal order ID missing");
            const result = await capturePayPalPayment({
              data: { orderId, paypalOrderId },
            });
            if (result.paid) {
              toast.success("Payment confirmed via PayPal!");
              onPaid();
            } else {
              toast.message("Payment is still processing. Please wait a moment.");
            }
          }}
          onCancel={() => {
            toast.message("PayPal checkout cancelled.");
            onCancel?.();
          }}
          onError={(err) => {
            console.error(err);
            toast.error("PayPal checkout failed. Please try again.");
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
}
