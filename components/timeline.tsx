"use client";

import React, { memo, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* =======================
   TYPES
======================= */

interface Event {
  name: string;
  time: string;
  venue: string;
}

interface DaySchedule {
  day: number;
  events: Event[];
}

/* =======================
   EVENT ROW COMPONENT
======================= */

const EventRow = memo(function EventRow({
  event,
  index: _index
}: {
  event: Event;
  index: number;
}) {
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (!rowRef.current) return;

    const row = rowRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Hover highlight sweep effect
    const handleMouseEnter = () => {
      gsap.to(row, {
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        x: 5,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(row, {
        backgroundColor: "transparent",
        x: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    row.addEventListener("mouseenter", handleMouseEnter);
    row.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      row.removeEventListener("mouseenter", handleMouseEnter);
      row.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <tr
      ref={rowRef}
      className="event-row border-b border-white/10 transition-colors cursor-default"
    >
      <td className="py-3 px-2 sm:px-4 md:px-6 text-sm sm:text-base md:text-xl text-white text-center wrap-break-word whitespace-normal">
        {event.name}
      </td>
      <td className="py-3 px-2 sm:px-4 md:px-6 text-sm sm:text-base md:text-xl text-white/80 text-center wrap-break-word whitespace-normal">
        {event.time || "To be declared"}
      </td>
      <td className="py-3 px-2 sm:px-4 md:px-6 text-sm sm:text-base md:text-xl text-white/80 text-center wrap-break-word whitespace-normal">
        {event.venue || "To be declared"}
      </td>
    </tr>
  );
});

/* =======================
   DAY SECTION COMPONENT
======================= */

const DaySection = memo(function DaySection({
  daySchedule,
  index,
  totalDays
}: {
  daySchedule: DaySchedule;
  index: number;
  totalDays: number;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const dayNumberRef = useRef<HTMLHeadingElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Desktop Animations
      if (dayNumberRef.current) {
        gsap.fromTo(
          dayNumberRef.current,
          { opacity: 0, scale: 0.3, rotateX: -90 },
          {
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (tableRef.current) {
        const direction = index % 2 === 0 ? -50 : 50;
        gsap.fromTo(
          tableRef.current,
          { opacity: 0, x: direction },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );

        const rows = tableRef.current.querySelectorAll(".event-row");
        gsap.fromTo(
          rows,
          { opacity: 0, x: direction * 0.5 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
            delay: 0.3,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    mm.add("(max-width: 767px)", () => {
      // Mobile Animations - Simplified
      if (dayNumberRef.current) {
        gsap.fromTo(
          dayNumberRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      if (tableRef.current) {
        gsap.fromTo(
          tableRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });

    return () => mm.revert();
  }, [index]);

  return (
    <div
      id={`day-${daySchedule.day}`}
      ref={sectionRef}
      className="day-section max-w-7xl mx-auto px-4 space-y-8 md:space-y-12 relative"
    >
      {/* Connecting line to next section - Hidden on small mobile */}
      {index < totalDays - 1 && (
        <div
          ref={lineRef}
          className="absolute left-1/2 -translate-x-1/2 top-full w-[2px] h-12 md:h-40 bg-linear-to-b from-red-600 to-transparent hidden sm:block"
        />
      )}

      {/* Day heading */}
      <h2
        ref={dayNumberRef}
        className="text-[clamp(2.5rem,15vw,120px)] text-center leading-none tracking-wide text-red-600 font-joker"
        style={{ perspective: "1000px" }}
      >
        day {daySchedule.day}
      </h2>

      {/* Table Container for horizontal scroll if needed */}
      <div className="w-full overflow-x-auto rounded-lg bg-black/30 backdrop-blur-sm border border-white/10">
        <table
          ref={tableRef}
          className="w-full min-w-[300px] table-fixed font-roboto"
        >
          <thead>
            <tr className="border-b border-white/20">
              <th className="py-4 px-2 sm:px-4 text-[clamp(10px,3vw,14px)] uppercase tracking-widest text-white/50 text-center font-bold">
                Event
              </th>
              <th className="py-4 px-2 sm:px-4 text-[clamp(10px,3vw,14px)] uppercase tracking-widest text-white/50 text-center font-bold">
                Time
              </th>
              <th className="py-4 px-2 sm:px-4 text-[clamp(10px,3vw,14px)] uppercase tracking-widest text-white/50 text-center font-bold">
                Venue
              </th>
            </tr>
          </thead>

          <tbody>
            {daySchedule.events.map((event, i) => (
              <EventRow key={i} event={event} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

/* =======================
   MAIN COMPONENT
======================= */

export default function TimelineContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch("/api/timeline");
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch schedule");
        }
        const data = await res.json();
        setSchedule(data);
      } catch (error: any) {
        console.error("Error loading timeline:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, []);

  useEffect(() => {
    if (!loading && schedule.length > 0) {
      const hash = window.location.hash;
      if (hash) {
        // slight delay to ensure DOM is ready
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 100);
      }
    }
  }, [loading, schedule]);

  useEffect(() => {
    if (loading || schedule.length === 0 || !containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Refresh ScrollTrigger to account for new content height
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // Title animation
      if (titleRef.current) {
        const text = titleRef.current.textContent || "";
        titleRef.current.innerHTML = "";

        text.split("").forEach((char) => {
          const span = document.createElement("span");
          span.className = "inline-block";
          span.textContent = char === " " ? "\u00A0" : char;
          titleRef.current?.appendChild(span);
        });

        gsap.fromTo(
          titleRef.current.querySelectorAll("span"),
          {
            opacity: 0,
            y: 50,
            rotateZ: gsap.utils.random(-20, 20),
          },
          {
            opacity: 1,
            y: 0,
            rotateZ: 0,
            duration: 0.6,
            ease: "back.out(1.7)",
            stagger: 0.05,
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loading, schedule]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-cover bg-center bg-no-repeat overflow-x-hidden"
      style={{ backgroundImage: "url('/images_timeline/bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 pt-14 md:pt-24 pb-16 md:pb-32 text-center">
          <h1
            ref={titleRef}
            className="text-3xl sm:text-4xl md:text-7xl lg:text-9xl tracking-wide text-white font-joker"
          >
            timeline
          </h1>
        </div>

        {/* Timeline */}
        <div className="space-y-20 sm:space-y-24 md:space-y-40 pb-20 md:pb-32">
          {loading ? (
            <div className="flex h-40 md:h-80 items-center justify-center">
              <h2 className="text-white/40 font-joker text-2xl md:text-3xl animate-pulse">Loading Schedule...</h2>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center text-xl font-mono bg-black/50 p-4 rounded">
              Error: {error}. Check console for details.
            </div>
          ) : schedule.length === 0 ? (
            <div className="flex h-[40vh] items-center justify-center">
              <h2 className="text-white/60 font-joker text-3xl sm:text-5xl md:text-7xl uppercase tracking-widest text-center shadow-lg transform -rotate-2">
                To Be Declared
              </h2>
            </div>
          ) : (
            schedule.map((daySchedule, index) => (
              <DaySection
                key={daySchedule.day}
                daySchedule={daySchedule}
                index={index}
                totalDays={schedule.length}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
