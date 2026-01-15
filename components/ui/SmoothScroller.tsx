"use client";

import { useEffect, useRef, ReactNode, useState } from "react";

interface SmoothScrollerProps {
  children: ReactNode;
}

export function SmoothScroller({ children }: SmoothScrollerProps) {
  const lenisRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    // Dynamically import Lenis and GSAP only on client side
    const initLenis = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const { default: Lenis } = await import("lenis");

      gsap.registerPlugin(ScrollTrigger);

      // Initialize Lenis with optimized settings
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth exponential easing
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        touchMultiplier: 2,
      });

      lenisRef.current = lenis;

      // Integrate Lenis with GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      // Use GSAP ticker for smooth animation frame updates
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      // Disable GSAP's default lag smoothing for buttery performance
      gsap.ticker.lagSmoothing(0);

      // Refresh ScrollTrigger after Lenis is ready
      ScrollTrigger.refresh();
    };

    initLenis();

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, [isMounted]);

  return <div id="smooth-wrapper">{children}</div>;
}

