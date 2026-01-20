"use client";

import { useRef, useEffect, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface EventCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  link: string;
  index: number;
}

export const EventCard = memo(function EventCard({
  title,
  description,
  image,
  category,
  link,
  index,
}: EventCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  // Category color mapping with Joker theme
  const categoryColors: Record<string, string> = {
    Tech: "from-purple-600/80 to-purple-900/80",
    Cultural: "from-red-600/80 to-red-900/80",
    Gaming: "from-green-600/80 to-green-900/80",
    Workshop: "from-amber-600/80 to-amber-900/80",
    Art: "from-blue-600/80 to-blue-900/80",
  };

  const gradientClass = categoryColors[category] || "from-red-600/80 to-red-900/80";

  useEffect(() => {
    if (!cardRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const card = cardRef.current;
    const content = contentRef.current;
    const badge = badgeRef.current;
    const arrow = arrowRef.current;

    // Initial state
    gsap.set(card, {
      opacity: 0,
      y: 80,
      rotateX: -15,
      scale: 0.9,
    });

    gsap.set(badge, { opacity: 0, x: -20 });
    gsap.set(content, { opacity: 0, y: 30 });

    // Scroll-triggered entrance animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 85%",
        once: true,
      },
    });

    tl.to(card, {
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      duration: 0.8,
      delay: index * 0.1,
      ease: "back.out(1.4)",
    })
      .to(
        badge,
        {
          opacity: 1,
          x: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .to(
        content,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        "-=0.3"
      );

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        scale: 1.02,
        boxShadow: "0 25px 50px rgba(235, 0, 0, 0.2)",
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(arrow, {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.3,
        ease: "back.out(2)",
      });

      gsap.to(badge, {
        scale: 1.05,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
        duration: 0.4,
        ease: "power2.out",
      });

      gsap.to(arrow, {
        opacity: 0,
        x: -10,
        scale: 0.8,
        duration: 0.3,
        ease: "power2.in",
      });

      gsap.to(badge, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      tl.kill();
    };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="event-card group will-change-transform"
      style={{ perspective: "1000px" }}
    >
      <Link href={link} className="block">
        <div className="relative rounded-2xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 transition-colors duration-300 group-hover:border-red-500/30">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {/* Placeholder gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass}`} />

            {/* Animated overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />

            {/* Shimmer effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-10" />

            {/* Category Badge */}
            <div ref={badgeRef} className="absolute top-4 left-4 z-20">
              <span className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase bg-black/50 backdrop-blur-md border border-red-500/30 rounded-full text-white">
                {category}
              </span>
            </div>

            {/* Hover arrow indicator */}
            <div
              ref={arrowRef}
              className="absolute bottom-4 right-4 z-20 w-10 h-10 rounded-full bg-red-600/80 backdrop-blur-md border border-red-500/50 flex items-center justify-center opacity-0 -translate-x-2 scale-80"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="p-6">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300 font-jqka">
              {title}
            </h3>
            <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-2 font-roboto">
              {description}
            </p>

            {/* CTA Text */}
            <div className="mt-4 flex items-center text-sm font-medium">
              <span className="text-red-400 font-jqka">View Event</span>
              <span className="ml-2 text-red-400 group-hover:translate-x-2 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
});

EventCard.displayName = "EventCard";
