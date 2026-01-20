"use client";

import React, { useState, useCallback, memo, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Footer from "@/components/ui/Footer";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { Navbar } from "@/components/ui/Resizable-navbar";
import { useNavigationState } from "@/lib/useNavigationState";
import { useImagePreload } from "@/hooks/useImagePreload";

type EventItem = {
    slug: string;
    title: string;
    cover: string;
};

const EVENTS: EventItem[] = [
    { slug: "dance", title: "DANCE EVENT", cover: "/images_events/dance.png" },
    { slug: "fashion", title: "Fashion Show", cover: "/images_events/fashionshow.png" },
    { slug: "music", title: "MUSIC EVENT", cover: "/images_events/music.png" },
    { slug: "theatre", title: "THEATRE SHOW", cover: "/images_events/theatre.png" },
    { slug: "gaming", title: "GAMING EVENT", cover: "/images_events/gaming.png" },
];

// Memoized event card component
const EventCard = memo(function EventCard({
    event,
    isFlipped,
    onReveal,
    onClick,
}: {
    event: EventItem;
    isFlipped: boolean;
    onReveal: () => void;
    onClick: () => void;
}) {
    return (
        <div
            onMouseEnter={onReveal}
            className="relative cursor-pointer transform-gpu will-change-transform"
            style={{ perspective: "1500px" }}
        >
            {/* CARD FRAME — responsive sizing */}
            <div className="relative w-[110px] xs:w-[130px] sm:w-[180px] md:w-[220px] lg:w-[260px] xl:w-[320px] 2xl:w-[400px] aspect-[457/640]">
                <div
                    className="relative w-full h-full transition-transform ease-in-out"
                    style={{
                        transformStyle: "preserve-3d",
                        transitionDuration: "900ms",
                        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    }}
                >
                    {/* FRONT */}
                    <div
                        className="absolute inset-0 rounded-lg overflow-hidden"
                        style={{ backfaceVisibility: "hidden" }}
                    >
                        <Image
                            src="/images_events/card.png"
                            alt="Card back"
                            fill
                            sizes="(max-width: 640px) 110px, (max-width: 768px) 180px, (max-width: 1024px) 220px, (max-width: 1280px) 260px, 400px"
                            className="object-contain"
                            loading="lazy"
                        />
                    </div>

                    {/* BACK */}
                    <div
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isFlipped) onClick();
                        }}
                        className="absolute inset-0 rounded-lg overflow-hidden cursor-pointer"
                        style={{
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                        }}
                    >
                        <Image
                            src={event.cover}
                            alt={event.title}
                            fill
                            sizes="(max-width: 640px) 110px, (max-width: 768px) 180px, (max-width: 1024px) 220px, (max-width: 1280px) 260px, 400px"
                            className="object-cover"
                            loading="lazy"
                        />
                        {/* TITLE */}
                        <div
                            className="
                                absolute bottom-2 xs:bottom-2 sm:bottom-3 md:bottom-4 lg:bottom-5 xl:bottom-7 2xl:bottom-9
                                left-0 right-0
                                px-1.5 xs:px-2 sm:px-3 md:px-4 lg:px-5 xl:px-7 2xl:px-8
                                font-card
                                text-[9px] xs:text-[10px] sm:text-[14px] md:text-[17px] lg:text-[20px] xl:text-[26px] 2xl:text-[32px]
                                text-white text-center
                                leading-tight
                            "
                        >
                            {event.title}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default function EventsPage() {
    const router = useRouter();
    const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
    const { startTransition } = useNavigationState();

    // Block transition until this image is loaded
    useImagePreload("/top.jpg");

    const handleCardClick = useCallback((slug: string) => {
        startTransition();
        router.push(`/events/${slug}`);
    }, [startTransition, router]);

    const revealCard = useCallback((slug: string) => {
        setRevealedCards((prev) => {
            if (prev.has(slug)) return prev;
            const newSet = new Set(prev);
            newSet.add(slug);
            return newSet;
        });
    }, []);

    const toggleRevealAll = useCallback(() => {
        setRevealedCards((prev) => {
            if (prev.size === EVENTS.length) {
                return new Set();
            }
            return new Set(EVENTS.map((e) => e.slug));
        });
    }, []);

    const allRevealed = useMemo(() => revealedCards.size === EVENTS.length, [revealedCards.size]);

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

                    <div className="absolute flex flex-col items-end right-4 sm:right-9 lg:right-15 top-[90%] mt-4 mb-8 sm:mt-6 text-right leading-snug select-none font-jqka">
                        <button
                            onClick={toggleRevealAll}
                            className="self-end text-xs sm:text-base md:text-lg opacity-60 hover:opacity-100 transition-opacity"
                            aria-label={allRevealed ? "Hide all cards" : "Reveal all cards"}
                        >
                            👁 Reveal / Unreveal all
                        </button>

                        <div className="text-xs sm:text-base md:text-lg opacity-60 mb-3 flex">
                            <span className="hidden md:flex">Hover to reveal •</span> Click to explore
                        </div>
                    </div>
                </section>

                {/* CARDS */}
                <section className="px-4 py-20">
                    <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                        {EVENTS.map((event, index) => {
                            const isFlipped = revealedCards.has(event.slug);

                            return (
                                <React.Fragment key={event.slug}>
                                    <div className="flex justify-center items-center h-full">
                                        <EventCard
                                            event={event}
                                            isFlipped={isFlipped}
                                            onReveal={() => revealCard(event.slug)}
                                            onClick={() => handleCardClick(event.slug)}
                                        />
                                    </div>

                                    {/* EMPTY COLUMN — cross layout pattern */}
                                    {index !== EVENTS.length - 1 && <div className="h-full" />}
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
