"use client";

import gsap from 'gsap';
import HomeSection from "@/app/synapse/page";
import { useEffect } from "react";
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  useEffect(() => {
    ScrollTrigger.normalizeScroll({
      allowNestedScroll: true,
    })
  }, [])
  return (
    <>
      <main className="relative min-h-screen bg-black overflow-x-hidden">
        {/* Main Content - Hidden during loading, visible after */}
        <div
          className={`relative w-full f-full transition-opacity duration-500`}
        >
          <HomeSection />
        </div>

      </main>

      {/* Just use this single section as Home Page 
      <HomeMainSection /> 
        */}
    </>
  );
}
