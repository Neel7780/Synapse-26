"use client";

import { useRef, useEffect, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SponsorTierProps {
  title: string;
  sponsors: { name: string }[];
  desktopCols?: 2 | 4;
}

// Memoized sponsor box with hover effects
const SponsorBox = memo(function SponsorBox({
  name,
  index: _index
}: {
  name: string;
  index: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!boxRef.current) return;

    const box = boxRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Hover tilt effect
    const handleMouseMove = (e: MouseEvent) => {
      const rect = box.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;

      gsap.to(box, {
        rotateX,
        rotateY,
        scale: 1.05,
        boxShadow: "0 20px 40px rgba(255,255,255,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(box, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        duration: 0.5,
        ease: "power3.out",
      });
    };

    box.addEventListener("mousemove", handleMouseMove);
    box.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      box.removeEventListener("mousemove", handleMouseMove);
      box.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="sponsor-item flex flex-col items-center" style={{ perspective: "1000px" }}>
      {/* Sponsor image box */}
      <div
        ref={boxRef}
        className="
          w-[180px] h-[135px]
          sm:w-[200px] sm:h-[150px]
          md:w-[220px] md:h-[160px]
          bg-white
          border border-[#333]
          rounded-[10px]
          shadow-md
          flex items-center justify-center
          overflow-hidden
          cursor-pointer
          transition-colors
        "
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Placeholder shimmer effect */}
        <div className="w-full h-full bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse" />
      </div>

      {/* Name plate */}
      <div
        className="
          sponsor-name
          mt-5
          px-5 py-1.5
          min-w-[130px]
          max-w-[220px]
          text-center
          bg-transparent
          border border-[#4A4A4A]
          rounded-[4px]
        "
      >
        <p className="text-[14px] sm:text-[15px] md:text-[16px] text-white/95 font-semibold leading-snug break-words">
          {name || "Name"}
        </p>
      </div>
    </div>
  );
});

export default function SponsorTier({
  title,
  sponsors,
  desktopCols = 4,
}: SponsorTierProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);

  const gridCols =
    desktopCols === 2
      ? "grid-cols-2 md:grid-cols-2"
      : "grid-cols-2 md:grid-cols-4";

  useEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title flip animation
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          {
            opacity: 0,
            rotateX: -90,
            y: -50,
          },
          {
            opacity: 1,
            rotateX: 0,
            y: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              once: true,
            },
          }
        );
      }

      // Sponsor boxes cascade animation
      const items = sectionRef.current?.querySelectorAll(".sponsor-item");
      if (items?.length) {
        gsap.fromTo(
          items,
          {
            opacity: 0,
            y: 60,
            scale: 0.8,
            rotateY: -30,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.6,
            ease: "back.out(1.4)",
            stagger: {
              each: 0.08,
              from: "random",
            },
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              once: true,
            },
          }
        );
      }

      // Name plates slide up
      const names = sectionRef.current?.querySelectorAll(".sponsor-name");
      if (names?.length) {
        gsap.fromTo(
          names,
          {
            opacity: 0,
            y: 20,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.4,
            ease: "power2.out",
            stagger: 0.05,
            delay: 0.3,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              once: true,
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [sponsors]);

  return (
    <section
      ref={sectionRef}
      className="w-full flex flex-col items-center mt-16 md:mt-24 mb-14 px-4"
    >
      {/* Tier title */}
      <div
        ref={titleRef}
        className="
          inline-flex
          px-7 md:px-10
          py-3
          border border-white/60
          text-white
          text-sm md:text-base
          font-semibold
          uppercase
          tracking-[0.1em]
          rounded-[3px]
          mb-14
        "
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {title}
      </div>

      {/* Sponsors grid */}
      <div
        className={`
          grid
          ${gridCols}
          gap-x-10 md:gap-x-20
          gap-y-16 md:gap-y-20
          justify-items-center
          w-full
          max-w-[1100px]
          mx-auto
        `}
      >
        {sponsors.map((s, i) => (
          <SponsorBox key={i} name={s.name} index={i} />
        ))}
      </div>
    </section>
  );
}
