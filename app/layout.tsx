import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastel Nail and Beauty Lounge",
  description: "Luxury nail, beauty, laser, waxing, and massage appointments at Pastel.",
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
