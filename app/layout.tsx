import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import {
  Geist,
  Geist_Mono,
  Bebas_Neue,
  Inter,
  Roboto,
  Poppins,
} from "next/font/google";
import { SmoothScroller } from "@/components/ui/SmoothScroller";
import "./globals.css";
import TransitionProvider from "@/components/TransitionProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

// Optimize font loading with display: swap for better performance
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "SYNAPSE' 26 | DA Ka Tyohaar",
  description:
    "SYNAPSE'26 - The Ultimate Tech-Cultural Festival. Register now for the most anticipated event of the year.",
  keywords: [
    "synapse",
    "cultural-tech fest",
    "college fest",
    "2026",
    "technology",
    "events",
    "gujarat",
    "DAkaTyohaar",
    "daiict-fest",
    "dhirubhai ambani college fest",
    "dhirubhai ambani institute of information and communication technology fest",
  ],
  icons: {
    icon: "/Synapse Logo.png",
    apple: "/Synapse Logo.png",
  },
  openGraph: {
    title: "SYNAPSE' 26",
    description: "The Ultimate Techno-Cultural Festival",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for Supabase */}
        <link rel="dns-prefetch" href="https://supabase.co" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased bg-black`}
      >
        <ErrorBoundary>
          <SmoothScroller>
            <TransitionProvider>
              {children}
            </TransitionProvider>
          </SmoothScroller>
        </ErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
