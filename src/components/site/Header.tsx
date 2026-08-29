import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import logo from "@/assets/LS_logo.png";

const nav = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/about", label: "About" },
  { to: "/opportunity", label: "Opportunity" },
  { to: "/contact", label: "Contact" },
] as const;

const mobileNav = [...nav, { to: "/account" as const, label: "Account" }];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container-page flex h-17 items-center justify-between gap-4 md:h-19">
        <Link to="/" className="flex items-center gap-3" aria-label="Lifestyles Philippines home">
          <img
            src={logo}
            alt="Lifestyles — Live Better. Every Day."
            className="h-10 w-auto md:h-11"
          />
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
            Philippines
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-foreground" }}
              className="text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/account"
            className="hidden rounded-md px-3 py-2.5 text-[0.9375rem] font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Account
          </Link>
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-[0.9375rem] font-semibold text-brand-foreground transition-opacity hover:opacity-90"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {count > 0 && (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-semibold text-background">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="rounded-md border border-border p-2.5 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="container-page flex flex-col py-2">
            {mobileNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="py-3.5 text-base font-medium text-muted-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
