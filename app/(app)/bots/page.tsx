import type { ReactNode } from "react";

export default function BotsPage(): ReactNode {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
        Bots
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-secondary">
        Coming next — create and manage your chatbots here.
      </p>
    </div>
  );
}
