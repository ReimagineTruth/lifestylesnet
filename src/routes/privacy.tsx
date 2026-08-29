import { Link, createFileRoute } from "@tanstack/react-router";
import { LegalPageLayout, LegalSection } from "@/components/site/LegalPageLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Lifestyles Philippines" },
      {
        name: "description",
        content:
          "How Lifestyles Philippines collects, uses, and protects your personal information when you shop on our website.",
      },
      { property: "og:title", content: "Privacy Policy | Lifestyles Philippines" },
      { name: "robots", content: "index, follow" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPageLayout eyebrow="Legal" title="Privacy Policy" updated="29 August 2026">
      <p>
        Lifestyles Philippines (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) respects your
        privacy. This Privacy Policy explains how we collect, use, store, and share personal
        information when you visit our website, place an order, or contact us. We process personal
        data in accordance with the{" "}
        <strong>Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and its implementing
        rules.
      </p>

      <LegalSection id="controller" title="1. Who is responsible">
        <p>
          <strong>Personal information controller:</strong> Lifestyles Philippines
          <br />
          Makati City, Metro Manila, Philippines
          <br />
          Email: <a href="mailto:support@lifestyles.ph">support@lifestyles.ph</a>
          <br />
          Phone: (02) 8888 0000
        </p>
        <p>
          For privacy-related requests, contact us at the email above with the subject line
          &quot;Privacy request&quot;.
        </p>
      </LegalSection>

      <LegalSection id="collect" title="2. Information we collect">
        <p>We may collect the following categories of information:</p>
        <h3>Information you provide</h3>
        <ul>
          <li>
            <strong>Order and delivery details:</strong> name, email, phone number, shipping address
            (street, city, province, postal code), and optional order notes
          </li>
          <li>
            <strong>Support and feedback:</strong> messages you send via contact forms or the
            feedback widget, including your name and email if provided
          </li>
          <li>
            <strong>Admin access:</strong> credentials used by authorized staff to manage orders
            (stored securely; not used for marketing)
          </li>
        </ul>
        <h3>Information collected automatically</h3>
        <ul>
          <li>
            <strong>Device and usage data:</strong> IP address, browser type, pages visited, and
            approximate location derived from IP
          </li>
          <li>
            <strong>Cookies and local storage:</strong> cart contents, saved email for faster
            checkout, session preferences, and similar technical data needed for the site to
            function
          </li>
        </ul>
        <h3>Payment information</h3>
        <p>
          Online payments are handled by <strong>PayMongo</strong> and <strong>PayPal</strong>. We
          receive confirmation of payment status and transaction references (for example, payment
          intent IDs or PayPal order IDs) but do <strong>not</strong> store full credit or debit
          card numbers on our servers.
        </p>
      </LegalSection>

      <LegalSection id="use" title="3. How we use your information">
        <p>We use personal information to:</p>
        <ul>
          <li>Process and fulfill orders, including delivery and payment confirmation</li>
          <li>Send order confirmations, shipping updates, and customer support replies</li>
          <li>Prevent fraud, abuse, and security incidents</li>
          <li>Improve our website, catalogue, and checkout experience</li>
          <li>Comply with legal, tax, and regulatory obligations</li>
          <li>Respond to feedback and resolve disputes</li>
        </ul>
        <p>
          We do not sell your personal information. We do not use your data for automated decisions
          that produce legal or similarly significant effects without human review.
        </p>
      </LegalSection>

      <LegalSection id="legal-basis" title="4. Legal basis for processing">
        <p>Under the Data Privacy Act, we rely on one or more of the following:</p>
        <ul>
          <li>
            <strong>Contract:</strong> processing necessary to complete your purchase and deliver
            products
          </li>
          <li>
            <strong>Consent:</strong> where you voluntarily submit feedback or opt in to optional
            communications
          </li>
          <li>
            <strong>Legitimate interests:</strong> site security, fraud prevention, and service
            improvement, balanced against your privacy rights
          </li>
          <li>
            <strong>Legal obligation:</strong> record-keeping and responses to lawful requests
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="share" title="5. When we share information">
        <p>We may share personal information with:</p>
        <ul>
          <li>
            <strong>Payment processors</strong> (PayMongo, PayPal) to authorize and settle payments
          </li>
          <li>
            <strong>Courier and logistics partners</strong> to deliver orders to your address
          </li>
          <li>
            <strong>Hosting and infrastructure providers</strong> that operate our website and
            database on our behalf
          </li>
          <li>
            <strong>Professional advisers</strong> (lawyers, accountants) when required
          </li>
          <li>
            <strong>Authorities</strong> when required by law, court order, or to protect rights and
            safety
          </li>
        </ul>
        <p>
          Service providers are permitted to use your data only to perform services for us and must
          protect it appropriately.
        </p>
      </LegalSection>

      <LegalSection id="retention" title="6. Data retention">
        <p>
          We keep order and customer records for as long as needed to fulfill orders, handle
          warranties and returns, resolve disputes, and meet legal requirements (typically at least
          several years for accounting and tax purposes). Cart and session data in your browser may
          be cleared when you clear site storage or when items expire.
        </p>
        <p>
          Feedback messages are retained to provide support history unless you request deletion and
          we no longer need them for legal or operational reasons.
        </p>
      </LegalSection>

      <LegalSection id="security" title="7. Security">
        <p>
          We use reasonable technical and organizational measures to protect personal information,
          including encrypted connections (HTTPS), access controls on admin functions, and secure
          handling of payment credentials by our payment partners. No method of transmission over
          the internet is 100% secure; we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection id="rights" title="8. Your rights">
        <p>Under the Data Privacy Act, you may have the right to:</p>
        <ul>
          <li>Be informed that personal data is being processed</li>
          <li>Access a copy of personal data we hold about you</li>
          <li>Object to processing in certain circumstances</li>
          <li>Correct inaccurate or incomplete data</li>
          <li>Erasure or blocking of data where applicable</li>
          <li>Data portability, where technically feasible</li>
          <li>File a complaint with the National Privacy Commission (NPC)</li>
        </ul>
        <p>
          To exercise these rights, email{" "}
          <a href="mailto:support@lifestyles.ph">support@lifestyles.ph</a>. We may need to verify
          your identity before responding. We will reply within a reasonable time as required by
          law.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="9. Cookies and local storage">
        <p>Our site uses essential cookies and browser storage to:</p>
        <ul>
          <li>Remember items in your shopping cart</li>
          <li>Remember your email on checkout for convenience</li>
          <li>Maintain admin sessions for authorized users</li>
          <li>
            Store QR payment session data during checkout (session storage, cleared after payment)
          </li>
        </ul>
        <p>
          You can control cookies through your browser settings. Disabling essential storage may
          prevent checkout or cart features from working correctly.
        </p>
      </LegalSection>

      <LegalSection id="children" title="10. Children">
        <p>
          Our site is not directed at children under 18. We do not knowingly collect personal
          information from minors. If you believe a child has provided us data, contact us so we can
          delete it.
        </p>
      </LegalSection>

      <LegalSection id="international" title="11. International transfers">
        <p>
          Payment providers such as PayPal may process data in countries outside the Philippines.
          Where data is transferred internationally, we rely on appropriate safeguards offered by
          those providers and applicable law.
        </p>
      </LegalSection>

      <LegalSection id="links" title="12. Third-party links">
        <p>
          Our site may link to external pages (social media, product PDFs, payment redirects). We
          are not responsible for the privacy practices of those sites. Review their policies before
          providing personal information.
        </p>
      </LegalSection>

      <LegalSection id="changes" title="13. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date
          will reflect the latest version. Material changes may be communicated on the site or by
          email where appropriate.
        </p>
      </LegalSection>

      <p className="text-sm">
        See also our{" "}
        <Link to="/terms" className="font-medium text-brand hover:underline">
          Terms of Service
        </Link>
        .
      </p>
    </LegalPageLayout>
  );
}
