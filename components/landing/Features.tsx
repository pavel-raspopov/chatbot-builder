import type { ReactNode } from "react";

type FeatureBlock = {
  id: string;
  title: string;
  body: string;
};

const features: FeatureBlock[] = [
  {
    id: "upload",
    title: "Upload the knowledge you already have",
    body: "Drop product PDFs, help articles, and Markdown exports. DocuChat stores them for your bot and prepares them for grounded answers — no site crawl required for the MVP.",
  },
  {
    id: "chat",
    title: "ChatGPT-like chat that stays on your docs",
    body: "Test answers in the app before anything goes live. When retrieval is empty, DocuChat prefers “I don’t know from your docs” over inventing steps.",
  },
  {
    id: "embed",
    title: "Embed the same bot on your website",
    body: "Copy a script snippet onto your marketing or docs site. Visitors get the same retrieval path as in-app chat — one brain, two surfaces.",
  },
];

export function Features(): ReactNode {
  return (
    <section id="features" className="border-t border-border bg-background">
      <div className="mx-auto max-w-[1120px] px-6 py-20 sm:py-24">
        <h2 className="max-w-xl font-display text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          From docs to answers without building RAG yourself
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">
          Built for SaaS and product teams who already have the answers in
          files — and need them where customers ask.
        </p>

        <div className="mt-16 flex flex-col gap-16 sm:gap-20">
          {features.map((feature) => (
            <article key={feature.id} className="max-w-2xl">
              <h3 className="text-xl font-semibold text-text-primary sm:text-2xl">
                {feature.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-text-secondary">
                {feature.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
