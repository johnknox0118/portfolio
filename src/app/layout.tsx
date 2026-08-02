import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Johnknox Kalle | Cybersecurity Engineer & Full Stack Architect",
  description: "Flagship cybersecurity and software engineering portfolio of Johnknox Kalle. Explore interactive dossiers, verified certifications, full-stack projects, and security research.",
  keywords: ["Cybersecurity Engineer", "Full Stack Architect", "Security Systems", "Next.js", "PostgreSQL", "Python", "Ethical Hacking"],
  authors: [{ name: "Johnknox Kalle" }],
  openGraph: {
    title: "Johnknox Kalle | Cybersecurity Engineer Portfolio",
    description: "Interactive cyber-themed portfolio featuring verified credentials, engineering logs, and interactive AI assistant.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Johnknox Kalle | Cybersecurity Engineer Portfolio",
    description: "Interactive cyber-themed portfolio featuring verified credentials, engineering logs, and interactive AI assistant.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Johnknox Kalle",
  jobTitle: "Cybersecurity Engineer & Full Stack Architect",
  knowsAbout: ["Cybersecurity", "Next.js", "Python", "PostgreSQL", "Threat Analysis", "Cloud Security"],
  sameAs: [
    "https://github.com/johnknox0118",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased bg-[#07111F]">
        {children}
      </body>
    </html>
  );
}
