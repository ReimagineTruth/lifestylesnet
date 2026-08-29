export type PaymongoCheckoutMethod =
  | "qr_ph"
  | "gcash"
  | "maya"
  | "grab_pay"
  | "shopee_pay"
  | "billease"
  | "bank"
  | "card";

export type BankCode = "bpi" | "ubp" | "bdo" | "landbank" | "metrobank";

export const PAYMONGO_METHODS: {
  id: PaymongoCheckoutMethod;
  title: string;
  desc: string;
  needsBank?: boolean;
}[] = [
  {
    id: "qr_ph",
    title: "QR Ph",
    desc: "Scan with GCash, Maya, BPI, or any QR Ph app.",
  },
  {
    id: "gcash",
    title: "GCash",
    desc: "Pay via GCash e-wallet (redirect).",
  },
  {
    id: "maya",
    title: "Maya",
    desc: "Pay via Maya wallet (redirect).",
  },
  {
    id: "grab_pay",
    title: "GrabPay",
    desc: "Pay with GrabPay (redirect).",
  },
  {
    id: "shopee_pay",
    title: "ShopeePay",
    desc: "Pay with ShopeePay (redirect).",
  },
  {
    id: "billease",
    title: "BillEase",
    desc: "Buy now, pay later (min ₱100).",
  },
  {
    id: "bank",
    title: "Online banking",
    desc: "BPI, UnionBank, BDO, Landbank, or Metrobank.",
    needsBank: true,
  },
  {
    id: "card",
    title: "Credit / debit card",
    desc: "Visa, Mastercard via PayMongo checkout.",
  },
];

export const BANK_OPTIONS: { code: BankCode; label: string }[] = [
  { code: "bpi", label: "BPI" },
  { code: "ubp", label: "UnionBank" },
  { code: "bdo", label: "BDO" },
  { code: "landbank", label: "Land Bank" },
  { code: "metrobank", label: "Metrobank" },
];

export type PaymongoPaymentResult = {
  intentId: string;
  clientKey: string;
  status: string;
  qrImageUrl?: string;
  redirectUrl?: string;
  checkoutUrl?: string;
};
