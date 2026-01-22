"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import Image from "next/image";

const artistData = [
  {
    day: "DAY 01",
    tag: "HEART",
    artist: "ADITYA GADHAVI",
    description: "THE VOICE THAT CARRIES GUJARAT'S SOUL AND STORIES, READY TO ECHO ACROSS THE NIGHT.",
    image: "/images_home/AdityaGadhvi.jpeg",
    hexColor: "#FE431F",
  },
  {
    day: "DAY 02",
    tag: "SOUL",
    artist: "MOHIT CHAUHAN",
    description: "A LEGENDARY VOICE THAT HAS DEFINED ROMANCE AND SOUL IN INDIAN MUSIC FOR DECADES.",
    image: "/images_home/MohitChauhan.jpg",
    hexColor: "#317D5F",
  },
  {
    day: "DAY 03",
    tag: "VIBE",
    artist: "SHAAN",
    description: "THE MOST VERSATILE VOICE THAT BRINGS UNMATCHED ENERGY AND JOY TO EVERY PERFORMANCE.",
    image: "/images_home/Shaan.jpg",
    hexColor: "#0A7CC1",
  },
  {
    day: "DAY 04",
    tag: "BASS",
    artist: "DJ SARTEK",
    description: "THE MAN WHO HAS BEEN ROCKING THE DANCE FLOORS ACROSS THE GLOBE WITH HIS INFECTIOUS BEATS.",
    image: "/images_home/DJSartek.jpg",
    hexColor: "#DDB100",
  },
];

export default function ArtistCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);

  const total = artistData.length;

  // Calculate card positions
  const getCardPosition = useCallback((index: number, active: number) => {
    let diff = index - active;
    
    // Wrap around for infinite effect
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    return diff;
  }, [total]);

  // Animate cards to their positions
  const animateCards = useCallback((newIndex: number, direction: 1 | -1 = 1) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? window.innerWidth * 0.85 : Math.min(window.innerWidth * 0.7, 800);
    const spacing = isMobile ? cardWidth * 0.15 : cardWidth * 0.12;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, newIndex);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      // Calculate visual properties
      let scale = 1;
      let opacity = 1;
      let zIndex = 10;
      let rotateY = 0;

      if (position === 0) {
        // Center card
        scale = 1;
        opacity = 1;
        zIndex = 20;
        rotateY = 0;
      } else if (absPosition === 1) {
        // Adjacent cards
        scale = isMobile ? 0.75 : 0.85;
        opacity = isMobile ? 0.5 : 0.7;
        zIndex = 15;
        rotateY = position > 0 ? -15 : 15;
      } else {
        // Far cards
        scale = 0.6;
        opacity = 0;
        zIndex = 5;
        rotateY = position > 0 ? -25 : 25;
      }

      // Animate with GSAP
      gsap.to(card, {
        x: xOffset,
        scale,
        opacity,
        rotateY,
        zIndex,
        duration: 0.8,
        ease: "power3.out",
        onComplete: () => {
          if (index === newIndex) {
            isAnimatingRef.current = false;
          }
        },
      });

      // Animate the inner content
      const content = card.querySelector(".card-content");
      if (content && position === 0) {
        gsap.fromTo(content,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
        );
      }
    });
  }, [getCardPosition, total]);

  // Go to next slide
  const nextSlide = useCallback(() => {
    const newIndex = (currentIndex + 1) % total;
    setCurrentIndex(newIndex);
    animateCards(newIndex, 1);
  }, [currentIndex, total, animateCards]);

  // Go to specific slide
  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isAnimatingRef.current) return;
    const direction = index > currentIndex ? 1 : -1;
    setCurrentIndex(index);
    animateCards(index, direction as 1 | -1);
    resetAutoPlay();
  }, [currentIndex, animateCards]);

  // Auto-play functionality
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }

    autoPlayRef.current = gsap.to({}, {
      duration: 5,
      repeat: -1,
      onRepeat: nextSlide,
    });
  }, [nextSlide]);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }
    startAutoPlay();
  }, [startAutoPlay]);

  // Initialize carousel
  useEffect(() => {
    // Set initial positions without animation
    const isMobile = window.innerWidth < 768;
    const cardWidth = isMobile ? window.innerWidth * 0.85 : Math.min(window.innerWidth * 0.7, 800);
    const spacing = isMobile ? cardWidth * 0.15 : cardWidth * 0.12;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, 0);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      let scale = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.75 : 0.85) : 0.6;
      let opacity = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.5 : 0.7) : 0;
      let zIndex = position === 0 ? 20 : absPosition === 1 ? 15 : 5;
      let rotateY = position === 0 ? 0 : position > 0 ? -15 : 15;

      gsap.set(card, { x: xOffset, scale, opacity, rotateY, zIndex });
    });

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        autoPlayRef.current.kill();
      }
    };
  }, [getCardPosition, startAutoPlay]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      animateCards(currentIndex, 1);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [currentIndex, animateCards]);

  return (
    <section className="relative bg-black overflow-hidden py-12 md:py-20">
      {/* Section Title */}
      <h2 className="font-joker text-[clamp(2.5rem,10vw,6rem)] text-white text-center mb-8 md:mb-12 lowercase">
        Pronite Artists
      </h2>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center"
        style={{
          height: "clamp(400px, 70vh, 650px)",
          perspective: "1500px",
        }}
      >
        {artistData.map((data, index) => (
          <div
            key={index}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform"
            onClick={() => goToSlide(index)}
            style={{
              width: "clamp(280px, 85vw, 800px)",
              height: "clamp(350px, 60vh, 550px)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Card */}
            <div
              className="w-full h-full rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: data.hexColor }}
            >
              <div className="relative w-full h-full p-6 md:p-10 flex flex-col text-white">
                {/* Vertical Text - Left Side */}
                <div className="absolute left-4 md:left-6 top-8 flex flex-col justify-between h-[calc(100%-64px)] pointer-events-none">
                  <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-sm md:text-lg tracking-[0.2em] font-black">
                    {data.day}
                  </span>
                  <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-sm md:text-lg tracking-[0.3em] font-black opacity-60">
                    {data.tag}
                  </span>
                </div>

                {/* Content Area */}
                <div className="card-content ml-10 md:ml-16 flex flex-col h-full">
                  {/* Artist Info */}
                  <div className="mb-4 md:mb-6 shrink-0">
                    <h3 className="text-2xl sm:text-3xl md:text-5xl font-black font-jqka tracking-tight mb-2 leading-none uppercase">
                      {data.artist}
                    </h3>
                    <p className="text-[10px] sm:text-xs md:text-sm max-w-md opacity-80 font-jqka font-bold leading-tight tracking-tight uppercase">
                      {data.description}
                    </p>
                  </div>

                  {/* Image Area */}
                  <div className="relative flex-1 min-h-0 mr-0 md:mr-2 rounded-xl md:rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-black/20">
                    <Image
                      src={data.image}
                      alt={data.artist}
                      fill
                      sizes="(max-width: 768px) 85vw, 800px"
                      className="object-cover"
                      priority={index === 0}
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Indicators */}
      <div className="flex justify-center gap-3 mt-8 md:mt-12">
        {artistData.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ease-out ${
              index === currentIndex
                ? "bg-white w-10"
                : "bg-white/30 hover:bg-white/50 w-2"
            }`}
            aria-label={`Go to ${artistData[index].artist}`}
          />
        ))}
      </div>
    </section>
  );
}
