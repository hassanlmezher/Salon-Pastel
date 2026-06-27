import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Pastel Admin",
  title: {
    default: "Pastel Admin",
    template: "%s | Pastel Admin",
  },
  description: "Owner dashboard for Pastel salon appointments.",
  robots: {
    index: false,
    follow: false,
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
      <body>{children}</body>
    </html>
  );
}
