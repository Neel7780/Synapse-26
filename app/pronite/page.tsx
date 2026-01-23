"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProniteHero from "@/components/ProniteHero";
import ArtistCarousel from "@/components/ArtistCarousel";
import ProniteGallery from "@/components/ProniteGallery";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import TextReveal from "@/components/TextReveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PronitePage() {
  const ctaSectionRef = useRef<HTMLElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);
  const ctaSubtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!ctaSectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title dramatic reveal - split into words
      if (ctaTitleRef.current) {
        const lines = ctaTitleRef.current.innerHTML.split("<br>");
        ctaTitleRef.current.innerHTML = "";

        lines.forEach((line) => {
          const lineDiv = document.createElement("div");
          lineDiv.className = "overflow-hidden";

          const words = line.trim().split(/\s+/);
          words.forEach((word) => {
            const span = document.createElement("span");
            span.className = "inline-block mr-[0.2em] cta-word";
            span.textContent = word;
            lineDiv.appendChild(span);
          });

          ctaTitleRef.current?.appendChild(lineDiv);
        });

        gsap.fromTo(
          ".cta-word",
          {
            y: 120,
            rotateX: -90,
            opacity: 0,
          },
          {
            y: 0,
            rotateX: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 70%",
              once: true,
            },
          }
        );
      }

      // Subtitle fade in
      if (ctaSubtitleRef.current) {
        gsap.fromTo(
          ctaSubtitleRef.current,
          {
            opacity: 0,
            y: 30,
            filter: "blur(10px)",
          },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1,
            ease: "power3.out",
            delay: 0.5,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 70%",
              once: true,
            },
          }
        );
      }
    }, ctaSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <main className="bg-black text-white selection:bg-red-600 selection:text-white">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* Hero Section */}
      <ProniteHero />

      {/* Stacked Carousel Section */}
      <section className="bg-black">
        <ArtistCarousel />
      </section>

      {/* Quote Section */}
      <section className="bg-black pt-10 pb-40 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto text-center">
          <TextReveal
            text="Synapse is a living celebration of music, art, and creativity, brought to life through performances, people, and passion."
          />
        </div>
      </section>

      {/* Gallery Section */}
      <ProniteGallery />

      {/* Registration Section - Enhanced with GSAP */}
      <section
        ref={ctaSectionRef}
        className="relative bg-black py-40 px-4 text-center overflow-hidden"
      >
        {/* Constant Red Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600 blur-[150px] pointer-events-none opacity-40" />

        <div className="relative z-10">
          <h1
            ref={ctaTitleRef}
            className="text-[clamp(3.5rem,15vw,10rem)] font-texgyreadventor leading-none mb-4"
            style={{ perspective: "1000px" }}
          >
            Join the Celebration
          </h1>

          <p
            ref={ctaSubtitleRef}
            className="font-jqka text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            One night. Endless energy. Unforgettable memories. <br />A moment
            you&apos;ll wish you were part of.
          </p>

        </div>
      </section>

      <Footer />
    </main>
  );
}
