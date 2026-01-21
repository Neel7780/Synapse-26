import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Accommodation",
  description: "Book accommodation for SYNAPSE'26 at DAIICT campus. Affordable stays for outstation participants during the fest - February 26-28, 2026.",
  keywords: [
    "synapse accommodation",
    "DAIICT hostel",
    "fest accommodation",
    "gandhinagar stay",
    "college fest stay",
  ],
  openGraph: {
    title: "Accommodation | SYNAPSE'26",
    description: "Book accommodation for SYNAPSE'26 at DAIICT campus.",
    url: `${BASE_URL}/accomodation`,
  },
  alternates: {
    canonical: `${BASE_URL}/accomodation`,
  },
};
