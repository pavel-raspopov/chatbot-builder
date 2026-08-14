import Script from "next/script";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { getBotWidgetConfig } from "@/lib/widget/getBotConfig";

type PreviewPageProps = {
  params: Promise<{ publicId: string }>;
};

export default async function WidgetPreviewPage({
  params,
}: PreviewPageProps): Promise<ReactNode> {
  const { publicId } = await params;
  const supabase = await createClient();
  const config = await getBotWidgetConfig(supabase, publicId);

  if (!config) {
    return (
      <div className="mx-auto max-w-[720px] px-6 py-16">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text-primary">
          Bot not found
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          This preview link is not valid. Open your bot in DocuChat and copy
          the embed snippet again.
        </p>
      </div>
    );
  }

  const scriptSrc = "/widget.js";

  return (
    <div className="min-h-dvh bg-background">
      <p className="border-b border-border bg-accent-muted px-6 py-3 text-center text-sm text-text-secondary">
        This is a DocuChat preview of your embed. Visitors on your site will
        see the widget in the corner.
      </p>
      <article className="mx-auto max-w-[720px] px-6 py-16">
        <p className="text-sm font-medium text-text-muted">Sample docs site</p>
        <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-text-primary">
          {config.name}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-text-secondary">
          This page stands in for a help center or product site. Use the chat
          button in the corner to ask from this bot’s docs — the same replies
          visitors get on your site.
        </p>
        <p className="mt-6 text-base leading-relaxed text-text-secondary">
          Paste the same script on your website when you are ready to go live.
        </p>
      </article>
      <Script src={scriptSrc} strategy="afterInteractive" data-bot={config.public_id} />
    </div>
  );
}
