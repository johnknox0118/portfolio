"use client";

import Script from "next/script";

interface GoogleAnalyticsProps {
  trackingId?: string;
}

export default function GoogleAnalytics({ trackingId }: GoogleAnalyticsProps) {
  if (!trackingId) return null;
  const cleanId = trackingId.trim();

  // Validate format and ensure it's not the default placeholder
  const isPlaceholder = cleanId === "G-XXXXXXXXXX" || cleanId.toUpperCase().includes("XXXX");
  const isValidFormat = /^(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+)$/i.test(cleanId);

  if (isPlaceholder || !isValidFormat) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${cleanId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${cleanId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
