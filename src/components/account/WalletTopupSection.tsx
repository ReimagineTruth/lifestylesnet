import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Loader2, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { BANK_OPTIONS, type BankCode } from "@/lib/paymongo";
import { getPayPalConfigFn } from "@/lib/paypal.server";
import { paypalClientConfig } from "@/lib/paypal";
import { peso } from "@/lib/products";
import { QRPH_PROVIDERS, type QrPhProvider } from "@/lib/qrphProviders";
import {
  captureWalletTopupPayPalFn,
  confirmWalletTopupFn,
  createWalletTopupFn,
} from "@/lib/wallet.server";

const TOPUP_PRESETS = [500, 1000, 2000, 5000, 10000];

type Props = {
  token: string;
  onComplete: (balance: number) => void;
};

export function WalletTopupSection({ token, onComplete }: Props) {
  const createTopup = useServerFn(createWalletTopupFn);
  const confirmTopup = useServerFn(confirmWalletTopupFn);
  const captureTopupPayPal = useServerFn(captureWalletTopupPayPalFn);
  const fetchPayPalConfig = useServerFn(getPayPalConfigFn);

  const [amount, setAmount] = useState(1000);
  const [payMethod, setPayMethod] = useState<"qr_ph" | "bank" | "paypal">("qr_ph");
  const [bankCode, setBankCode] = useState<BankCode>("bpi");
  const [qrProvider, setQrProvider] = useState<QrPhProvider>(QRPH_PROVIDERS[0]!);
  const [submitting, setSubmitting] = useState(false);
  const [topupId, setTopupId] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [paypalConfig, setPaypalConfig] = useState(paypalClientConfig());

  useEffect(() => {
    if (paypalConfig?.clientId) return;
    void fetchPayPalConfig()
      .then((cfg) => {
        if (cfg) setPaypalConfig(cfg);
      })
      .catch(() => {});
  }, [fetchPayPalConfig, paypalConfig?.clientId]);

  useEffect(() => {
    if (!topupId || !qrImageUrl) return;
    const interval = window.setInterval(() => {
      void confirmTopup({ data: { token, topupId } })
        .then((result) => {
          if (result.paid) {
            toast.success("Top-up confirmed! Na-credit na ang wallet mo.");
            onComplete(result.balance);
            setTopupId(null);
            setQrImageUrl(null);
          }
        })
        .catch(() => {});
    }, 4000);
    return () => window.clearInterval(interval);
  }, [topupId, qrImageUrl, token, confirmTopup, onComplete]);

  function startTopup() {
    if (submitting) return;
    setSubmitting(true);
    void createTopup({
      data: {
        token,
        amount,
        paymentMethod: payMethod,
        ...(payMethod === "bank" ? { bankCode } : {}),
      },
    })
      .then((result) => {
        setTopupId(result.topupId);
        if (result.paymentMethod === "paypal" && result.paypalOrderId) {
          setPaypalOrderId(result.paypalOrderId);
          return;
        }
        if (result.payment?.redirectUrl) {
          window.location.href = result.payment.redirectUrl;
          return;
        }
        if (result.payment?.qrImageUrl) {
          setQrImageUrl(result.payment.qrImageUrl);
          toast.success("Scan the QR code to complete your top-up.");
          return;
        }
        throw new Error("Payment could not be started.");
      })
      .catch((err: Error) => toast.error(err.message || "Could not start top-up."))
      .finally(() => setSubmitting(false));
  }

  if (paypalOrderId && topupId && payMethod === "paypal" && paypalConfig?.clientId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold">Complete PayPal top-up</h3>
        <p className="mt-1 text-sm text-muted-foreground">Top-up amount: {peso(amount)}</p>
        <div className="mt-6 max-w-md">
          <PayPalScriptProvider
            options={{
              clientId: paypalConfig.clientId,
              currency: paypalConfig.currency,
              intent: "capture",
              components: "buttons",
            }}
          >
            <PayPalButtons
              style={{ layout: "vertical", shape: "rect", label: "paypal" }}
              createOrder={() => Promise.resolve(paypalOrderId)}
              onApprove={async (data) => {
                const id = data.orderID ?? paypalOrderId;
                const result = await captureTopupPayPal({
                  data: { token, topupId, paypalOrderId: id },
                });
                if (result.paid) {
                  toast.success("Wallet top-up successful!");
                  onComplete(result.balance);
                  setTopupId(null);
                  setPaypalOrderId(null);
                }
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    );
  }

  if (qrImageUrl && topupId) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <QrCode className="mx-auto h-8 w-8 text-brand" />
        <h3 className="mt-3 text-lg font-semibold">Scan to top up {peso(amount)}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Gamitin ang {qrProvider.label} o kahit anong QR Ph app.
        </p>
        <img
          src={qrImageUrl}
          alt="QR Ph top-up"
          className="mx-auto mt-6 max-w-xs rounded-lg border border-border bg-white p-3"
        />
        <p className="mt-4 text-sm text-muted-foreground">
          Maghintay — auto-update ang balance pag na-confirm ang payment.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold">Top up wallet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Mag-load ng balance gamit ang QR Ph, online banking, o PayPal.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {TOPUP_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setAmount(preset)}
            className={`rounded-full border px-4 py-2 text-sm font-medium ${
              amount === preset ? "border-brand bg-brand-soft text-brand" : "border-border"
            }`}
          >
            {peso(preset)}
          </button>
        ))}
      </div>

      <label className="mt-5 block text-sm font-semibold">Custom amount (min ₱100)</label>
      <input
        type="number"
        min={100}
        step={100}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="mt-2 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      <p className="mt-6 text-sm font-semibold">Payment method</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(["qr_ph", "bank", "paypal"] as const).map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => setPayMethod(method)}
            className={`rounded-md border px-4 py-2 text-sm font-medium ${
              payMethod === method ? "border-brand bg-brand-soft" : "border-border"
            }`}
          >
            {method === "qr_ph" ? "QR Ph" : method === "bank" ? "Online banking" : "PayPal"}
          </button>
        ))}
      </div>

      {payMethod === "qr_ph" && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {QRPH_PROVIDERS.slice(0, 6).map((provider) => (
            <button
              key={provider.id}
              type="button"
              onClick={() => setQrProvider(provider)}
              className={`rounded-lg border px-3 py-2 text-left text-sm ${
                qrProvider.id === provider.id ? "border-brand bg-brand-soft" : "border-border"
              }`}
            >
              {provider.label}
            </button>
          ))}
        </div>
      )}

      {payMethod === "bank" && (
        <select
          value={bankCode}
          onChange={(e) => setBankCode(e.target.value as BankCode)}
          className="mt-4 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          {BANK_OPTIONS.map((b) => (
            <option key={b.code} value={b.code}>
              {b.label}
            </option>
          ))}
        </select>
      )}

      <button
        type="button"
        disabled={submitting || amount < 100}
        onClick={startTopup}
        className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground disabled:opacity-50"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        Top up {peso(amount)}
      </button>
    </div>
  );
}
