import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "Terms of Service for shopping Lifestyles Philippines — orders, payments, delivery, and product use.",
      },
      { property: "og:title", content: "Terms of Service | Lifestyles Philippines" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Terms of Service" updated="29 August 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your use of the Lifestyles Philippines
        website and your purchase of products through our online store (collectively, the
        &quot;Service&quot;). By accessing the site or placing an order, you agree to these Terms.
      </p>

      <LegalSection id="about" title="1. About us">
        <p>
          The Service is operated by Lifestyles Philippines (&quot;we&quot;, &quot;us&quot;, or
          &quot;our&quot;), an independent distributor of Lifestyles Global Network wellness
          products in the Philippines. Our registered office is in Makati City, Metro Manila. You
          may reach us at <a href="mailto:support@lifestyles.ph">support@lifestyles.ph</a>.
        </p>
      </LegalSection>

      <LegalSection id="products" title="2. Products and health disclaimers">
        <p>
          Lifestyles products sold on this site are dietary supplements and wellness products, not
          medicines. Product descriptions, benefits, and FAQs are for general information only.
        </p>
        <ul>
          <li>
            Our products are{" "}
            <strong>not intended to diagnose, treat, cure, or prevent any disease</strong>.
          </li>
          <li>
            No approved therapeutic claims are made for products sold in the Philippines through
            this site.
          </li>
          <li>
            Individual results vary. Consult a qualified healthcare professional before use if you
            are pregnant, nursing, taking medication, or have a medical condition.
          </li>
          <li>
            Do not use any product if you are allergic to an ingredient listed on the label or
            product page.
          </li>
        </ul>
        <p>
          Product images, packaging, and formulations may change without notice. We strive to keep
          catalogue information accurate but do not warrant that descriptions are error-free.
        </p>
      </LegalSection>

      <LegalSection id="orders" title="3. Orders and pricing">
        <p>
          When you place an order, you offer to purchase the selected items at the prices shown,
          including applicable shipping. We may accept or decline an order at our discretion (for
          example, due to stock limits, pricing errors, or suspected fraud).
        </p>
        <ul>
          <li>All prices are in Philippine Pesos (PHP) unless stated otherwise.</li>
          <li>
            Free shipping applies to qualifying orders as displayed at checkout (currently orders
            over ₱3,000 nationwide, subject to change).
          </li>
          <li>
            An order confirmation email does not guarantee acceptance until we confirm shipment or
            payment, as applicable.
          </li>
          <li>
            Order reference numbers begin with &quot;LS-&quot; and can be tracked on your account or
            order page.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="payment" title="4. Payment">
        <p>We accept the payment methods shown at checkout, which may include:</p>
        <ul>
          <li>Cash on delivery (COD)</li>
          <li>QR Ph and e-wallets via PayMongo</li>
          <li>Online banking via PayMongo</li>
          <li>PayPal (wallet, debit/credit card, and other PayPal-enabled methods)</li>
        </ul>
        <p>
          Online payments are processed by third-party providers (PayMongo, PayPal). We do not store
          full card numbers on our servers. By paying online, you also agree to the applicable terms
          of the payment provider. Orders paid online remain <strong>pending</strong> until payment
          is confirmed; QR Ph and redirect methods must be completed within the time limit shown at
          checkout (typically about 30 minutes for QR codes).
        </p>
        <p>
          If payment fails or expires, your order may remain pending or be cancelled. Contact
          support if you were charged but your order status did not update.
        </p>
      </LegalSection>

      <LegalSection id="shipping" title="5. Shipping and delivery">
        <p>
          We deliver within the Philippines to the address you provide at checkout. You are
          responsible for accurate delivery details (name, phone, street, city, province, postal
          code).
        </p>
        <ul>
          <li>Delivery times are estimates and not guaranteed.</li>
          <li>
            For COD orders, payment is collected upon delivery. Refusal to accept a delivered order
            may result in cancellation and restricted future service.
          </li>
          <li>
            Risk of loss passes to you upon delivery to the address provided or to your authorized
            recipient.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="returns" title="6. Returns, refunds, and cancellations">
        <p>
          Because we sell sealed consumable wellness products, returns are limited for safety and
          quality reasons.
        </p>
        <ul>
          <li>
            <strong>Damaged or wrong items:</strong> Contact us within 7 days of delivery with your
            order number and photos. We will arrange replacement or refund where appropriate.
          </li>
          <li>
            <strong>Change of mind:</strong> Unopened products in resaleable condition may be
            considered for return within 7 days; shipping costs are non-refundable unless we made an
            error.
          </li>
          <li>
            <strong>Opened or used products</strong> generally cannot be returned except where
            required by law or where defective.
          </li>
          <li>
            Refunds for online payments are processed back to the original payment method where
            possible and may take several business days depending on your bank or wallet provider.
          </li>
        </ul>
        <p>
          To request help with an order, email{" "}
          <a href="mailto:support@lifestyles.ph">support@lifestyles.ph</a> with your order ID.
        </p>
      </LegalSection>

      <LegalSection id="account" title="7. Account and communications">
        <p>
          You may track orders using your email address on the account page. You agree to provide
          accurate contact information and to keep your email accessible for order updates.
        </p>
        <p>
          We may send transactional messages (order confirmations, shipping updates, payment
          reminders). Marketing messages, if any, will include an opt-out where required by law.
        </p>
      </LegalSection>

      <LegalSection id="conduct" title="8. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>
            Use the site for unlawful purposes or to submit false orders or payment information
          </li>
          <li>Attempt to interfere with site security, payment systems, or other users</li>
          <li>Scrape, copy, or republish site content without permission</li>
          <li>Resell products in violation of applicable distributor or brand policies</li>
        </ul>
      </LegalSection>

      <LegalSection id="ip" title="9. Intellectual property">
        <p>
          Lifestyles®, product names, logos, images, and site content are owned by Lifestyles Global
          Network or their respective owners and used under license. You may not use our trademarks
          without written permission.
        </p>
      </LegalSection>

      <LegalSection id="liability" title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by Philippine law, we are not liable for indirect,
          incidental, or consequential damages arising from your use of the Service or products. Our
          total liability for any claim relating to an order is limited to the amount you paid for
          that order.
        </p>
        <p>
          Nothing in these Terms excludes liability that cannot be excluded under applicable law
          (including the Philippine Consumer Act where applicable).
        </p>
      </LegalSection>

      <LegalSection id="law" title="11. Governing law">
        <p>
          These Terms are governed by the laws of the Republic of the Philippines. Disputes shall be
          subject to the exclusive jurisdiction of the courts of Metro Manila, without prejudice to
          your rights under mandatory consumer protection laws.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="12. Changes">
        <p>
          We may update these Terms from time to time. The &quot;Last updated&quot; date at the top
          will change when we do. Continued use of the Service after changes constitutes acceptance
          of the revised Terms.
        </p>
      </LegalSection>

      <p className="text-sm">
        See also our{" "}
        <Link to="/privacy" className="font-medium text-brand hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
