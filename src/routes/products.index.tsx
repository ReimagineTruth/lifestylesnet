import { createFileRoute, Link } from "@tanstack/react-router";
import { SalePrice } from "@/components/site/SalePrice";
import { filterVisibleProducts, productFromPrice, products } from "@/lib/products";
import { saleMetaForProduct } from "@/lib/sale-urgency";
import { getTestProductVisibleFn } from "@/lib/settings.server";

export const Route = createFileRoute("/products/")({
  loader: async () => {
    const { visible } = await getTestProductVisibleFn();
    return { products: filterVisibleProducts(products, visible) };
  },
  head: () => ({
    meta: [
      { title: "Shop Wellness Products | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Browse Intra, Nutria Plus, CardioLife and FibreLife — botanical wellness supplements delivered nationwide across the Philippines.",
      },
      { property: "og:title", content: "Shop Wellness Products | Lifestyles Philippines" },
      {
        property: "og:description",
        content: "Intra, Nutria Plus, CardioLife and FibreLife, delivered nationwide.",
      },
    ],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const { products: visibleProducts } = Route.useLoaderData();
  return (
    <div className="container-page py-16 md:py-20">
      <p className="eyebrow">Shop</p>
      <h1 className="mt-3">All products</h1>
      <p className="lead mt-4 max-w-2xl">
        Five product lines with single bottles, multi-packs and Better Together bundles. Free
        shipping on orders over ₱3,000 anywhere in the Philippines.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((p) => {
          const fromPrice = productFromPrice(p);
          const sale = saleMetaForProduct(p.slug, fromPrice, p.variants[0]?.id);
          return (
          <Link
            key={p.slug}
            to="/products/$slug"
            params={{ slug: p.slug }}
            className="group rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-lg"
          >
            <div className="relative overflow-hidden rounded-lg bg-muted/40">
              <span className="sale-badge absolute left-2 top-2 z-10 text-[10px]">
                −{sale.discountPercent}%
              </span>
              <img
                src={p.image}
                alt={`${p.name} — ${p.tagline}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-5 text-xl font-semibold">{p.name}</h2>
            <p className="mt-2 line-clamp-2 text-base leading-relaxed text-muted-foreground">
              {p.tagline}
            </p>
            <SalePrice price={fromPrice} sale={sale} size="card" />
            <p className="mt-1.5 text-sm text-muted-foreground">
              {p.variants.length} bundle{p.variants.length > 1 ? "s" : ""} · Flash sale ends tonight
            </p>
          </Link>
        );
        })}
      </div>
    </div>
  );
}
