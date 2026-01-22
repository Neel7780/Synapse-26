"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Check for reduced motion preference
const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Hook for staggered entrance animations on scroll
 */
export function useStaggerReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  options: {
    from?: gsap.TweenVars;
    to?: gsap.TweenVars;
    stagger?: number | gsap.StaggerVars;
    trigger?: string;
    start?: string;
    end?: string;
    scrub?: boolean | number;
  } = {}
) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion() || !containerRef.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(selector);
      if (!elements?.length) return;

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 60,
          ...options.from,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: options.stagger ?? 0.1,
          ...options.to,
          scrollTrigger: {
            trigger: options.trigger || containerRef.current,
            start: options.start || "top 80%",
            end: options.end || "bottom 20%",
            scrub: options.scrub ?? false,
            once: true,
          },
        }
      );

      hasAnimated.current = true;
    }, containerRef);

    return () => ctx.revert();
  }, [containerRef, selector, options]);
}

/**
 * Hook for text split and reveal animation
 */
export function useTextReveal(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    type?: "words" | "chars" | "lines";
    stagger?: number;
    duration?: number;
    delay?: number;
    scrub?: boolean | number;
    start?: string;
    end?: string;
  } = {}
) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current || hasAnimated.current) return;

    const element = ref.current;
    const type = options.type || "words";
    const originalHTML = element.innerHTML;

    // Split text into spans
    const splitText = (el: HTMLElement, splitType: string) => {
      const text = el.textContent || "";
      el.innerHTML = "";

      if (splitType === "chars") {
        text.split("").forEach((char) => {
          const span = document.createElement("span");
          span.className = "gsap-char inline-block";
          span.textContent = char === " " ? "\u00A0" : char;
          el.appendChild(span);
        });
      } else if (splitType === "words") {
        text.split(/\s+/).forEach((word, i, arr) => {
          const span = document.createElement("span");
          span.className = "gsap-word inline-block";
          span.textContent = word;
          el.appendChild(span);
          if (i < arr.length - 1) {
            el.appendChild(document.createTextNode(" "));
          }
        });
      } else if (splitType === "lines") {
        // For lines, we wrap each line break
        const lines = text.split("\n");
        lines.forEach((line, _i) => {
          const span = document.createElement("span");
          span.className = "gsap-line block";
          span.textContent = line;
          el.appendChild(span);
        });
      }
    };

    splitText(element, type);

    const ctx = gsap.context(() => {
      const targets = element.querySelectorAll(`.gsap-${type.slice(0, -1)}, .gsap-${type}`);

      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y: 30,
          rotateX: -20,
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: options.duration || 0.6,
          ease: "power3.out",
          stagger: options.stagger || 0.03,
          delay: options.delay || 0,
          scrollTrigger: options.scrub !== undefined
            ? {
              trigger: element,
              start: options.start || "top 85%",
              end: options.end || "top 50%",
              scrub: options.scrub,
            }
            : {
              trigger: element,
              start: options.start || "top 85%",
              once: true,
            },
        }
      );

      hasAnimated.current = true;
    }, ref);

    return () => {
      ctx.revert();
      // Restore original HTML on cleanup
      if (element) element.innerHTML = originalHTML;
    };
  }, [ref, options]);
}

/**
 * Hook for parallax effect on scroll
 */
export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  speed: number = 0.5,
  direction: "y" | "x" = "y"
) {
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        [direction]: () => speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [ref, speed, direction]);
}

/**
 * Hook for magnetic hover effect
 */
export function useMagneticHover(
  ref: React.RefObject<HTMLElement | null>,
  strength: number = 0.3
) {
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;

    const element = ref.current;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, strength]);
}

/**
 * Hook for card tilt effect on hover
 */
export function useCardTilt(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    maxTilt?: number;
    perspective?: number;
    scale?: number;
    speed?: number;
  } = {}
) {
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;

    const element = ref.current;
    const maxTilt = options.maxTilt || 10;
    const perspective = options.perspective || 1000;
    const scale = options.scale || 1.02;
    const speed = options.speed || 0.4;

    element.style.transformStyle = "preserve-3d";
    element.style.perspective = `${perspective}px`;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      gsap.to(element, {
        rotateX,
        rotateY,
        scale,
        duration: speed,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.6,
        ease: "power3.out",
      });
    };

    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [ref, options]);
}

/**
 * Hook for scroll-triggered counter animation
 */
export function useCountUp(
  ref: React.RefObject<HTMLElement | null>,
  endValue: number,
  options: {
    duration?: number;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  } = {}
) {
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion() || !ref.current || hasAnimated.current) return;

    const element = ref.current;
    const duration = options.duration || 2;
    const prefix = options.prefix || "";
    const suffix = options.suffix || "";
    const decimals = options.decimals || 0;

    const ctx = gsap.context(() => {
      const counter = { value: 0 };

      gsap.to(counter, {
        value: endValue,
        duration,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          once: true,
        },
        onUpdate: () => {
          element.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
        },
      });

      hasAnimated.current = true;
    }, ref);

    return () => ctx.revert();
  }, [ref, endValue, options]);
}

/**
 * Hook for drawing SVG path on scroll
 */
export function useDrawSVG(
  ref: React.RefObject<SVGPathElement | null>,
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
  } = {}
) {
  useEffect(() => {
    if (prefersReducedMotion() || !ref.current) return;

    const path = ref.current;
    const length = path.getTotalLength();

    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
          trigger: path,
          start: options.start || "top 80%",
          end: options.end || "bottom 50%",
          scrub: options.scrub ?? 1,
        },
      });
    });

    return () => ctx.revert();
  }, [ref, options]);
}

/**
 * Utility to create a GSAP context that auto-cleans up
 */
export function useGSAPContext(
  callback: (ctx: gsap.Context) => void,
  deps: React.DependencyList = [],
  scope?: React.RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context((self) => {
      callback(self);
    }, scope?.current || undefined);

    return () => ctx.revert();
  }, deps);
}
