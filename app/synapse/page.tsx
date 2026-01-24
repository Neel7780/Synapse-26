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

import FluidCanvas from "@/components/FluidCanvas";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Dynamic import for custom cursor (client-only)
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), {
  ssr: false,
});

export default function HomeSection() {
  const [entered, setEntered] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("synapse_has_entered") === "true";
    }
    return false;
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (entered) {
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
      });
    }
  }, [entered]);

  return (
    <main className="flex flex-col min-h-dvh overflow-x-hidden relative">
      {entered && !isMobile ? (
        <div className="hidden md:block">
          <FluidCanvas />
        </div>
      ) : ""}

      <HeroSection
        onEnter={() => setEntered(true)}
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
      </div >
    </main >
  );
}
