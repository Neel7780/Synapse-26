import { Metadata } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://synapse-daiict.co.in";

export const metadata: Metadata = {
  title: "Login / Register",
  description: "Login or register for SYNAPSE'26 to participate in events, book accommodation, and get exclusive access to the fest.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Login | SYNAPSE'26",
    description: "Login or register for SYNAPSE'26",
    url: `${BASE_URL}/auth`,
  },
};
