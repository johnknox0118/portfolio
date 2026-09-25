import type { Metadata, Viewport } from "next";
import "./globals.css";
import ContentProtection from "@/components/ContentProtection";
import VisitorTracker from "@/components/VisitorTracker";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#07111F",
};

const siteUrl = process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_APP_URL
  : 'https://johnknox-portfolio.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Johnknox Kalle | Cybersecurity Engineer & Full Stack Architect",
  description: "Official portfolio of Johnknox Kalle. Explore interactive cybersecurity dossiers, verified security credentials, resilient infrastructure projects, and research articles.",
  keywords: [
    "Johnknox",
    "Johnknox Kalle",
    "John Knox",
    "johnknox0118",
    "Johnknox Portfolio",
    "Johnknox Cybersecurity",
    "Cybersecurity Engineer",
    "Full Stack Architect",
    "Security Systems",
    "Next.js Developer",
    "Python Developer",
    "PostgreSQL",
    "Ethical Hacking",
    "Threat Analysis"
  ],
  authors: [{ name: "Johnknox Kalle", url: siteUrl }],
  creator: "Johnknox Kalle",
  publisher: "Johnknox Kalle",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Johnknox Kalle | Cybersecurity Engineer & Full Stack Architect",
    description: "Official portfolio of Johnknox Kalle. Verified security credentials, full-stack projects, and interactive AI assistant.",
    url: siteUrl,
    siteName: "Johnknox Kalle Portfolio",
    type: "profile",
    locale: "en_US",
    images: [
      {
        url: "/profile.jpg",
        width: 1200,
        height: 630,
        alt: "Johnknox Kalle - Cybersecurity Engineer & Full Stack Architect",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Johnknox Kalle | Cybersecurity Engineer & Full Stack Architect",
    description: "Official portfolio of Johnknox Kalle. Verified credentials and full-stack projects.",
    images: ["/profile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name: "Johnknox Kalle",
      alternateName: ["Johnknox", "John Knox", "johnknox0118"],
      jobTitle: "Cybersecurity Engineer & Full Stack Architect",
      description: "Cybersecurity engineer specializing in defensive web architecture, zero-trust protocols, threat modeling, and modern scalable application security.",
      url: siteUrl,
      sameAs: [
        "https://github.com/johnknox0118",
        "https://linkedin.com",
      ],
      knowsAbout: [
        "Cybersecurity",
        "Zero-Trust Architecture",
        "Ethical Hacking",
        "Full-Stack Web Development",
        "Next.js",
        "Python",
        "PostgreSQL",
        "Cloud Security"
      ]
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "Johnknox Kalle Portfolio",
      description: "Official Cybersecurity & Engineering Portfolio of Johnknox Kalle",
      publisher: {
        "@id": `${siteUrl}/#person`
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[var(--cyber-bg,#07111F)] text-white transition-colors duration-400 min-h-screen">
        <ContentProtection />
        <VisitorTracker />
        {children}
      </body>
    </html>
  );
}
