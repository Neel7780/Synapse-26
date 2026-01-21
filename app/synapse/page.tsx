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
import FluidCanvas from "@/components/FluidCanvas";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic import for custom cursor (client-only)
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
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
    <main className="flex flex-col min-h-dvh overflow-x-hidden relative">
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
            mt-[200vh]
            w-full
            flex-col
            z-30
            ${entered ? "flex" : "hidden"}
          `}
      >
        <AboutSection />
        <JokerSection />
        <div className="relative z-20 bg-black" style={{ isolation: "isolate" }}>
          <ArtistsSection />
        </div>
        <div className="relative z-10 bg-black" style={{ isolation: "isolate" }}>
          <HallOfFame />
        </div>
        <Footer />
      </div>
    </main>
  );
}
