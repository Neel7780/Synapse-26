import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Merchandise",
  description: "Shop official SYNAPSE'26 merchandise. Get exclusive t-shirts, hoodies, and collectibles from DA Ka Tyohaar.",
  keywords: [
    "synapse merchandise",
    "college fest merch",
    "synapse t-shirt",
    "DAIICT merchandise",
    "fest collectibles",
  ],
  openGraph: {
    title: "Merchandise | SYNAPSE'26",
    description: "Shop official SYNAPSE'26 merchandise.",
    url: `${BASE_URL}/merchandise`,
    images: [
      {
        url: `${BASE_URL}/images_merch/MERCH.png`,
        width: 800,
        height: 600,
        alt: "SYNAPSE'26 Merchandise",
      },
    ],
  },
  alternates: {
    canonical: `${BASE_URL}/merchandise`,
  },
};
