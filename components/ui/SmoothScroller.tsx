"use client";

import { useEffect, useRef, ReactNode, useState, useCallback } from "react";

interface SmoothScrollerProps {
  children: ReactNode;
}

export function SmoothScroller({ children }: SmoothScrollerProps) {
  const lenisRef = useRef<unknown>(null);
  const rafIdRef = useRef<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cleanup = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (lenisRef.current) {
      (lenisRef.current as { destroy: () => void }).destroy();
      lenisRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isMounted || typeof window === "undefined") return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return; // Skip smooth scrolling for users who prefer reduced motion
    }

    // Dynamically import Lenis and GSAP only on client side
    const initLenis = async () => {
      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        const { default: Lenis } = await import("lenis");

        gsap.registerPlugin(ScrollTrigger);

        // Initialize Lenis with optimized settings for high traffic
        const lenis = new Lenis({
          duration: 1.0, // Slightly faster for better responsiveness
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          gestureOrientation: "vertical",
          smoothWheel: true,
          touchMultiplier: 1.5, // Reduced for better mobile performance
          infinite: false,
        });

        lenisRef.current = lenis;

        // Integrate Lenis with GSAP ScrollTrigger
        lenis.on("scroll", ScrollTrigger.update);

        // Use GSAP ticker for smooth animation frame updates
        const tickerCallback = (time: number) => {
          lenis.raf(time * 1000);
        };
        gsap.ticker.add(tickerCallback);

        // Disable GSAP's default lag smoothing for buttery performance
        gsap.ticker.lagSmoothing(0);

        // Refresh ScrollTrigger after Lenis is ready
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        // Store cleanup function
        return () => {
          gsap.ticker.remove(tickerCallback);
        };
      } catch (error) {
        console.warn("Failed to initialize smooth scrolling:", error);
      }
    };

    initLenis();

    return cleanup;
  }, [isMounted, cleanup]);

  // Handle visibility change to pause/resume animations
  useEffect(() => {
    if (!isMounted) return;

    const handleVisibilityChange = () => {
      if (document.hidden && lenisRef.current) {
        (lenisRef.current as { stop: () => void }).stop?.();
      } else if (!document.hidden && lenisRef.current) {
        (lenisRef.current as { start: () => void }).start?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isMounted]);

  return <div id="smooth-wrapper">{children}</div>;
}
