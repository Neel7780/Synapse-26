"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import HeroSection from "@/components/Hero-Section";
import AboutSection from "@/components/Home-AboutSection";
import JokerSection from "@/components/Home-JokerSection";
import ArtistsSection from "@/components/Artists";
import HallOfFame from "@/components/Home-HallOfFame";
import Footer from "@/components/ui/Footer";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { Navbar } from "@/components/ui/Resizable-navbar";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic import with SSR disabled to prevent "window is not defined" error
// from @react-three/fiber which accesses window at import time
const FluidCanvas = dynamic(() => import("@/components/FluidCanvas"), {
  ssr: false,
});

export default function HomeSection() {
  const [entered, setEntered] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);
  useEffect(() => {
    if (entered) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [entered]);

  return (
    <main className="flex flex-col min-h-svh overflow-x-hidden relative">
      {entered ? <FluidCanvas /> : ""}
      <Navbar visible={showNavbar}>
        <NavigationPanel />
      </Navbar>
      <HeroSection
        onEnter={() => setEntered(true)}
        setShowNavbar={setShowNavbar}
        showNavbar={showNavbar}
      />
      <div
        className={`
            mt-[200svh]
            w-full
            flex-col
            z-30
            ${entered ? "flex" : "hidden"}
          `}
      >
        <AboutSection />
        <JokerSection />
        <ArtistsSection />
        <HallOfFame />
        <Footer />
      </div>
    </main>
  );
}
