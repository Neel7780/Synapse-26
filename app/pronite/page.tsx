"use client";

import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProniteHero from "@/components/ProniteHero";
import ArtistCarousel from "@/components/ArtistCarousel";
import ProniteGallery from "@/components/ProniteGallery";
import Footer from "@/components/ui/Footer";
import { Navbar, NavbarButton } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useAuth } from "@/hooks/useAuth";
import TextReveal from "@/components/TextReveal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PronitePage() {
  const { isAuthenticated } = useAuth();
  const ctaSectionRef = useRef<HTMLElement>(null);
  const ctaTitleRef = useRef<HTMLHeadingElement>(null);
  const ctaSubtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaButtonRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ctaSectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Spotlight effect that follows scroll
      if (spotlightRef.current) {
        gsap.set(spotlightRef.current, { opacity: 0 });

        gsap.to(spotlightRef.current, {
          opacity: 0.3,
          duration: 1,
          scrollTrigger: {
            trigger: ctaSectionRef.current,
            start: "top 60%",
            once: true,
          },
        });

        // Pulsing glow
        gsap.to(spotlightRef.current, {
          scale: 1.2,
          opacity: 0.4,
          duration: 2,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1,
        });
      }

      // Title dramatic reveal - split into words
      if (ctaTitleRef.current) {
        const lines = ctaTitleRef.current.innerHTML.split("<br>");
        ctaTitleRef.current.innerHTML = "";

        lines.forEach((line, lineIndex) => {
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
          if (lineIndex < lines.length - 1) {
            ctaTitleRef.current?.appendChild(document.createElement("br"));
          }
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

      // Button dramatic entrance with glow
      if (ctaButtonRef.current) {
        gsap.fromTo(
          ctaButtonRef.current,
          {
            opacity: 0,
            scale: 0.5,
            y: 50,
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: 0.8,
            scrollTrigger: {
              trigger: ctaSectionRef.current,
              start: "top 70%",
              once: true,
            },
          }
        );

        // Continuous pulse glow on button
        gsap.to(ctaButtonRef.current, {
          boxShadow: "0 0 60px 20px rgba(235, 0, 0, 0.4)",
          duration: 1.5,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.5,
        });
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
        {/* Spotlight effect */}
        <div
          ref={spotlightRef}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-red-600 blur-[150px] pointer-events-none opacity-0"
        />

        {/* Particle effect background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-pulse"
              style={{
                left: `${(i * 7 + 13) % 100}%`,
                top: `${(i * 3 + 7) % 100}%`,
                animationDelay: `${(i % 5) * 0.4}s`,
                animationDuration: `${2 + (i % 3)}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10">
          <h1
            ref={ctaTitleRef}
            className="text-[clamp(3.5rem,15vw,10rem)] font-texgyreadventor leading-none mb-4"
            style={{ perspective: "1000px" }}
          >
            Join the <br /> Celebration
          </h1>

          <p
            ref={ctaSubtitleRef}
            className="font-jqka text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            One night. Endless energy. Unforgettable memories. <br />A moment
            you&apos;ll wish you were part of.
          </p>

          <div ref={ctaButtonRef} className="inline-block">
            {!isAuthenticated ? (
              <NavbarButton href="/auth" variant="register">
                REGISTER
              </NavbarButton>
            ) : (
              <NavbarButton
                variant="register"
                onClick={async () => {
                  const { createClient } = await import("@/utils/supabase/client");
                  const supabase = createClient();
                  await supabase.auth.signOut();
                  window.location.href = "/";
                }}
              >
                LOGOUT
              </NavbarButton>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
