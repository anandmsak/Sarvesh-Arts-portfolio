import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-gold/30 bg-[color-mix(in_oklab,var(--ivory)_92%,var(--gold))]">
      <div className="mx-auto max-w-5xl px-6 py-20 text-center">
        {eyebrow && (
          <p className="font-serif text-xs uppercase tracking-[0.5em] text-gold">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-4 font-display text-4xl text-primary sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <div className="gold-divider mx-auto mt-6 max-w-xs" aria-hidden>
          ✦
        </div>
        {subtitle && (
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg italic text-foreground/75">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

export function Placeholder({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="ornate-border rounded-lg bg-card px-8 py-20 text-center">
        <p className="font-serif text-xs uppercase tracking-[0.4em] text-gold">
          Placeholder
        </p>
        <p className="mt-4 font-display text-2xl text-primary">{label}</p>
        <p className="mx-auto mt-3 max-w-md font-serif text-sm text-muted-foreground">
          Content for this section will be added soon. This block is a placeholder
          within the page layout.
        </p>
      </div>
    </div>
  );
}
