import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Events",
  description: "Explore all events at SYNAPSE'26 - Dance, Music, Theatre, Gaming, Fashion and more. Register now for competitions, workshops, and performances at DAIICT's biggest techno-cultural fest.",
  keywords: [
    "synapse events",
    "college competitions",
    "dance competition",
    "music competition",
    "gaming tournament",
    "theatre performance",
    "fashion show",
    "hackathon",
    "coding competition",
    "DAIICT events",
  ],
  openGraph: {
    title: "Events | SYNAPSE'26",
    description: "Explore all events at SYNAPSE'26 - Dance, Music, Theatre, Gaming, Fashion and more.",
    url: `${BASE_URL}/events`,
    images: [
      {
        url: `${BASE_URL}/images_events/dance.png`,
        width: 800,
        height: 600,
        alt: "SYNAPSE'26 Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Events | SYNAPSE'26",
    description: "Explore all events at SYNAPSE'26 - Dance, Music, Theatre, Gaming, Fashion and more.",
  },
  alternates: {
    canonical: `${BASE_URL}/events`,
  },
};
