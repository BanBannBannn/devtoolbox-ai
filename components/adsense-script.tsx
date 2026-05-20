import Script from "next/script";

const adsenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

export function AdSenseScript() {
  if (!adsenseEnabled || !adsenseClient) {
    return null;
  }

  return (
    <Script
      id="google-adsense-auto-ads"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}
