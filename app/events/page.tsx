"use client";

import React, { useState, useCallback, memo, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Footer from "@/components/ui/Footer";

import { useNavigationState } from "@/lib/useNavigationState";
import { useImagePreload } from "@/hooks/useImagePreload";
import { useEventCategories } from "@/hooks/useEvents";
import { generateSlug } from "@/types/events";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

type CategoryItem = {
    slug: string;
    title: string;
    cover: string;
    category_id: number;
};

// Loading skeleton for cards
const CardSkeleton = memo(function CardSkeleton() {
    return (
        <div className="relative w-[110px] xs:w-[130px] sm:w-[180px] md:w-[220px] lg:w-[260px] xl:w-[320px] 2xl:w-[400px] aspect-[401/600] bg-gray-800 rounded-lg animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
    );
});

export default function EventsPage() {
    const router = useRouter();
    const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
    const { startTransition } = useNavigationState();
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);

    // Fetch categories from backend using Supabase
    const { categories, loading, error } = useEventCategories();

    useImagePreload("/top.jpg");

    // Transform categories to display format
    const CATEGORIES: CategoryItem[] = useMemo(() => {
        if (!categories || categories.length === 0) {
            return [];
        }

        return categories.map((category) => ({
            slug: generateSlug(category.category_name),
            title: category.category_name.toUpperCase(),
            cover: category.category_image || "/images_events/default.png",
            category_id: category.category_id,
        }));
    }, [categories]);

    // Entrance animations
    useEffect(() => {
        if (!containerRef.current || loading) return;

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion) return;

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
                        y: 80,
                        rotateY: -90,
                        scale: 0,
                    },
                    {
                        opacity: 1,
                        y: 0,
                        rotateY: 0,
                        scale: 1,
                        duration: 0.6,
                        ease: "back.out(2)",
                        stagger: 0.05,
                        delay: 0.8,
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, [loading]);

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
            if (prev.size === CATEGORIES.length) {
                return new Set();
            }
            return new Set(CATEGORIES.map((e) => e.slug));
        });
    }, [CATEGORIES]);

    const allRevealed = useMemo(() => revealedCards.size === CATEGORIES.length, [revealedCards.size, CATEGORIES.length]);

    return (
        <div ref={containerRef}>


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
                    <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/60 to-black" />
                </section>

                <section className="relative py-10">
                    <h1
                        ref={titleRef}
                        className="text-center text-[3rem] sm:text-[4.5rem] lg:text-8xl tracking-[0.2em] sm:tracking-[0.25em] lg:tracking-[0.3em] lowercase font-joker relative z-10"
                    >
                        events
                    </h1>

                    {CATEGORIES.length > 0 && (
                        <div className="absolute flex flex-col items-end right-4 sm:right-9 lg:right-15 top-[90%] mt-4 mb-8 sm:mt-6 text-right leading-snug select-none font-jqka z-10">
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
                    )}
                </section>

                {/* CARDS */}
                <section className="px-4 py-20">
                    {loading ? (
                        // Loading state with skeletons
                        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <React.Fragment key={index}>
                                    <div className="flex justify-center items-center h-full">
                                        <CardSkeleton />
                                    </div>
                                    {index !== 4 && <div className="h-full" />}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : CATEGORIES.length === 0 ? (
                        // No categories state
                        <div className="text-center py-20">
                            <p className="text-gray-400 text-xl mb-4">No event categories found</p>
                            {error && <p className="text-red-500 text-sm">{error}</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                            {CATEGORIES.map((category, index) => {
                                const isFlipped = revealedCards.has(category.slug);

                                return (
                                    <React.Fragment key={category.category_id}>
                                        <div className="flex justify-center items-center h-full">
                                            <div
                                                onMouseEnter={() => revealCard(category.slug)}
                                                className="relative cursor-pointer transform-gpu"
                                                style={{ perspective: "1500px" }}
                                            >
                                                {/* CARD FRAME — responsive sizing */}
                                                <div className="relative w-[110px] xs:w-[130px] sm:w-[180px] md:w-[220px] lg:w-[260px] xl:w-[320px] 2xl:w-[400px] aspect-[401/600]">
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
                                                                backgroundImage: "url(/images_events/card.jpeg)",
                                                                backgroundRepeat: "no-repeat",
                                                                backgroundPosition: "center",
                                                                backgroundSize: "contain",
                                                                backgroundOrigin: "content-box",
                                                                backgroundClip: "content-box",
                                                            }}
                                                        />

                                                        {/* BACK */}
                                                        <div
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleCardClick(category.slug);
                                                            }}
                                                            className="absolute inset-0 rounded-lg overflow-hidden cursor-pointer"
                                                            style={{
                                                                backfaceVisibility: "hidden",
                                                                transform: "rotateY(180deg)",
                                                                backgroundImage: `url(${category.cover})`,
                                                                backgroundRepeat: "no-repeat",
                                                                backgroundPosition: "center",
                                                                backgroundSize: "cover",
                                                                backgroundOrigin: "content-box",
                                                                backgroundClip: "content-box",
                                                            }}
                                                        >
                                                            <div className="absolute inset-0 bg-linear-to-b from-black/0 via-black/60 to-black" />
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
                                                                {category.title}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* EMPTY COLUMN — cross layout pattern */}
                                        {index !== CATEGORIES.length - 1 && <div className="h-full" />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    )}
                </section>

                <Footer />
            </main>
        </div>
    );
}
