import { Clock, Eye, Flame, Package } from "lucide-react";
import { useSyncExternalStore } from "react";
import {
  formatCountdown,
  isLowStock,
  liveViewers,
  manilaSaleDeadlineMs,
  type SaleMeta,
} from "@/lib/sale-urgency";

type Props = {
  productSlug: string;
  sale: SaleMeta;
};

function subscribeToTick(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

function getClientNow() {
  return Date.now();
}

function getServerNow() {
  return 0;
}

export function ProductUrgencyBanner({ productSlug, sale }: Props) {
  const now = useSyncExternalStore(subscribeToTick, getClientNow, getServerNow);
  const isLive = now > 0;
  const msLeft = isLive ? manilaSaleDeadlineMs(now) - now : null;
  const viewers = isLive ? liveViewers(productSlug, now) : null;
  const low = isLowStock(sale.stockLeft);

  return (
    <div className="sale-urgency-banner mt-6 rounded-xl border border-destructive/30 bg-linear-to-r from-destructive/10 via-orange-500/10 to-destructive/5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Flame className="h-4 w-4 text-destructive" aria-hidden />
        <p className="text-sm font-bold uppercase tracking-wide text-destructive">
          Flash sale — ends tonight
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
          <Clock className="h-4 w-4 text-destructive" aria-hidden />
          <span className="countdown-pulse rounded-md bg-destructive px-2 py-0.5 font-mono text-destructive-foreground">
            {msLeft !== null ? formatCountdown(msLeft) : "--:--:--"}
          </span>
        </span>

        <span
          className={`inline-flex items-center gap-1.5 font-medium ${low ? "text-destructive" : "text-foreground"}`}
        >
          <Package className="h-4 w-4 shrink-0" aria-hidden />
          {low ? (
            <>
              Only <strong className="mx-0.5">{sale.stockLeft}</strong> left at this price!
            </>
          ) : (
            <>
              <strong className="mr-0.5">{sale.stockLeft}</strong> in stock — selling fast
            </>
          )}
        </span>

        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span className="live-dot" aria-hidden />
          <Eye className="h-4 w-4" aria-hidden />
          <span>
            <strong className="text-foreground">{viewers ?? "—"}</strong> viewing now
          </span>
        </span>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Price increases after midnight. Order now to lock in today&apos;s rate.
      </p>
    </div>
  );
}
