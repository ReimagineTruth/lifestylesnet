import { createFileRoute } from "@tanstack/react-router";
import { ContactFeedbackForm } from "@/components/site/ContactFeedbackForm";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Get in touch with Lifestyles Philippines. Find our office location and email.",
      },
      { property: "og:title", content: "Contact Lifestyles Philippines" },
      {
        property: "og:description",
        content:
          "Get in touch with Lifestyles Philippines. Find our office location and email.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="container-page py-16 md:py-20">
      <p className="eyebrow">Contact</p>
      <h1 className="mt-3">Contact us</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold">Philippines office</h2>
            <p className="body-lg mt-3 text-muted-foreground">
              Lifestyles Philippines
              <br />
              Makati City, Metro Manila
              <br />
              support@lifestyles.ph
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold">Customer support</h2>
            <p className="body-lg mt-3 text-muted-foreground">
              Monday – Friday, 9:00 AM – 6:00 PM PHT
              <br />
              support@lifestyles.ph
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-7">
          <h2 className="text-xl font-semibold">Magpadala ng mensahe</h2>
          <p className="body-lg mt-3 text-muted-foreground">
            Magtanong tungkol sa produkto, order, o delivery. Realtime ang sagot — tingnan ang
            widget sa kanang ibaba ng page.
          </p>
          <div className="mt-6">
            <ContactFeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
}
