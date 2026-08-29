export type QrPhProvider = {
  id: string;
  label: string;
  hint?: string;
};

/** BSP-style apps shown on checkout — branding only; PayMongo method is always qr_ph. */
export const QRPH_PROVIDERS: QrPhProvider[] = [
  { id: "qr_ph", label: "QR Ph", hint: "Any QR Ph bank or wallet app" },
  { id: "gcash", label: "GCash" },
  { id: "maya", label: "Maya" },
  { id: "grab_pay", label: "GrabPay" },
  { id: "shopee_pay", label: "ShopeePay" },
  { id: "bdo", label: "BDO" },
  { id: "bpi", label: "BPI" },
  { id: "metrobank", label: "Metrobank" },
  { id: "landbank", label: "Land Bank" },
];

export function qrScanHint(provider?: QrPhProvider) {
  if (!provider || provider.id === "qr_ph") {
    return "Scan with GCash, Maya, or any QR Ph app";
  }
  return `Scan with ${provider.label} or any QR Ph app`;
}
