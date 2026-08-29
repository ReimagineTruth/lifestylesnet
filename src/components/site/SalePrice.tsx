import { peso, pesoExact } from "@/lib/products";
import type { SaleMeta } from "@/lib/sale-urgency";

type Props = {
  price: number;
  sale: SaleMeta;
  size?: "hero" | "compact" | "card";
  exact?: boolean;
};

export function SalePrice({ price, sale, size = "hero", exact = false }: Props) {
  const format = exact ? pesoExact : peso;

  if (size === "hero") {
    return (
      <div className="mt-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className="sale-badge">Save {sale.discountPercent}%</span>
          <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-destructive">
            Limited offer
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
          <p className="text-4xl font-bold tracking-tight text-destructive">{format(price)}</p>
          <p className="pb-1 text-xl text-muted-foreground line-through decoration-2">
            {format(sale.compareAt)}
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-destructive">
          You save {format(sale.savings)} · Was {format(sale.compareAt)}
        </p>
      </div>
    );
  }

  if (size === "card") {
    return (
      <div className="mt-4">
        <span className="sale-badge text-[10px]">−{sale.discountPercent}%</span>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-bold text-destructive">From {format(price)}</span>
          <span className="text-sm text-muted-foreground line-through">{format(sale.compareAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5 text-right">
      <span className="font-bold text-destructive">{format(price)}</span>
      <span className="text-xs text-muted-foreground line-through">{format(sale.compareAt)}</span>
    </span>
  );
}
