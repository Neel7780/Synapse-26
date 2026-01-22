import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Sponsors",
  description: "Meet our amazing sponsors who make SYNAPSE'26 possible. Partner with DAIICT's biggest techno-cultural fest and reach thousands of students.",
  keywords: [
    "synapse sponsors",
    "college fest sponsorship",
    "DAIICT sponsors",
    "tech fest partners",
    "synapse partners",
  ],
  openGraph: {
    title: "Sponsors | SYNAPSE'26",
    description: "Meet our amazing sponsors who make SYNAPSE'26 possible.",
    url: `${BASE_URL}/sponsors`,
  },
  alternates: {
    canonical: `${BASE_URL}/sponsors`,
  },
};
