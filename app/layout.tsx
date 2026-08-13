import type { Metadata } from "next";
import { Literata, Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-literata",
  display: "swap",
});

export const metadata: Metadata = {
  title: "DocuChat — Docs-grounded support chatbot",
  description:
    "Upload your product docs, get a grounded chatbot in-app and as an embeddable widget for your site.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${literata.variable}`}
    >
      <body className="min-h-dvh overflow-x-hidden bg-background font-sans text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
