import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LIFESTYLES_OFFICIAL_URL, lifestylesFaqTagalog } from "@/lib/faq-tagalog";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Mga Madalas Itanong (Tagalog) | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Mga sagot sa Tagalog tungkol sa Intra, Nutria Plus, CardioLife, FibreLife, pag-order, at Lifestyles business opportunity.",
      },
      { property: "og:title", content: "Mga Madalas Itanong (Tagalog) | Lifestyles Philippines" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="container-page py-16 md:py-20">
      <p className="eyebrow">FAQ · Tagalog</p>
      <h1 className="mt-3">Mga madalas itanong</h1>
      <p className="lead mt-4 max-w-2xl">
        Impormasyon tungkol sa Lifestyles products at serbisyo sa Pilipinas — isinalin at buod mula
        sa opisyal na{" "}
        <a
          href={LIFESTYLES_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand hover:underline"
        >
          Lifestyles Global Network
        </a>{" "}
        website.
      </p>

      <nav className="mt-8 flex flex-wrap gap-2">
        {lifestylesFaqTagalog.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-brand hover:text-brand"
          >
            {section.title}
          </a>
        ))}
      </nav>

      <div className="mt-10 max-w-3xl space-y-12">
        {lifestylesFaqTagalog.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2 className="text-foreground">{section.title}</h2>
            <Accordion type="single" collapsible className="mt-5 w-full">
              {section.items.map((item, index) => (
                <AccordionItem key={item.q} value={`${section.id}-${index}`}>
                  <AccordionTrigger className="text-left text-base font-medium">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="body-lg text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <div className="body-lg mt-14 max-w-3xl rounded-xl border border-border bg-muted/30 p-7 text-muted-foreground">
        <p className="font-semibold text-foreground">Opisyal na sanggunian</p>
        <p className="mt-2">
          Para sa kumpletong product training, Q&amp;A PDF, at global updates, bisitahin ang{" "}
          <a
            href={LIFESTYLES_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
          >
            lifestyles.net/ph-en
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
          . Ang bawat produkto sa aming{" "}
          <Link to="/products" className="font-medium text-brand hover:underline">
            shop
          </Link>{" "}
          ay may dagdag na FAQ sa Ingles at downloadable resources.
        </p>
      </div>

      <p className="mt-10 text-base text-muted-foreground">
        May tanong pa?{" "}
        <Link to="/contact" className="font-medium text-brand hover:underline">
          Makipag-ugnayan sa amin
        </Link>{" "}
        o tingnan ang{" "}
        <Link to="/fda" className="font-medium text-brand hover:underline">
          FDA registration
        </Link>
        .
      </p>
    </div>
  );
}
