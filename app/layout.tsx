import type { Metadata, Viewport } from "next";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Pastel Nail Salon",
  title: {
    default: "Pastel Nail Salon",
    template: "%s | Pastel Nail Salon",
  },
  description: "Book manicure and pedicure appointments at Pastel Nail Salon.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Pastel",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
      { url: "/image.png", type: "image/png" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
      { url: "/pwa-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/pwa-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
