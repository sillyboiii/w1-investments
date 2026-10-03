import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://w1-investments.vercel.app"),
  title: {
    default: "W1 | INVESTMENTS",
    template: "%s | W1 Investments",
  },
  description:
    "W1 combines investment research, practical experience and education to give students exposure to how investment decisions are actually made.",
  openGraph: {
    title: "W1 | INVESTMENTS",
    description:
      "W1 combines investment research, practical experience and education to give students exposure to how investment decisions are actually made.",
    url: "https://w1-investments.vercel.app",
    siteName: "W1 Investments",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "W1 | INVESTMENTS",
    description:
      "W1 combines investment research, practical experience and education to give students exposure to how investment decisions are actually made.",
  },
  alternates: {
    canonical: "https://w1-investments.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8f7f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
