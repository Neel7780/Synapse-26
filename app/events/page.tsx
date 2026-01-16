"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { Navbar } from "@/components/ui/Resizable-navbar";

type EventItem = {
  slug: string;
  title: string;
  cover: string;
};

const EVENTS: EventItem[] = [
  { slug: "dance", title: "DANCE EVENT", cover: "/images_events/dance.png" },
  {
    slug: "fashion",
    title: "Fashion Show",
    cover: "/images_events/fashionshow.png",
  },
  { slug: "music", title: "MUSIC EVENT", cover: "/images_events/music.png" },
  {
    slug: "theatre",
    title: "THEATRE SHOW",
    cover: "/images_events/theatre.png",
  },
  { slug: "gaming", title: "GAMING EVENT", cover: "/images_events/gaming.png" },
];

export default function EventsPage() {
  const router = useRouter();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [revealAll, setRevealAll] = useState(false);

  const handleCardClick = (slug: string) => {
    if (!revealed[slug]) {
      setRevealed((p) => ({ ...p, [slug]: true }));
      return;
    }
    router.push(`/events/${slug}`);
  };

  const toggleRevealAll = () => {
    const next = !revealAll;
    setRevealAll(next);

    if (next) {
      const map: Record<string, boolean> = {};
      EVENTS.forEach((e) => (map[e.slug] = true));
      setRevealed(map);
    } else {
      setRevealed({});
    }
  };

  return (
    <>
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      <main className="bg-black text-white overflow-x-hidden">
        <section className="relative h-[45dvh] w-full">
          <Image
            src="/top.jpg"
            alt="Events"
            fill
            priority
            sizes="100vw"
            className="object-cover grayscale object-[50%_85%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/60 to-black" />
        </section>

        <section className="relative py-10">
          <h1 className="text-center text-[3rem] sm:text-[4.5rem] lg:text-8xl tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] lowercase font-joker">
            events
          </h1>

          <div className=" absolute right-4 sm:right-6 lg:right-10 top-full mt-4 sm:mt-6 text-right leading-snug select-none font-joker ">
            <button
              onClick={toggleRevealAll}
              className=" block text-[10px] sm:text-xs md:text-sm opacity-80 hover:opacity-100 transition-opacity "
            >
              👁 Reveal / Unreveal all
            </button>

            <div className=" mt-1 text-[9px] sm:text-[10px] md:text-xs opacity-60 ">
              Tap on card to reveal
            </div>
          </div>
        </section>

        {/* CARDS */}
        <section className="px-4 sm:px-10 lg:px-24 py-20 sm:py-28 lg:py-40">
          <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-0 md:gap-x-6 lg:gap-x-10 gap-y-16 md:gap-y-12 lg:gap-y-4">
            {EVENTS.map((event, index) => {
              const isFlipped = revealAll || revealed[event.slug];

              return (
                <React.Fragment key={event.slug}>
                  <div className="flex justify-center">
                    <div
                      onClick={() => handleCardClick(event.slug)}
                      className={`relative cursor-pointer transform-gpu  ${
                        isFlipped ? "group" : ""
                      }`}
                      style={{ perspective: "1500px" }}
                    >
                      {/* CARD FRAME — driven by PNG ratio */}
                      <div
                        className="
    relative
    w-[200px]
    sm:w-[320px]
    md:w-[280px]
    lg:w-[340px]
    xl:w-[420px]
    aspect-[457/640]
  "
                      >
                        <div
                          className="relative w-full h-full transition-transform ease-in-out"
                          style={{
                            transformStyle: "preserve-3d",
                            transitionDuration: "900ms",
                            transform: isFlipped
                              ? "rotateY(180deg)"
                              : "rotateY(0deg)",
                          }}
                        >
                          {/* FRONT */}
                          <div
                            className="absolute inset-0 rounded-lg overflow-hidden"
                            style={{
                              backfaceVisibility: "hidden",
                              backgroundImage: "url(/images_events/card.png)",
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                              backgroundSize: "contain",
                              backgroundOrigin: "content-box",
                              backgroundClip: "content-box",
                            }}
                          />

                          {/* BACK */}
                          <div
                            className="absolute inset-0 rounded-lg overflow-hidden"
                            style={{
                              backfaceVisibility: "hidden",
                              transform: "rotateY(180deg)",
                              backgroundImage: `url(${event.cover})`,
                              backgroundRepeat: "no-repeat",
                              backgroundPosition: "center",
                              backgroundSize: "cover",
                              backgroundOrigin: "content-box",
                              backgroundClip: "content-box",
                            }}
                          >
                            {/* OVERLAY */}
                            <div
                              className="
                                absolute inset-0
                                bg-gradient-to-t
                                from-black/70 via-black/0 to-transparent
                                opacity-30 lg:opacity-0
                                transition-opacity duration-300
                                lg:group-hover:opacity-100
                              "
                            />

                            {/* TITLE */}
                            <div
                              className="
    absolute bottom-4 sm:bottom-6 lg:bottom-10
    left-0 right-0
    px-4 sm:px-6 lg:px-8
    font-card
    text-[18px] sm:text-[22px] md:text-[26px] lg:text-[32px]
    text-white text-center
    opacity-100 lg:opacity-0
    transition-opacity duration-300
    pointer-events-none
    lg:group-hover:opacity-100
    leading-tight
  "
                            >
                              {event.title}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* EMPTY COLUMN — desktop cross layout only */}
                  {index !== EVENTS.length - 1 && (
                    <div className="hidden lg:block" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
