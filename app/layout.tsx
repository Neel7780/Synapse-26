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
import GlobalNavbar from "@/components/GlobalNavbar";
import PageViewTracker from "@/components/PageViewTracker";

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

// ==========================================================================
// Site Configuration
// ==========================================================================
const siteConfig = {
  name: "SYNAPSE'26",
  tagline: "DA Ka Tyohaar",
  description: "SYNAPSE'26 - The Ultimate Techno-Cultural Festival of DAIICT. Experience 3 days of electrifying performances, competitions, workshops, and pronites featuring top artists. February 26-28, 2026 at Gandhinagar, Gujarat.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in",
  ogImage: "/og-image.png",
  twitterHandle: "@synaboriii",
  locale: "en_IN",
  college: "Dhirubhai Ambani Institute of Information and Communication Technology",
  dates: "February 26th-1st March, 2026",
  location: "DAIICT, Gandhinagar, Gujarat, India",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#000000" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "dark",
};

export const metadata: Metadata = {
  // ==========================================================================
  // Basic Metadata
  // ==========================================================================
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "synapse",
    "synapse 2026",
    "synapse 26",
    "DAIICT fest",
    "DAIICT cultural fest",
    "techno-cultural fest",
    "college fest",
    "tech fest india",
    "cultural fest india",
    "gujarat college fest",
    "gandhinagar events",
    "DA Ka Tyohaar",
    "dhirubhai ambani fest",
    "daiict synapse",
    "synapse daiict",
    "college events 2026",
    "pronite",
    "live concerts",
    "hackathon",
    "coding competition",
    "dance competition",
    "music competition",
    "gaming tournament",
    "fashion show college",
  ],
  authors: [
    { name: "SYNAPSE Team", url: siteConfig.url },
    { name: "DAIICT", url: "https://daiict.ac.in" },
  ],
  creator: "SYNAPSE'26 Team",
  publisher: "DAIICT",

  // ==========================================================================
  // Icons & Manifest
  // ==========================================================================
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
  manifest: "/manifest.json",

  // ==========================================================================
  // Open Graph (Facebook, LinkedIn, etc.)
  // ==========================================================================
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} - The Ultimate Techno-Cultural Festival`,
        type: "image/png",
      },
      {
        url: `${siteConfig.url}/logo.png`,
        width: 512,
        height: 512,
        alt: `${siteConfig.name} Logo`,
        type: "image/png",
      },
    ],
  },

  // ==========================================================================
  // Twitter Card
  // ==========================================================================
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    images: [`${siteConfig.url}/og-image.png`],
  },

  // ==========================================================================
  // Robots & Indexing
  // ==========================================================================
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ==========================================================================
  // Verification (add your verification codes)
  // ==========================================================================
  verification: {
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },

  // ==========================================================================
  // App Links
  // ==========================================================================
  alternates: {
    canonical: siteConfig.url,
  },

  // ==========================================================================
  // Additional Metadata
  // ==========================================================================
  category: "events",
  classification: "College Festival",

  // App-specific metadata
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
  },

  // Other metadata
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-TileColor": "#000000",
    "msapplication-config": "/browserconfig.xml",
  },
};

// ==========================================================================
// JSON-LD Structured Data
// ==========================================================================
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${siteConfig.name} - ${siteConfig.tagline}`,
  description: siteConfig.description,
  startDate: "2026-02-26",
  endDate: "2026-02-28",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: {
    "@type": "Place",
    name: siteConfig.college,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Near Indroda Circle, Gandhinagar",
      addressLocality: "Gandhinagar",
      addressRegion: "Gujarat",
      postalCode: "382007",
      addressCountry: "IN",
    },
  },
  image: [`${siteConfig.url}/og-image.png`, `${siteConfig.url}/logo.png`],
  organizer: {
    "@type": "Organization",
    name: siteConfig.college,
    url: "https://daiict.ac.in",
  },
  performer: {
    "@type": "PerformingGroup",
    name: "Various Artists",
  },
  offers: {
    "@type": "Offer",
    availability: "https://schema.org/InStock",
    price: "0",
    priceCurrency: "INR",
    url: `${siteConfig.url}/events`,
    validFrom: "2025-12-01",
  },
  keywords: "college fest, techno-cultural, DAIICT, Gujarat, pronite, hackathon",
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

        {/* JSON-LD Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased bg-black`}
      >
        <ErrorBoundary>
          <SmoothScroller>
            <TransitionProvider>
              <GlobalNavbar />
              {children}
            </TransitionProvider>
          </SmoothScroller>
        </ErrorBoundary>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  );
}
