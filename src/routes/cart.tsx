import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { getProduct, peso } from "@/lib/products";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "@/lib/orders";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Lifestyles Philippines" },
      { name: "description", content: "Review your Lifestyles wellness order before checkout." },
      { property: "og:title", content: "Your Cart | Lifestyles Philippines" },
      { property: "og:description", content: "Review your Lifestyles order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();

  const lines = items
    .map((i) => ({ item: i, product: getProduct(i.slug) }))
    .filter((l) => l.product);

  const subtotal = lines.reduce((sum, l) => sum + l.product!.price * l.item.qty, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  return (
    <div className="container-page py-14">
      <h1 className="text-4xl font-semibold">Your cart</h1>

      {lines.length === 0 ? (
        <div className="mt-10 rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Link
            to="/products"
            className="mt-6 inline-block rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {lines.map(({ item, product }) => (
              <li key={item.slug} className="flex gap-4 p-5">
                <img
                  src={product!.image}
                  alt={product!.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{product!.name}</h2>
                      <p className="text-sm text-muted-foreground">{product!.size}</p>
                    </div>
                    <p className="font-semibold">{peso(product!.price * item.qty)}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => setQty(item.slug, item.qty - 1)}
                        className="px-3 py-1.5"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => setQty(item.slug, item.qty + 1)}
                        className="px-3 py-1.5"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(item.slug)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <aside className="h-fit rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{peso(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd>{shipping === 0 ? "Free" : peso(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                <dt>Total</dt>
                <dd>{peso(subtotal + shipping)}</dd>
              </div>
            </dl>
            <Link
              to="/checkout"
              className="mt-6 block rounded-md bg-brand px-6 py-3 text-center text-sm font-semibold text-brand-foreground"
            >
              Proceed to checkout
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Free shipping on orders over {peso(FREE_SHIPPING_THRESHOLD)}.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
