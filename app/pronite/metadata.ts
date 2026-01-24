import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Pronite",
  description: "Experience electrifying pronite performances at SYNAPSE'26. Live concerts featuring top artists including Aditya Gadhvi, Mohit Chauhan, DJ Sartek, Nikhil D'Souza and more. February 26-28, 2026 at DAIICT.",
  keywords: [
    "synapse pronite",
    "college concert",
    "live performance",
    "Aditya Gadhvi",
    "Mohit Chauhan",
    "DJ Sartek",
    "Nikhil D'Souza",
    "DAIICT concert",
    "night concert",
    "gujarati music",
    "bollywood concert",
  ],
  openGraph: {
    title: "Pronite | SYNAPSE'26",
    description: "Experience electrifying pronite performances featuring top artists at SYNAPSE'26.",
    url: `${BASE_URL}/pronite`,
    images: [
      {
        url: `${BASE_URL}/pronitemain.png`,
        width: 1200,
        height: 630,
        alt: "SYNAPSE'26 Pronite",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronite | SYNAPSE'26",
    description: "Experience electrifying pronite performances featuring top artists at SYNAPSE'26.",
  },
  alternates: {
    canonical: `${BASE_URL}/pronite`,
  },
};
