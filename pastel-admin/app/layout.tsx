import type { Metadata, Viewport } from "next";
import { AdminNavigationLoader } from "./components/AdminNavigationLoader";
import { PwaInstallPrompt } from "./components/PwaInstallPrompt";
import "./globals.css";
import "./booking.css";

export const metadata: Metadata = {
  applicationName: "Pastel Admin",
  title: {
    default: "Pastel Admin",
    template: "%s | Pastel Admin",
  },
  description: "Owner dashboard for Pastel salon appointments.",
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
        <AdminNavigationLoader />
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
