import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPageLayout({ eyebrow, title, updated, children }: Props) {
  return (
    <div className="container-page py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>

      <div className="legal-content mt-10 max-w-3xl space-y-8 text-muted-foreground">
        {children}
      </div>

      <p className="mt-12 max-w-3xl text-sm text-muted-foreground">
        Questions?{" "}
        <Link to="/contact" className="font-medium text-brand hover:underline">
          Contact us
        </Link>{" "}
        or email{" "}
        <a href="mailto:support@lifestyles.ph" className="font-medium text-brand hover:underline">
          support@lifestyles.ph
        </a>
        .
      </p>
    </div>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="space-y-3 [&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-foreground [&_a]:font-medium [&_a]:text-brand [&_a]:hover:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
