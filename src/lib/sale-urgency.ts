/** Deterministic sale / scarcity signals for conversion-focused product pages. */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type SaleMeta = {
  compareAt: number;
  discountPercent: number;
  savings: number;
  stockLeft: number;
};

/** Stable “was” price and discount per variant — feels like a real markdown. */
export function saleMetaForVariant(variantId: string, price: number): SaleMeta {
  const seed = hashSeed(variantId);
  const discountPercent = 18 + (seed % 11); // 18–28%
  const rawCompare = price / (1 - discountPercent / 100);
  const compareAt = Math.max(price + 100, Math.ceil(rawCompare / 100) * 100 - 1);
  return {
    compareAt,
    discountPercent,
    savings: compareAt - price,
    stockLeft: 3 + (seed % 10), // 3–12 units
  };
}

/** Cheapest variant drives “From” pricing on cards. */
export function saleMetaForProduct(
  slug: string,
  fromPrice: number,
  variantId?: string,
): SaleMeta {
  return saleMetaForVariant(variantId ?? `${slug}-from`, fromPrice);
}

/** Flash sale ends at midnight Philippines time. */
export function manilaSaleDeadlineMs(now = Date.now()): number {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(now));
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return new Date(`${y}-${m}-${d}T23:59:59+08:00`).getTime();
}

export function formatCountdown(msLeft: number): string {
  const total = Math.max(0, Math.floor(msLeft / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Gentle live-viewer count that shifts every ~30s. */
export function liveViewers(productSlug: string, now = Date.now()): number {
  const base = 14 + (hashSeed(productSlug) % 22);
  const jitter = Math.floor(now / 28_000) % 9;
  return base + jitter;
}

export function isLowStock(stockLeft: number): boolean {
  return stockLeft <= 6;
}
