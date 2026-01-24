"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useRef, useEffect, useCallback, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigationState } from "@/lib/useNavigationState";
import { generateSlug, EventWithRelations } from "@/types/events";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Memoized card component with tilt effect
const EventCardItem = memo(function EventCardItem({
  event,
  index,
  onRegister,
}: {
  event: EventWithRelations;
  index: number;
  onRegister: () => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);



  // 3D tilt effect on hover
  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      gsap.to(card, {
        rotateX,
        rotateY,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
        transformPerspective: 1000,
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x - rect.width / 2,
          y: y - rect.height / 2,
          opacity: 0.15,
          duration: 0.3,
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.5,
        ease: "power3.out",
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 0,
          duration: 0.3,
        });
      }
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Check if registration is closed
  const isRegistrationClosed = event.is_registration_open === false;

  // Event description - split by newlines or use as single item
  const descriptionLines = event.description
    ? event.description.split('\n').filter(line => line.trim())
    : ['Event details coming soon.'];

  return (
    <article
      ref={cardRef}
      className="event-card bg-[#111] w-[500px] rounded-sm overflow-hidden flex flex-col relative"
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {/* Glow effect overlay */}
      <div
        ref={glowRef}
        className="absolute w-[300px] h-[300px] rounded-full bg-red-500 blur-[100px] pointer-events-none opacity-0 z-10"
        style={{ transform: "translate(-50%, -50%)" }}
      />

      {/* Registration Status Badge */}
      {event.is_registration_open !== undefined && (
        <div className={`absolute top-4 right-4 z-30 px-3 py-1 rounded-full text-xs font-medium ${event.is_registration_open
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
          {event.is_registration_open ? 'Open' : 'Closed'}
        </div>
      )}

      {/* DAU Free Badge */}
      {event.is_dau_free && (
        <div className="absolute top-4 left-4 z-30 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          DAU Free
        </div>
      )}

      {/* IMAGE */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={event.event_picture || "/images_events/default.png"}
          alt={event.event_name}
          fill
          sizes="(max-width: 640px) 100vw, 500px"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover-shine" />
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col gap-3 flex-1 relative z-20">
        <h2 className="font-adventor text-[50px] md:text-[60px] leading-tight">{event.event_name}</h2>

        <p className="text-sm text-[#c0c0c0] leading-relaxed event-card-desc">
          {descriptionLines.slice(0, 3).map((line, i) => (
            <span key={i} className="block overflow-hidden">
              <span className="block desc-line translate-y-full opacity-0">
                {line}
              </span>
            </span>
          ))}
        </p>
      </div>

      {/* FOOTER */}
      <div className="p-5 pt-0 relative z-20">
        <button
          onClick={onRegister}
          disabled={isRegistrationClosed}
          className={`
            register-btn
            w-full h-[52px]
            flex items-center justify-center gap-2
            font-jqka
            text-2xl md:text-3xl
            transition-all duration-300 rounded-sm
            relative overflow-hidden
            group
            ${isRegistrationClosed
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-white text-black hover:bg-[#b41c32] hover:text-white cursor-pointer'
            }
          `}
        >
          {!isRegistrationClosed && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          )}
          <span className="relative z-10">
            {isRegistrationClosed ? 'Coming Soon' : 'Register'}
          </span>
        </button>
      </div>
    </article>
  );
});

interface EventCardsProps {
  events: EventWithRelations[];
  categorySlug: string;
}

export default function EventCards({ events, categorySlug }: EventCardsProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { startTransition } = useNavigationState();

  const handleRegisterClick = useCallback(
    (event: EventWithRelations) => {
      if (event.is_registration_open === false) {
        return;
      }

      startTransition();
      const eventSlug = generateSlug(event.event_name);
      router.push(`/events/${categorySlug}/${eventSlug}`);
    },
    [startTransition, router, categorySlug]
  );

  // Staggered entrance animation
  useEffect(() => {
    if (!containerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const cards = containerRef.current?.querySelectorAll(".event-card");
      if (!cards?.length) return;

      gsap.set(cards, {
        opacity: 0,
        y: 100,
        rotateX: -15,
        scale: 0.9,
      });

      gsap.to(cards, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.4)",
        stagger: {
          each: 0.15,
          from: "start",
        },
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play reverse play reverse",
        },
      });

      // Button pulse animation
      const buttons = containerRef.current?.querySelectorAll(".register-btn:not(:disabled)");
      buttons?.forEach((btn, i) => {
        gsap.fromTo(
          btn,
          { boxShadow: "0 0 0 0 rgba(180, 28, 50, 0)" },
          {
            boxShadow: "0 0 20px 5px rgba(180, 28, 50, 0.3)",
            duration: 1.5,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: i * 0.2,
          }
        );
      });

      // Description text reveal
      const descLines = containerRef.current?.querySelectorAll(".desc-line");
      if (descLines?.length) {
        gsap.to(descLines, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 70%",
            toggleActions: "play reverse play reverse",
          }
        });
      }

    }, containerRef);

    return () => ctx.revert();
  }, [events]);

  return (
    <section className="px-4 sm:px-10 lg:px-24 pb-32" ref={containerRef}>
      <div className="flex justify-center gap-x-16 lg:gap-x-20 gap-y-26 flex-wrap">
        {events.map((event, idx) => (
          <EventCardItem
            key={event.event_id}
            event={event}
            index={idx}
            onRegister={() => handleRegisterClick(event)}
          />
        ))}
      </div>
    </section>
  );
}
