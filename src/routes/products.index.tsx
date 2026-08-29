import { createFileRoute, Link } from "@tanstack/react-router";
import { filterVisibleProducts, peso, productFromPrice, products } from "@/lib/products";
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
    <div className="container-page py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Shop
      </p>
      <h1 className="mt-2 text-4xl font-semibold">All products</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Five product lines with single bottles, multi-packs and Better Together bundles. Free
        shipping on orders over ₱3,000 anywhere in the Philippines.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((p) => (
          <Link
            key={p.slug}
            to="/products/$slug"
            params={{ slug: p.slug }}
            className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-lg"
          >
            <div className="overflow-hidden rounded-lg bg-muted/40">
              <img
                src={p.image}
                alt={`${p.name} — ${p.tagline}`}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h2 className="mt-4 text-lg font-semibold">{p.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
            <p className="mt-3 font-semibold text-foreground">
              From {peso(productFromPrice(p))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {p.variants.length} bundle{p.variants.length > 1 ? "s" : ""} available
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
