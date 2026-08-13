import type { ReactNode } from "react";
import { WidgetPanel } from "@/components/widget/WidgetPanel";
import { createClient } from "@/lib/supabase/server";
import { getBotWidgetConfig } from "@/lib/widget/getBotConfig";

type EmbedPageProps = {
  params: Promise<{ publicId: string }>;
};

export default async function WidgetEmbedPage({
  params,
}: EmbedPageProps): Promise<ReactNode> {
  const { publicId } = await params;
  const supabase = await createClient();
  const config = await getBotWidgetConfig(supabase, publicId);

  if (!config) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-surface px-6">
        <h1 className="font-display text-xl font-semibold tracking-tight text-text-primary">
          Bot not found
        </h1>
        <p className="mt-3 text-center text-sm leading-relaxed text-text-secondary">
          This embed link is not valid. Check the snippet on your bot page.
        </p>
      </div>
    );
  }

  return (
    <WidgetPanel
      botName={config.name}
      welcomeMessage={config.welcome_message}
      showBranding={!config.remove_branding}
    />
  );
}
