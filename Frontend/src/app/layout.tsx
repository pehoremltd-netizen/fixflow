import type { Metadata } from "next";
import "./globals.css";
import SWRegister from "@/components/SWRegister";
import { ThemeProvider } from "@/lib/theme-provider";
import { BRAND, getDocumentTitle } from "@/lib/brand";

export const metadata: Metadata = {
  title: getDocumentTitle(),
  description: BRAND.description,
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
    title: getDocumentTitle(),
    description: BRAND.ogDescription,
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: BRAND.appName,
  },
  other: {
    "theme-color": "#D4AF37",
  },
  icons: [
    { rel: "icon", url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { rel: "icon", url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icon-192.png" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground">
        <ThemeProvider>
          {children}
          <SWRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
