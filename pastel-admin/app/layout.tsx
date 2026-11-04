import type { Metadata, Viewport } from "next";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Pastel Admin",
  title: {
    default: "Pastel Admin",
    template: "%s | Pastel Admin",
  },
  description: "Owner dashboard for Pastel salon appointments.",
  alternates: {
    canonical: "https://pastel-salon-admin.pages.dev/",
  },
  openGraph: {
    title: "Pastel Admin",
    description: "Owner dashboard for Pastel salon appointments.",
    images: "https://pastel-salon-admin.pages.dev/og-image.png",
    url: "https://pastel-salon-admin.pages.dev/",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/admin-logo.png", type: "image/png" },
      { url: "/admin-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/admin-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/admin-icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6efe9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
