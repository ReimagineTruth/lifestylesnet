import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import logo from "@/assets/LS_logo.png";
import { LIFESTYLES_GLOBAL_PRIVACY_PDF } from "@/lib/legal-urls";

const SOCIAL_LINKS = [
  {
    href: "https://www.facebook.com/profile.php?id=61594038476910",
    label: "Facebook",
    icon: Facebook,
  },
  {
    href: "https://www.instagram.com/lifestylesph_app/",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://x.com/LifestyIesPH",
    label: "X",
    icon: Twitter,
  },
  {
    href: "https://www.youtube.com/user/LifestylesLGN",
    label: "YouTube",
    icon: Youtube,
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-16 md:grid-cols-4 md:py-20">
        <div>
          <img src={logo} alt="Lifestyles — Live Better. Every Day." className="h-11 w-auto" />
          <p className="mt-4 max-w-xs text-base leading-relaxed text-muted-foreground">
            Live Better. Every Day. Botanical wellness products distributed in the Philippines since
            1989.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Shop"
          links={[
            { to: "/products", label: "All products" },
            { to: "/products/intra", label: "Intra" },
            { to: "/products/nutria-plus", label: "Nutria Plus" },
            { to: "/products/cardiolife", label: "CardioLife" },
            { to: "/products/fibrelife", label: "FibreLife" },
            { to: "/products/better-together-pack", label: "Better Together Pack" },
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About Lifestyles" },
            { to: "/opportunity", label: "Licensee opportunity" },
            { to: "/contact", label: "Contact us" },
            { to: "/faq", label: "FAQ" },
            { to: "/fda", label: "FDA registration" },
            { to: "/terms", label: "Terms of Service" },
            { to: "/privacy", label: "Privacy Policy" },
            { href: LIFESTYLES_GLOBAL_PRIVACY_PDF, label: "Global privacy" },
          ]}
        />
        <div>
          <h4 className="font-semibold">Philippines office</h4>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Lifestyles Philippines
            <br />
            Makati City, Metro Manila
            <br />
            support@lifestyles.ph
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lifestyles Philippines. All rights reserved.</p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <span aria-hidden="true">·</span>
            <a
              href={LIFESTYLES_GLOBAL_PRIVACY_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Global privacy
            </a>
            <span aria-hidden="true">·</span>
            <Link to="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/fda" className="hover:text-foreground">
              FDA
            </Link>
            <span aria-hidden="true">·</span>
            <span>We&apos;re happy to help — reach out anytime with your questions.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

type InternalFooterLink = { to: string; label: string };
type ExternalFooterLink = { href: string; label: string };
type FooterLink = InternalFooterLink | ExternalFooterLink;

function isExternalFooterLink(link: FooterLink): link is ExternalFooterLink {
  return "href" in link;
}

function FooterCol({ title, links }: { title: string; links: FooterLink[] }) {
  return (
    <div>
      <h4 className="font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.label}>
            {isExternalFooterLink(l) ? (
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ) : (
              <Link
                to={l.to}
                className="text-base text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
