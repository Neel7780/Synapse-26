"use client";

import { useState, useEffect } from "react";

import HeroSection from "@/components/Hero-Section";
import AboutSection from "@/components/Home-AboutSection";
import JokerSection from "@/components/Home-JokerSection";
import ArtistsSection from "@/components/Artists";
import HallOfFame from "@/components/Home-HallOfFame";
import Footer from "@/components/ui/Footer";
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SmoothScroller } from "@/components/ui/SmoothScroller";


export default function HomeSection() {
  const [entered, setEntered] = useState(false);

  // Refresh GSAP after .end mounts
  useEffect(() => {
    if (entered) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [entered]);

  return (
    <SmoothScroller>
      <main className="flex flex-col min-h-screen">
        <HeroSection onEnter={() => setEntered(true)} />
        <div
          className={`
            end
            overflow-x-hidden
            w-full
            flex-col
            relative
            mt-[300vh]
            transition-opacity
            duration-700
            ${entered ? "flex opacity-100" : "hidden opacity-0"}
          `}
        >
          <AboutSection />
          <JokerSection />
          <ArtistsSection />
          <HallOfFame />
          <Footer />
        </div>
      </main>
    </SmoothScroller>
  );
}
