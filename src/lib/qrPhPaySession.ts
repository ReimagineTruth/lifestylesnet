const STORAGE_KEY = "lifestyles_qrph_order_session_v1";
const TTL_MS = 35 * 60 * 1000;

export type OrderQrPhSession = {
  orderId: string;
  intentId: string;
  qrImageUrl: string;
  total: number;
  scanHint: string;
  providerName?: string;
  createdAt: number;
};

export function saveOrderQrPhSession(session: OrderQrPhSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function loadOrderQrPhSession(): OrderQrPhSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as OrderQrPhSession;
    if (Date.now() - parsed.createdAt > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearOrderQrPhSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

/** Legacy key used on order page before session helper existed. */
export function legacyQrKey(orderId: string) {
  return `paymongo-qr-${orderId}`;
}
