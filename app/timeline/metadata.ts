import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Schedule",
  description: "View the complete schedule and timeline of SYNAPSE'26. Plan your 3-day experience at DAIICT's techno-cultural fest - February 26-28, 2026.",
  keywords: [
    "synapse schedule",
    "fest timeline",
    "event schedule",
    "synapse 2026 dates",
    "DAIICT fest schedule",
  ],
  openGraph: {
    title: "Schedule | SYNAPSE'26",
    description: "View the complete schedule and timeline of SYNAPSE'26.",
    url: `${BASE_URL}/timeline`,
  },
  alternates: {
    canonical: `${BASE_URL}/timeline`,
  },
};
