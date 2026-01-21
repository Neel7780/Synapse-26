"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { Navbar } from "@/components/ui/Resizable-navbar";
import Footer from "@/components/ui/Footer";
import { EVENT_PAGES } from "./eventcontent";
import EventCards from "./EventCards";
import NavigationPanel from "@/components/ui/NavigationPanel";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = EVENT_PAGES[slug];

  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const triangle1Ref = useRef<HTMLDivElement>(null);
  const triangle2Ref = useRef<HTMLDivElement>(null);
  const triangle3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Refresh ScrollTrigger when Lenis updates
    // (Optional: usually not strictly needed unless using specific ScrollScroll plugins,
    // but good practice if you notice sync issues)
    // lenis.on('scroll', ScrollTrigger.update);

    const ctx = gsap.context(() => {
      // ... existing GSAP code ...
      // Triangle entrance animations - flying in from different directions
      const triangles = [triangle1Ref.current, triangle2Ref.current, triangle3Ref.current];
      const fromPositions = [
        { x: -200, y: -200, rotation: -45 },
        { x: 0, y: -300, rotation: 0 },
        { x: 200, y: -200, rotation: 45 },
      ];

      triangles.forEach((tri, i) => {
        if (!tri) return;

        gsap.fromTo(
          tri,
          {
            opacity: 0,
            x: fromPositions[i].x,
            y: fromPositions[i].y,
            rotation: fromPositions[i].rotation,
            scale: 0.5,
          },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 1.2,
            ease: "back.out(1.7)",
            delay: 0.2 + i * 0.15,
          }
        );

        // Subtle floating animation after entrance
        gsap.to(tri, {
          y: "+=10",
          duration: 2 + i * 0.3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 1.5,
        });
      });

      // Title animation - dramatic entrance
      if (titleRef.current) {
        const text = titleRef.current.textContent || "";
        titleRef.current.innerHTML = "";

        text.split("").forEach((char, i) => {
          const span = document.createElement("span");
          span.className = "inline-block";
          span.textContent = char === " " ? "\u00A0" : char;
          titleRef.current?.appendChild(span);
        });

        gsap.fromTo(
          titleRef.current.querySelectorAll("span"),
          {
            opacity: 0,
            y: 80,
            rotateY: -90,
            scale: 0,
          },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
            scale: 1,
            duration: 0.6,
            ease: "back.out(2)",
            stagger: 0.05,
            delay: 0.8,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (!page) return notFound();

  return (
    <main ref={containerRef} className="bg-black text-white min-h-[100dvh] overflow-x-hidden">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* TRIANGLE HEADER */}
      <header className="relative w-full h-[55dvh] min-h-[520px]">
        <div ref={triangle1Ref} className="absolute top-[6%] left-[6%] w-[180px] sm:w-[260px]">
          <Image
            src="/images_events/upper.png"
            alt=""
            width={360}
            height={260}
            priority
            className="w-full h-auto"
          />
        </div>
        <div ref={triangle2Ref} className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[220px] sm:w-[320px]">
          <Image
            src="/images_events/upper.png"
            alt=""
            width={360}
            height={260}
            priority
            className="w-full h-auto"
          />
        </div>
        <div ref={triangle3Ref} className="absolute top-[6%] right-[6%] w-[180px] sm:w-[260px]">
          <Image
            src="/images_events/upper.png"
            alt=""
            width={360}
            height={260}
            priority
            className="w-full h-auto"
          />
        </div>
      </header>

      {/* TITLE */}
      <section className="relative -mt-[50px] mb-20 text-center">
        <h1
          ref={titleRef}
          className="font-joker lowercase tracking-[0.12em] text-3xl sm:text-5xl lg:text-7xl"
          style={{ perspective: "1000px" }}
        >
          {page.title}
        </h1>
      </section>

      <EventCards cards={page.cards} />

      <Footer />
    </main>
  );
}
