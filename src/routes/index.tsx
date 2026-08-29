import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, Truck, ShieldCheck } from "lucide-react";
import { products, peso } from "@/lib/products";

export const Route = createFileRoute("/")({
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
  return (
    <>
      {/* Hero */}
      <section className="container-page py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Botanical wellness since 1989
            </p>
            <h1 className="mt-4 text-5xl font-semibold leading-[1.1] md:text-6xl">
              Live Better.
              <br />
              Every Day.
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Four core formulations made to work together — supporting your body with botanical
              extracts, vitamins and daily fibre.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
              >
                Shop products <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-md border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-accent"
              >
                Learn more
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-muted/40">
              <img
                src={products[0]!.image}
                alt="Intra botanical wellness drink"
                width={1024}
                height={768}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-xl border border-border bg-card p-4 shadow-sm md:block">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Free shipping
              </p>
              <p className="mt-1 text-sm font-medium">On orders over ₱3,000</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="border-t border-border bg-muted/20 py-16 md:py-24">
        <div className="container-page">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Featured
              </p>
              <h2 className="mt-2 text-3xl font-semibold">Our products</h2>
            </div>
            <Link
              to="/products"
              className="hidden items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
            >
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
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
                <h3 className="mt-4 text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-3 font-semibold text-foreground">{peso(p.price)}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="container-page py-16 md:py-24">
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
      <section className="container-page pb-16 md:pb-24">
        <div className="rounded-2xl bg-brand-soft px-6 py-12 text-center md:py-16">
          <h2 className="text-3xl font-semibold text-foreground">Start with Intra</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            The original 23-herb botanical drink. A simple daily habit that works in harmony with
            your body.
          </p>
          <Link
            to="/products/$slug"
            params={{ slug: "intra" }}
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
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
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
