import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FixFlow - Enterprise CMMS Platform | Facility Management Software",
  description:
    "FixFlow is a modern, enterprise-grade CMMS SaaS platform for facility management companies, property managers, and maintenance teams. Multi-tenant, role-based, mobile-first.",
  keywords: [
    "CMMS",
    "Facility Management",
    "Maintenance Software",
    "Work Order Management",
    "Preventive Maintenance",
    "Asset Management",
    "Property Management",
  ],
  openGraph: {
    title: "FixFlow - Enterprise CMMS Platform",
    description:
      "Next-generation facility management and maintenance platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
