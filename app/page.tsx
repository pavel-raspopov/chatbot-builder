import type { ReactNode } from "react";
import { Features } from "@/components/landing/Features";
import { FinalCta } from "@/components/landing/FinalCta";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { Pricing } from "@/components/landing/Pricing";

export default function HomePage(): ReactNode {
  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  );
}
