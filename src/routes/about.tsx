import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Learn about Lifestyles Philippines — botanical wellness products supporting healthier routines since 1989.",
      },
      { property: "og:title", content: "About Lifestyles Philippines" },
      {
        property: "og:description",
        content:
          "Learn about Lifestyles Philippines — botanical wellness products supporting healthier routines since 1989.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container-page py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        About us
      </p>
      <h1 className="mt-2 text-4xl font-semibold">About Lifestyles Philippines</h1>
      <div className="mt-8 max-w-3xl space-y-4 text-muted-foreground">
        <p>
          Lifestyles is a global wellness brand committed to helping people live better every day.
          Since 1989, we have developed botanical-based products designed to support the body's
          natural systems.
        </p>
        <p>
          Our flagship product, Intra, is a balanced blend of 23 botanical extracts. Over the years,
          the Lifestyles family has grown to include Nutria Plus, CardioLife and FibreLife — each
          formulated to complement a healthy, active lifestyle.
        </p>
        <p>
          In the Philippines, Lifestyles products are available through independent distributors and
          online, delivered nationwide.
        </p>
      </div>
    </div>
  );
}
