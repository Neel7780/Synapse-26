"use client";

import HeroSection from "@/components/Hero-Section-Sponsors";
import SponsorTier from "@/components/SponsorTier";
import Footer from "@/components/ui/Footer";

import { useSponsors } from "@/hooks/useSponsors";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import SponsorNavigation from "@/components/SponsorNavigation";

export default function SponsorsPage() {
  const { categories, loading, error } = useSponsors();

  if (loading) {
    return (
      <main className="bg-black text-white flex flex-col items-center min-h-screen w-full overflow-x-hidden justify-center">
        <LoadingSpinner />
        <div className="mt-4 text-xl font-joker animate-pulse">Loading Sponsors...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="bg-black text-white flex flex-col items-center min-h-screen w-full overflow-x-hidden justify-center">
        <div className="text-red-500 font-bold">Error loading sponsors. Please try again later.</div>
      </main>
    );
  }

  // Transform categories for navigation
  const navCategories = categories.map(c => ({ id: c.sponsor_category_id, tier: c.tier }));

  return (
    <main className="bg-black text-white flex flex-col items-center min-h-screen w-full overflow-x-hidden">
      <HeroSection />

      <SponsorNavigation categories={navCategories} />

      <div className="w-full flex flex-col items-center gap-y-2 md:gap-y-6 pb-40">
        {categories.map((category) => {
          // If no sponsors, show "To be Announced"
          const displaySponsors = category.sponsors.length > 0
            ? category.sponsors
            : [{ name: "To be Announced", logo_url: null, website_url: null }];

          return (
            <SponsorTier
              key={category.sponsor_category_id}
              id={category.tier}
              title={category.tier}
              sponsors={displaySponsors}
            />
          );
        })}
      </div>

      <Footer />
    </main>
  );
}
