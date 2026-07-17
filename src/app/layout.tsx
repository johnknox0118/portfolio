import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Alex Thorne | Secure Systems Architect & Cyber Analyst",
  description: "Professional security portfolio of Alex Thorne. Explore verified certifications, malware analysis projects, and secure systems architecture briefings.",
  keywords: ["Cybersecurity", "Incident Response", "Penetration Testing", "Security Architect", "Reverse Engineering"],
  authors: [{ name: "Alex Thorne" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#07111F]">
        {children}
      </body>
    </html>
  );
}
