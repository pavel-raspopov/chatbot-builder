import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { HeroChatMock } from "@/components/landing/HeroChatMock";

type HeroProps = {
  isAuthenticated?: boolean;
};

export function Hero({ isAuthenticated = false }: HeroProps): ReactNode {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-accent-light),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[linear-gradient(180deg,transparent_0%,var(--color-background)_85%),repeating-linear-gradient(0deg,transparent,transparent_23px,var(--color-border-muted)_24px)]"
      />

      <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-[1120px] flex-col justify-center gap-12 px-6 pb-16 pt-14 lg:gap-16 lg:pb-20 lg:pt-16">
        <div className="max-w-2xl animate-fade-up">
          <p className="font-display text-3xl font-semibold tracking-tight text-accent sm:text-4xl">
            DocuChat
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,3.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-text-primary">
            Support answers from your docs — in-app and on your site
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-text-secondary">
            Upload PDFs and Markdown, try a grounded chatbot inside DocuChat,
            then paste one snippet so the same answers show up for your users.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              href={isAuthenticated ? "/dashboard" : "/signup"}
              variant="primary"
            >
              {isAuthenticated ? "Go to dashboard" : "Start free"}
            </Button>
            <Button href="#pricing" variant="secondary">
              See pricing
            </Button>
          </div>
        </div>

        <div className="w-full animate-fade-up-delay">
          <HeroChatMock />
        </div>
      </div>
    </section>
  );
}
