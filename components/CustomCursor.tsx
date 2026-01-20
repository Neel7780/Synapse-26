"use client";

import { useEffect, useRef, memo } from "react";
import gsap from "gsap";

/**
 * Premium GSAP Custom Cursor
 * - Clean, minimal design with Joker theme
 * - Smooth following with magnetic effects
 * - Performance optimized with RAF
 */
const CustomCursor = memo(function CustomCursor() {
  const cursorOuterRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(false);
  const isHoveringRef = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip on touch devices
    if (typeof window === "undefined") return;
    if ("ontouchstart" in window || navigator.maxTouchPoints > 0) return;

    // Skip if reduced motion preferred
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const outer = cursorOuterRef.current;
    const inner = cursorInnerRef.current;
    if (!outer || !inner) return;

    // Don't hide default cursor - let users see the default cursor as fallback
    // The custom cursor will overlay on top with mix-blend-difference
    // document.documentElement.style.cursor = "none";
    // document.body.style.cursor = "none";

    // Set initial state
    gsap.set([outer, inner], {
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
    });

    // Smooth cursor following
    const updateCursor = () => {
      const { x, y } = posRef.current;

      // Inner dot - follows immediately
      gsap.to(inner, {
        x,
        y,
        duration: 0.15,
        ease: "power3.out",
        overwrite: true,
      });

      // Outer ring - follows with delay
      gsap.to(outer, {
        x,
        y,
        duration: 0.4,
        ease: "power2.out",
        overwrite: true,
      });

      rafRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        gsap.to([outer, inner], {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      }

      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(updateCursor);
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      gsap.to([outer, inner], {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const onMouseEnter = () => {
      isVisibleRef.current = true;
      gsap.to([outer, inner], {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    // Click effects
    const onMouseDown = () => {
      gsap.to(outer, {
        scale: 0.8,
        duration: 0.15,
        ease: "power2.out",
      });
      gsap.to(inner, {
        scale: 1.5,
        duration: 0.15,
        ease: "power2.out",
      });
    };

    const onMouseUp = () => {
      gsap.to(outer, {
        scale: isHoveringRef.current ? 1.5 : 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.4)",
      });
      gsap.to(inner, {
        scale: isHoveringRef.current ? 0 : 1,
        duration: 0.4,
        ease: "elastic.out(1, 0.4)",
      });
    };

    // Hover effects for interactive elements
    const hoverTargets = "a, button, [data-cursor-hover], input, textarea, select, [role='button'], .cursor-hover";

    const onTargetEnter = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      isHoveringRef.current = true;

      // Expand outer, hide inner
      gsap.to(outer, {
        scale: 1.5,
        borderColor: "#EB0000",
        backgroundColor: "rgba(235, 0, 0, 0.1)",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(inner, {
        scale: 0,
        duration: 0.3,
        ease: "power2.out",
      });

      // Magnetic effect for buttons
      if (target.hasAttribute("data-cursor-magnetic")) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        target.addEventListener("mousemove", (e: MouseEvent) => {
          const deltaX = (e.clientX - centerX) * 0.3;
          const deltaY = (e.clientY - centerY) * 0.3;

          gsap.to(target, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: "power2.out",
          });
        });
      }
    };

    const onTargetLeave = (e: Event) => {
      const target = e.currentTarget as HTMLElement;
      isHoveringRef.current = false;

      // Reset cursor
      gsap.to(outer, {
        scale: 1,
        borderColor: "rgba(255, 255, 255, 0.6)",
        backgroundColor: "transparent",
        duration: 0.3,
        ease: "power2.out",
      });

      gsap.to(inner, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });

      // Reset magnetic effect
      if (target.hasAttribute("data-cursor-magnetic")) {
        gsap.to(target, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      }
    };

    // Add event listeners
    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    // Add hover listeners
    const targets = document.querySelectorAll(hoverTargets);
    targets.forEach((el) => {
      el.addEventListener("mouseenter", onTargetEnter);
      el.addEventListener("mouseleave", onTargetLeave);
    });

    // Observe for dynamically added elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.matches(hoverTargets)) {
              node.addEventListener("mouseenter", onTargetEnter);
              node.addEventListener("mouseleave", onTargetLeave);
            }
            node.querySelectorAll(hoverTargets).forEach((el) => {
              el.addEventListener("mouseenter", onTargetEnter);
              el.addEventListener("mouseleave", onTargetLeave);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Cleanup
    return () => {
      // No need to restore cursor styles since we're not hiding them

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);

      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onTargetEnter);
        el.removeEventListener("mouseleave", onTargetLeave);
      });

      observer.disconnect();

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      gsap.killTweensOf([outer, inner]);
    };
  }, []);

  // Don't render on server or touch devices
  if (typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0)) {
    return null;
  }

  return (
    <>
      {/* Outer ring */}
      <div
        ref={cursorOuterRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full border-2 border-white/60 pointer-events-none z-[9999] mix-blend-difference will-change-transform"
        aria-hidden="true"
      />
      {/* Inner dot */}
      <div
        ref={cursorInnerRef}
        className="fixed top-0 left-0 w-2 h-2 bg-white rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform"
        aria-hidden="true"
      />
    </>
  );
});

export default CustomCursor;
