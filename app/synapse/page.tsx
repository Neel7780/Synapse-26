"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import HeroSection from "@/components/Hero-Section";
import AboutSection from "@/components/Home-AboutSection";
import JokerSection from "@/components/Home-JokerSection";
import ArtistsSection from "@/components/Artists";
import HallOfFame from "@/components/Home-HallOfFame";
import Footer from "@/components/ui/Footer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { Navbar } from "@/components/ui/Resizable-navbar";

// Dynamic import with SSR disabled to prevent "window is not defined" error
// from @react-three/fiber which accesses window at import time
// const FluidCanvas = dynamic(() => import("@/components/FluidCanvas"), {
//   ssr: false,
// });

export default function HomeSection() {
  const [entered, setEntered] = useState(false);
  const [showNavbar, setShowNavbar] = useState(false);

  // Refresh GSAP after .end mounts
  useEffect(() => {
    if (entered) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [entered]);


  return (
    <main className="flex flex-col min-h-screen relative">
      {/* {entered ? <FluidCanvas /> : ""} */}
      {entered ? "" : ""}
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
            end
            overflow-x-hidden
            w-full
            flex-col
            z-30
            mt-[300dvh]
            transition-opacity
            duration-700
            ${entered ? "flex opacity-100" : "hidden opacity-0"}
          `}
      >
        <AboutSection />
        <JokerSection setShowNavbar={setShowNavbar} showNavbar={showNavbar} />
        <ArtistsSection />
        <HallOfFame />
        <Footer />
      </div>
    </main>
  );
}
