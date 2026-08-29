import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/opportunity")({
  head: () => ({
    meta: [
      { title: "Licensee Opportunity | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Join Lifestyles Philippines as an independent distributor. Build a wellness business with trusted products and support.",
      },
      { property: "og:title", content: "Licensee Opportunity | Lifestyles Philippines" },
      {
        property: "og:description",
        content:
          "Join Lifestyles Philippines as an independent distributor. Build a wellness business with trusted products and support.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OpportunityPage,
});

function OpportunityPage() {
  return (
    <div className="container-page py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        Opportunity
      </p>
      <h1 className="mt-2 text-4xl font-semibold">Build a wellness business</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        Become an independent Lifestyles distributor and share products that have supported healthy
        routines for over three decades.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "Quality products",
            description:
              "Offer Intra, Nutria Plus, CardioLife and FibreLife — products people trust.",
          },
          {
            title: "Training & support",
            description:
              "Access product knowledge, business tools and a community of distributors.",
          },
          {
            title: "Flexible income",
            description: "Build your business at your own pace, part-time or full-time.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-lg font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Get started</h2>
        <p className="mt-2 text-muted-foreground">
          Interested in learning more? Reach out through our contact page and a team member will
          follow up with next steps.
        </p>
        <Link
          to="/contact"
          className="mt-4 inline-flex rounded-md bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
