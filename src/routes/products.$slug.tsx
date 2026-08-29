import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ExternalLink, ShoppingBag, Youtube } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import {
  getDefaultVariant,
  peso,
  pesoExact,
  products,
  variantCartLabel,
  variantImage,
  type ProductWithImages,
} from "@/lib/products";
import { loadProductForPageFn } from "@/lib/products.server";
import { getTestProductVisibleFn } from "@/lib/settings.server";
import { isTestProductSlug } from "@/lib/products";
import { LiveCustomerReviews } from "@/components/site/LiveCustomerReviews";
import { tl } from "@/lib/tagalog";

const FAQ_TAGALOG_SECTION: Partial<Record<string, string>> = {
  intra: "intra",
  "nutria-plus": "nutria-plus",
  cardiolife: "cardiolife",
  fibrelife: "fibrelife",
  "better-together-pack": "lifestyles",
};

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params }) => {
    if (isTestProductSlug(params.slug)) {
      const { visible } = await getTestProductVisibleFn();
      if (!visible) throw notFound();
    }
    const product = await loadProductForPageFn({ data: params.slug });
    if (!product || product.variants.length === 0) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Product not found | Lifestyles Philippines" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product } = loaderData;
    const title = `${product.name} — ${product.tagline} | Lifestyles Philippines`;
    return {
      meta: [
        { title },
        { name: "description", content: product.short },
        { property: "og:title", content: title },
        { property: "og:description", content: product.short },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  return <ProductDetailView key={product.slug} product={product} />;
}

function ProductDetailView({ product }: { product: ProductWithImages }) {
  const { add } = useCart();
  const defaultVariant = getDefaultVariant(product);
  const [selectedId, setSelectedId] = useState(defaultVariant.id);
  const [qty, setQty] = useState(1);

  const selected = product.variants.find((variant) => variant.id === selectedId) ?? defaultVariant;
  const displayImage = variantImage(product, selected);
  const related = products.filter((p) => p.slug !== product.slug);

  return (
    <div className="container-page py-8 sm:py-12">
      <nav className="text-base text-muted-foreground">
        <Link to="/products" className="hover:text-foreground">
          Products
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 grid items-start gap-6 lg:mt-6 lg:grid-cols-2 lg:gap-10">
        <div className="mx-auto w-full max-w-xs sm:max-w-sm lg:sticky lg:top-20 lg:max-w-none">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted/30">
            <img
              src={displayImage}
              alt={`${product.name} — ${selected.label}`}
              width={480}
              height={480}
              decoding="async"
              fetchPriority="high"
              className="aspect-square w-full object-contain p-4 sm:p-6"
            />
          </div>
        </div>

        <div>
          <h1>{product.name}</h1>
          <p className="lead mt-3">{product.tagline}</p>
          <p className="mt-8 text-4xl font-semibold tracking-tight">{peso(selected.price)}</p>
          <p className="mt-2 text-base text-muted-foreground">
            {selected.size} · Code {selected.code} · {selected.points} pts · In stock
          </p>

          <div className="mt-8">
            <p className="text-base font-semibold">Choose bundle</p>
            <div className="mt-4 space-y-2">
              {product.variants.map((variant) => (
                <label
                  key={variant.id}
                  className={`flex cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-3.5 text-base transition-colors ${
                    selected.id === variant.id
                      ? "border-brand bg-brand-soft"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="variant"
                      checked={selected.id === variant.id}
                      onChange={() => setSelectedId(variant.id)}
                      className="accent-brand"
                    />
                    {variant.image ? (
                      <img
                        src={variant.image}
                        alt=""
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-md border border-border bg-background object-contain p-1"
                      />
                    ) : null}
                    <span>
                      <span className="font-medium">{variant.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">
                        {variant.size}
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold">{pesoExact(variant.price)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg"
              >
                −
              </button>
              <span className="w-10 text-center text-base font-medium">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
                className="px-4 py-2 text-lg"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                add(selected.id, qty);
                toast.success(tl.toast.addedToCart(variantCartLabel(product, selected)));
              }}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90"
            >
              <ShoppingBag className="h-4 w-4" /> Add to cart
            </button>
            <Link
              to="/cart"
              className="rounded-md border border-border px-7 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
            >
              View cart
            </Link>
          </div>

          <div className="body-lg mt-10 space-y-4 text-muted-foreground">
            {product.description.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <ul className="mt-8 space-y-3">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-base">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <span>{b}</span>
              </li>
            ))}
          </ul>

          <dl className="body-lg mt-10 space-y-6 border-t border-border pt-10">
            <div>
              <dt className="font-semibold">Ingredients</dt>
              <dd className="mt-1 text-muted-foreground">{product.ingredients}</dd>
            </div>
            <div>
              <dt className="font-semibold">Directions</dt>
              <dd className="mt-1 text-muted-foreground">{product.directions}</dd>
            </div>
          </dl>

          {product.faqs && product.faqs.length > 0 && (
            <section className="mt-12 border-t border-border pt-10">
              <h2>Frequently asked questions</h2>
              <dl className="mt-8 space-y-8">
                {product.faqs.map((faq) => (
                  <div key={faq.q}>
                    <dt className="text-base font-semibold">{faq.q}</dt>
                    <dd className="body-lg mt-3 text-muted-foreground">{faq.a}</dd>
                  </div>
                ))}
              </dl>
              {FAQ_TAGALOG_SECTION[product.slug] && (
                <p className="mt-8 text-base">
                  <a
                    href={`/faq#${FAQ_TAGALOG_SECTION[product.slug]}`}
                    className="font-medium text-brand hover:underline"
                  >
                    Basahin ang FAQ sa Tagalog →
                  </a>
                </p>
              )}
            </section>
          )}

          {product.resources && product.resources.length > 0 && (
            <section className="mt-10 space-y-4">
              <h2 className="text-lg font-semibold">Resources</h2>
              <ul className="space-y-2">
                {product.resources.map((resource) => (
                  <li key={resource.href}>
                    {resource.href.startsWith("/") ? (
                      <Link
                        to={resource.href as "/fda"}
                        className="inline-flex items-center gap-2 text-base font-medium text-brand hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        {resource.label}
                      </Link>
                    ) : (
                      <a
                        href={resource.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-base font-medium text-brand hover:underline"
                      >
                        {resource.kind === "video" ? (
                          <Youtube className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                        {resource.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="mt-8 text-sm text-muted-foreground">No approved therapeutic claims.</p>
        </div>
      </div>

      {!isTestProductSlug(product.slug) && (
        <div className="mt-16 border-t border-border pt-16">
          <LiveCustomerReviews productName={product.name} />
        </div>
      )}

      <section className="mt-24">
        <h2>You may also like</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {related.map((p) => (
            <Link
              key={p.slug}
              to="/products/$slug"
              params={{ slug: p.slug }}
              className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
            >
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                width={480}
                height={480}
                className="mx-auto aspect-square max-h-48 w-full rounded-lg object-contain"
              />
              <h3 className="mt-5 text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 text-base text-muted-foreground">{p.tagline}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
