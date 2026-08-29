import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { LiveCustomerReviews } from "@/components/site/LiveCustomerReviews";
import { filterVisibleProducts, products, peso, productFromPrice } from "@/lib/products";
import { getTestProductVisibleFn } from "@/lib/settings.server";

export const Route = createFileRoute("/")({
  loader: async () => {
    const { visible } = await getTestProductVisibleFn();
    return { products: filterVisibleProducts(products, visible) };
  },
  head: () => ({
    meta: [
      { title: "Lifestyles Philippines | Live Better. Every Day." },
      {
        name: "description",
        content:
          "Shop Intra, Nutria Plus, CardioLife and FibreLife. Botanical wellness products delivered nationwide in the Philippines.",
      },
      { property: "og:title", content: "Lifestyles Philippines | Live Better. Every Day." },
      {
        property: "og:description",
        content:
          "Shop Intra, Nutria Plus, CardioLife and FibreLife. Botanical wellness products delivered nationwide in the Philippines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { products: visibleProducts } = Route.useLoaderData();
  return (
    <>
      {/* Hero */}
      <section className="container-page py-16 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="eyebrow">Botanical wellness since 1989</p>
            <h1 className="mt-5 max-w-xl">
              Live Better.
              <br />
              Every Day.
            </h1>
            <p className="lead mt-6 max-w-lg">
              Four core formulations made to work together — supporting your body with botanical
              extracts, vitamins and daily fibre.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Shop products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-md border border-border px-7 py-3.5 text-base font-semibold transition-colors hover:bg-accent"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-4/3 overflow-hidden rounded-2xl bg-muted/40">
              <img
                src={products[0]!.image}
                alt="Intra botanical wellness drink"
                width={1024}
                height={768}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-5 shadow-sm md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Free shipping
              </p>
              <p className="mt-1.5 text-base font-semibold">On orders over ₱3,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Factory tour */}
      <section className="border-t border-border bg-muted/20 py-16 md:py-28">
        <div className="container-page">
          <p className="eyebrow">Behind the product</p>
          <h2 className="mt-3 max-w-2xl">Our factory</h2>
          <p className="lead mt-4 max-w-2xl">
            See how Lifestyles formulations are made — quality-controlled production you can trust.
          </p>
          <div className="relative mt-8 w-full overflow-hidden rounded-2xl border border-border bg-black pb-[56.25%] shadow-sm">
            <iframe
              allow="fullscreen; autoplay"
              allowFullScreen
              src="https://streamable.com/e/wq7rqu?autoplay=1&nocontrols=1"
              title="Lifestyles factory tour"
              className="absolute left-0 top-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border bg-muted/20 py-16 md:py-28">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured</p>
              <h2 className="mt-3">Our products</h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1 text-base font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

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
                <h3 className="mt-5 text-xl font-semibold">{p.name}</h3>
                <p className="mt-2 line-clamp-2 text-base leading-relaxed text-muted-foreground">
                  {p.tagline}
                </p>
                <p className="mt-4 text-lg font-semibold text-foreground">
                  From {peso(productFromPrice(p))}
                </p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Live customer reviews */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="container-page">
          <LiveCustomerReviews />
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16 md:py-28">
        <div className="grid gap-8 sm:grid-cols-3">
          <ValueCard
            icon={<Leaf className="h-6 w-6" />}
            title="Botanical first"
            description="Formulations built on plant extracts, vitamins and minerals sourced with care."
          />
          <ValueCard
            icon={<Truck className="h-6 w-6" />}
            title="Nationwide delivery"
            description="Shipped across the Philippines with free delivery on qualifying orders."
          />
          <ValueCard
            icon={<ShieldCheck className="h-6 w-6" />}
            title="Trusted quality"
            description="Lifestyles products have supported healthy routines for over three decades."
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-page pb-16 md:pb-28">
        <div className="rounded-2xl bg-brand-soft px-6 py-14 text-center md:px-10 md:py-20">
          <h2 className="text-foreground">Start with Intra</h2>
          <p className="lead mx-auto mt-5 max-w-xl">
            The original 23-herb botanical drink. A simple daily habit that works in harmony with
            your body.
          </p>
          <Link
            to="/products/$slug"
            params={{ slug: "intra" }}
            className="mt-10 inline-flex items-center gap-2 rounded-md bg-brand px-7 py-3.5 text-base font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            Shop Intra <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </>
  );
}

function ValueCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-7">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-semibold">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
