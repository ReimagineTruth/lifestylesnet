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
    <div className="container-page py-16 md:py-20">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-3 max-w-4xl">{title}</h1>
      <p className="mt-4 text-base text-muted-foreground">Last updated: {updated}</p>

      <div className="legal-content body-lg mt-12 max-w-3xl space-y-10 text-muted-foreground">
        {children}
      </div>

      <p className="body-lg mt-14 max-w-3xl text-muted-foreground">
        Questions?{" "}
        <Link to="/contact" className="font-semibold text-brand hover:underline">
          Contact us
        </Link>{" "}
        or email{" "}
        <a href="mailto:support@lifestyles.ph" className="font-semibold text-brand hover:underline">
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
    <section id={id} className="scroll-mt-28 space-y-4">
      <h2 className="text-foreground">{title}</h2>
      <div className="space-y-4 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_a]:font-semibold [&_a]:text-brand [&_a]:hover:underline [&_li]:ml-5 [&_li]:list-disc [&_p]:text-[1.0625rem] [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </div>
    </section>
  );
}
