import { Link, createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";

const FDA_ADVISORY_PDF =
  "https://www.fda.gov.ph/wp-content/uploads/2025/04/FDA-Advisory-No.2025-0473.pdf";
const FDA_VERIFY_URL = "https://verification.fda.gov.ph";

export const Route = createFileRoute("/fda")({
  head: () => ({
    meta: [
      { title: "FDA Registration & Advisory | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "How to verify Lifestyles product registration with the Philippine FDA, and official advisory information for Nutria Plus.",
      },
      { property: "og:title", content: "FDA Registration & Advisory | Lifestyles Philippines" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: FdaPage,
});

function FdaPage() {
  return (
    <LegalPageLayout eyebrow="Regulatory" title="FDA Registration & Advisory" updated="29 August 2026">
      <p>
        Lifestyles Philippines distributes wellness products in compliance with Philippine food and
        drug regulations. This page explains how FDA registration works, how you can verify products
        before purchase, and links to an official FDA public health advisory regarding Nutria Plus.
      </p>

      <LegalSection id="overview" title="1. FDA Philippines and dietary supplements">
        <p>
          The{" "}
          <a href="https://www.fda.gov.ph" target="_blank" rel="noopener noreferrer">
            Food and Drug Administration (FDA) of the Philippines
          </a>{" "}
          regulates food products, including dietary supplements, under Republic Act No. 9711 (Food
          and Drug Administration Act of 2009).
        </p>
        <p>
          Food supplements sold in the Philippines must have a valid{" "}
          <strong>Certificate of Product Registration (CPR)</strong>. Manufacture, importation,
          distribution, or sale without proper FDA authorization is prohibited.
        </p>
        <p>
          Dietary supplements are <strong>not medicines</strong>. They are not intended to diagnose,
          treat, cure, or prevent disease, and no approved therapeutic claims are made for products
          sold through this website.
        </p>
      </LegalSection>

      <LegalSection id="verify" title="2. How to verify product registration">
        <p>Before buying any supplement — including Lifestyles products — you can confirm registration:</p>
        <ul>
          <li>
            Use the official{" "}
            <a href={FDA_VERIFY_URL} target="_blank" rel="noopener noreferrer">
              FDA Verification Portal
            </a>{" "}
            at verification.fda.gov.ph and search by product name.
          </li>
          <li>Check the product label for an FDA registration number, when printed on authentic packaging.</li>
          <li>
            Purchase only from{" "}
            <Link to="/products" className="font-medium text-brand hover:underline">
              authorized Lifestyles Philippines channels
            </Link>{" "}
            such as this official store or verified distributors.
          </li>
        </ul>
        <p>
          If a product cannot be verified on the FDA portal, do not purchase or consume it. Report
          suspected unregistered products to{" "}
          <a href="mailto:ereport@fda.gov.ph">ereport@fda.gov.ph</a>.
        </p>
      </LegalSection>

      <LegalSection id="nutria-advisory" title="3. FDA Advisory No. 2025-0473 — Nutria Plus">
        <p>
          On <strong>10 April 2025</strong>, the FDA Philippines issued{" "}
          <strong>Advisory No. 2025-0473</strong>, a public health warning regarding the purchase
          and consumption of an <strong>unregistered</strong> food product labelled &quot;Lifestyles
          Nutria Plus Dietary Supplement.&quot;
        </p>
        <p>
          The advisory states that FDA post-marketing surveillance found this product{" "}
          <strong>is not registered</strong> and no corresponding Certificate of Product
          Registration has been issued. Because it has not completed FDA evaluation, the agency
          cannot assure its quality and safety.
        </p>
        <p>
          <a
            href={FDA_ADVISORY_PDF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-brand hover:underline"
          >
            Read the full FDA advisory (PDF)
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </p>
        <p>
          <strong>What this means for customers:</strong> Counterfeit or illegally imported Nutria
          Plus may be sold outside authorized channels. When you shop on lifestyles.ph, you receive
          authentic Lifestyles Global Network products supplied through our authorized Philippine
          distributor. Always verify packaging, labels, and FDA registration before use.
        </p>
      </LegalSection>

      <LegalSection id="our-products" title="4. Products sold on this website">
        <p>
          Products available through Lifestyles Philippines — including{" "}
          <Link
            to="/products/$slug"
            params={{ slug: "intra" }}
            className="font-medium text-brand hover:underline"
          >
            Intra
          </Link>
          ,{" "}
          <Link
            to="/products/$slug"
            params={{ slug: "nutria-plus" }}
            className="font-medium text-brand hover:underline"
          >
            Nutria Plus
          </Link>
          ,{" "}
          <Link
            to="/products/$slug"
            params={{ slug: "cardiolife" }}
            className="font-medium text-brand hover:underline"
          >
            CardioLife
          </Link>
          , and{" "}
          <Link
            to="/products/$slug"
            params={{ slug: "fibrelife" }}
            className="font-medium text-brand hover:underline"
          >
            FibreLife
          </Link>{" "}
          — are sourced from Lifestyles Global Network and distributed in accordance with applicable
          Philippine regulations.
        </p>
        <p>
          For questions about a specific product&apos;s registration status or batch label, contact{" "}
          <a href="mailto:support@lifestyles.ph">support@lifestyles.ph</a> before placing an order.
        </p>
      </LegalSection>

      <LegalSection id="contact-fda" title="5. FDA contact information">
        <p>
          For regulatory inquiries about food products, contact the FDA Center for Food Regulation
          and Research:
        </p>
        <ul>
          <li>
            Email:{" "}
            <a href="mailto:cfrr@fda.gov.ph">cfrr@fda.gov.ph</a> (include the advisory number in
            the subject line)
          </li>
          <li>Phone: (02) 857-1900 local 8105 and 8112</li>
          <li>
            Report unregistered products:{" "}
            <a href="mailto:ereport@fda.gov.ph">ereport@fda.gov.ph</a>
          </li>
        </ul>
      </LegalSection>

      <p className="text-sm">
        See also our{" "}
        <Link to="/terms" className="font-medium text-brand hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="font-medium text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
