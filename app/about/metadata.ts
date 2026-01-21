import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about SYNAPSE'26 - DAIICT's annual techno-cultural festival. Discover our history, mission, and what makes DA Ka Tyohaar the most anticipated college fest in Gujarat.",
  keywords: [
    "about synapse",
    "DAIICT fest history",
    "DA Ka Tyohaar",
    "college festival about",
    "synapse team",
    "DAIICT cultural committee",
  ],
  openGraph: {
    title: "About Us | SYNAPSE'26",
    description: "Learn about SYNAPSE'26 - DAIICT's annual techno-cultural festival.",
    url: `${BASE_URL}/about`,
    images: [
      {
        url: `${BASE_URL}/about-art.png`,
        width: 1200,
        height: 630,
        alt: "About SYNAPSE'26",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | SYNAPSE'26",
    description: "Learn about SYNAPSE'26 - DAIICT's annual techno-cultural festival.",
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};
