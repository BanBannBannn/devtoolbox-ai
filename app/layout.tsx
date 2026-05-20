import type { Metadata } from "next";
import { AdSenseScript } from "@/components/adsense-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { defaultMetadata } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...defaultMetadata,
  other: {
    ...defaultMetadata.other,
    "google-adsense-account": "ca-pub-7384886862638631",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900">
        <AdSenseScript />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
