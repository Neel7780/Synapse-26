"use client";

import { useEffect, useRef, useCallback, memo } from "react";
import gsap from "gsap";

interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isClicking: boolean;
  cursorText: string;
}

const CustomCursor = memo(function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const cursorTrailsRef = useRef<HTMLDivElement[]>([]);
  const cursorTextRef = useRef<HTMLSpanElement>(null);
  const cursorGlowRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef<CursorState>({
    x: 0,
    y: 0,
    isHovering: false,
    isClicking: false,
    cursorText: "",
  });

  const rafRef = useRef<number | null>(null);
  const trailPositions = useRef<{ x: number; y: number }[]>([]);
  const isTouch = useRef(false);

  // Number of trail particles
  const TRAIL_COUNT = 5;

  const setTrailRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    if (el) cursorTrailsRef.current[index] = el;
  }, []);

  useEffect(() => {
    // Check for touch device
    isTouch.current = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (isTouch.current) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const cursor = cursorRef.current;
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    const glow = cursorGlowRef.current;
    const textEl = cursorTextRef.current;
    const trails = cursorTrailsRef.current;

    if (!cursor || !dot || !ring || !glow) return;

    // Initialize trail positions
    trailPositions.current = Array(TRAIL_COUNT).fill({ x: 0, y: 0 });

    // Hide default cursor
    document.body.style.cursor = "none";

    // Initial setup
    gsap.set([cursor, dot, ring, glow, ...trails], {
      xPercent: -50,
      yPercent: -50,
    });

    gsap.set(cursor, { opacity: 0 });

    // Mouse move handler
    const onMouseMove = (e: MouseEvent) => {
      stateRef.current.x = e.clientX;
      stateRef.current.y = e.clientY;

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateCursor);
      }
    };

    // Update cursor position with GSAP
    const updateCursor = () => {
      const { x, y, isHovering, isClicking } = stateRef.current;

      // Main cursor container
      gsap.to(cursor, {
        x,
        y,
        duration: 0,
        ease: "none",
      });

      // Dot follows immediately
      gsap.to(dot, {
        x,
        y,
        duration: 0.1,
        ease: "power2.out",
      });

      // Ring follows with slight delay for fluid feel
      gsap.to(ring, {
        x,
        y,
        duration: 0.3,
        ease: "power3.out",
      });

      // Glow follows with more delay for trailing effect
      gsap.to(glow, {
        x,
        y,
        duration: 0.5,
        ease: "power2.out",
      });

      // Update trail particles with staggered delays
      trails.forEach((trail, i) => {
        const delay = (i + 1) * 0.03;
        const scale = 1 - (i + 1) * 0.15;
        const opacity = 0.6 - i * 0.1;

        gsap.to(trail, {
          x,
          y,
          scale: isHovering ? scale * 1.2 : scale,
          opacity: isClicking ? opacity * 0.5 : opacity,
          duration: 0.2 + delay,
          ease: "power2.out",
        });
      });

      rafRef.current = null;
    };

    // Mouse enter viewport
    const onMouseEnter = () => {
      gsap.to(cursor, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Mouse leave viewport
    const onMouseLeave = () => {
      gsap.to(cursor, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Mouse down
    const onMouseDown = () => {
      stateRef.current.isClicking = true;

      gsap.to(dot, {
        scale: 0.5,
        duration: 0.15,
        ease: "power2.out",
      });

      gsap.to(ring, {
        scale: 0.8,
        borderWidth: "3px",
        duration: 0.15,
        ease: "power2.out",
      });

      gsap.to(glow, {
        scale: 1.5,
        opacity: 0.8,
        duration: 0.2,
        ease: "power2.out",
      });

      // Ripple effect
      const ripple = document.createElement("div");
      ripple.className = "cursor-ripple";
      ripple.style.cssText = `
        position: fixed;
        left: ${stateRef.current.x}px;
        top: ${stateRef.current.y}px;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(235, 0, 0, 0.6) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
      `;
      document.body.appendChild(ripple);

      gsap.to(ripple, {
        scale: 4,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      });
    };

    // Mouse up
    const onMouseUp = () => {
      stateRef.current.isClicking = false;

      gsap.to(dot, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });

      gsap.to(ring, {
        scale: 1,
        borderWidth: "2px",
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });

      gsap.to(glow, {
        scale: 1,
        opacity: 0.4,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Handle hoverable elements
    const hoverableSelectors = "a, button, [data-cursor], input, textarea, select, [role='button']";

    const onElementEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      stateRef.current.isHovering = true;

      const cursorType = target.dataset.cursor || "pointer";
      const cursorText = target.dataset.cursorText || "";

      stateRef.current.cursorText = cursorText;

      // Expand cursor on hover
      gsap.to(ring, {
        scale: 1.8,
        borderColor: "rgba(235, 0, 0, 0.8)",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(dot, {
        scale: 0.5,
        backgroundColor: "#EB0000",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(glow, {
        scale: 2,
        opacity: 0.6,
        duration: 0.3,
        ease: "power2.out",
      });

      // Show cursor text if available
      if (cursorText && textEl) {
        textEl.textContent = cursorText;
        gsap.to(textEl, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "back.out(1.7)",
        });
      }

      // Magnetic effect - slightly pull cursor toward element center
      if (cursorType === "magnetic") {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        gsap.to(target, {
          x: (stateRef.current.x - centerX) * 0.2,
          y: (stateRef.current.y - centerY) * 0.2,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const onElementLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      stateRef.current.isHovering = false;
      stateRef.current.cursorText = "";

      // Reset cursor
      gsap.to(ring, {
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.5)",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(dot, {
        scale: 1,
        backgroundColor: "#ffffff",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(glow, {
        scale: 1,
        opacity: 0.4,
        duration: 0.3,
        ease: "power2.out",
      });

      // Hide cursor text
      if (textEl) {
        gsap.to(textEl, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          ease: "power2.in",
        });
      }

      // Reset magnetic effect
      gsap.to(target, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: "elastic.out(1, 0.5)",
      });
    };

    // Add event listeners
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    // Add hover listeners to interactive elements
    const hoverables = document.querySelectorAll(hoverableSelectors);
    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", onElementEnter);
      el.addEventListener("mouseleave", onElementLeave);
    });

    // MutationObserver to handle dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(hoverableSelectors)) {
              node.addEventListener("mouseenter", onElementEnter);
              node.addEventListener("mouseleave", onElementLeave);
            }
            node.querySelectorAll(hoverableSelectors).forEach((el) => {
              el.addEventListener("mouseenter", onElementEnter);
              el.addEventListener("mouseleave", onElementLeave);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      document.body.style.cursor = "";
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);

      hoverables.forEach((el) => {
        el.removeEventListener("mouseenter", onElementEnter);
        el.removeEventListener("mouseleave", onElementLeave);
      });

      observer.disconnect();

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      gsap.killTweensOf([cursor, dot, ring, glow, textEl, ...trails]);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
      style={{ opacity: 0 }}
    >
      {/* Trail particles */}
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={setTrailRef(i)}
          className="fixed top-0 left-0 rounded-full pointer-events-none"
          style={{
            width: `${8 - i}px`,
            height: `${8 - i}px`,
            backgroundColor: `rgba(235, 0, 0, ${0.3 - i * 0.05})`,
            filter: `blur(${i}px)`,
          }}
        />
      ))}

      {/* Glow effect */}
      <div
        ref={cursorGlowRef}
        className="fixed top-0 left-0 w-16 h-16 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(235, 0, 0, 0.3) 0%, transparent 70%)",
          filter: "blur(8px)",
          opacity: 0.4,
        }}
      />

      {/* Outer ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-white/50 pointer-events-none will-change-transform"
        style={{
          transition: "border-color 0.3s ease",
        }}
      />

      {/* Inner dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none will-change-transform"
      />

      {/* Cursor text */}
      <span
        ref={cursorTextRef}
        className="fixed top-6 left-6 text-xs font-medium text-white uppercase tracking-wider opacity-0 pointer-events-none whitespace-nowrap font-jqka"
        style={{ transform: "scale(0.8)" }}
      />
    </div>
  );
});

export default CustomCursor;
