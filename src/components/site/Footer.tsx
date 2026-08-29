import { Link } from "@tanstack/react-router";
import { Facebook, Youtube } from "lucide-react";
import logoAsset from "@/assets/LS_logo.png.asset.json";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/40">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div>
          <img src={logoAsset.url} alt="Lifestyles — Live Better. Every Day." className="h-10 w-auto" />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Live Better. Every Day. Botanical wellness products distributed in the Philippines since
            1989.
          </p>
          <div className="mt-4 flex gap-3">
            <a
              href="https://www.facebook.com"
              aria-label="Facebook"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://www.youtube.com"
              aria-label="YouTube"
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
            >
              <Youtube className="h-4 w-4" />
            </a>
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
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            { to: "/about", label: "About Lifestyles" },
            { to: "/opportunity", label: "Licensee opportunity" },
            { to: "/contact", label: "Contact us" },
          ]}
        />
        <div>
          <h4 className="text-sm font-semibold">Philippines office</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            Lifestyles Philippines
            <br />
            Makati City, Metro Manila
            <br />
            support@lifestyles.ph
            <br />
            (02) 8888 0000
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Lifestyles Philippines. All rights reserved.</p>
          <p>No approved therapeutic claims. Products vary by market.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { to: string; label: string }[];
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              to={l.to}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
