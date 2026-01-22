"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<gsap.core.Tween | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isAnimatingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const mouseX = useRef(0);
  const mouseY = useRef(0);

  const total = artistData.length;

  // Calculate card positions with modern spacing
  const getCardPosition = useCallback((index: number, active: number) => {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }, [total]);

  // Modern GSAP animation with timeline
  const animateCards = useCallback((newIndex: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Kill previous timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const cardWidth = isMobile 
      ? window.innerWidth * 0.92 
      : isTablet 
        ? Math.min(window.innerWidth * 0.78, 750)
        : Math.min(window.innerWidth * 0.68, 950);
    const spacing = isMobile ? cardWidth * 0.18 : cardWidth * 0.14;

    // Create master timeline
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
      }
    });

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, newIndex);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      // Modern visual properties
      const scale = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.72 : 0.85) : 0.58;
      const opacity = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.35 : 0.6) : 0;
      const zIndex = position === 0 ? 40 : absPosition === 1 ? 25 : 10;
      const rotateY = position === 0 ? 0 : position > 0 ? -10 : 10;
      const rotateX = position === 0 ? 0 : 2;
      const blur = position === 0 ? 0 : absPosition === 1 ? 3 : 6;
      const brightness = position === 0 ? 1 : absPosition === 1 ? 0.65 : 0.4;
      const yOffset = position === 0 ? 0 : Math.abs(position) * 20;

      // Animate card with modern easing
      tl.to(card, {
        x: xOffset,
        y: yOffset,
        scale,
        opacity,
        rotateY,
        rotateX,
        zIndex,
        filter: `blur(${blur}px) brightness(${brightness})`,
        duration: 1.2,
        ease: "power4.out",
      }, position === 0 ? 0 : 0.1);

      // Animate inner elements with stagger
      if (position === 0) {
        const content = card.querySelector(".card-content");
        const image = card.querySelector(".card-image");
        const dayTag = card.querySelector(".day-tag");
        const artistName = card.querySelector(".artist-name");
        const description = card.querySelector(".artist-description");
        const bgGradient = card.querySelector(".bg-gradient");

        // Reset and animate
        gsap.set([content, image, dayTag, artistName, description], { 
          opacity: 0,
          y: 40,
        });

        tl.to(bgGradient, {
          opacity: 0.25,
          duration: 0.8,
          ease: "power2.out",
        }, 0.2);

        tl.to(dayTag, {
          opacity: 1,
          x: 0,
          duration: 0.7,
          ease: "back.out(1.4)",
        }, 0.3);

        tl.to(artistName, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
        }, 0.4);

        tl.to(description, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }, 0.5);

        tl.to(image, {
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }, 0.6);

        tl.to(content, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }, 0.6);
      }
    });

    timelineRef.current = tl;
  }, [getCardPosition]);

  // Auto-play with modern timing
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }

    autoPlayRef.current = gsap.to({}, {
      duration: 7,
      repeat: -1,
      onRepeat: () => {
        if (!isHovered && !isAnimatingRef.current) {
          const newIndex = (currentIndex + 1) % total;
          setCurrentIndex(newIndex);
          animateCards(newIndex);
        }
      },
    });
  }, [currentIndex, total, animateCards, isHovered]);

  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }
    if (!isHovered) {
      startAutoPlay();
    }
  }, [startAutoPlay, isHovered]);

  // Navigation
  const nextSlide = useCallback(() => {
    if (isAnimatingRef.current) return;
    const newIndex = (currentIndex + 1) % total;
    setCurrentIndex(newIndex);
    animateCards(newIndex);
    resetAutoPlay();
  }, [currentIndex, total, animateCards, resetAutoPlay]);

  const prevSlide = useCallback(() => {
    if (isAnimatingRef.current) return;
    const newIndex = (currentIndex - 1 + total) % total;
    setCurrentIndex(newIndex);
    animateCards(newIndex);
    resetAutoPlay();
  }, [currentIndex, total, animateCards, resetAutoPlay]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex || isAnimatingRef.current) return;
    setCurrentIndex(index);
    animateCards(index);
    resetAutoPlay();
  }, [currentIndex, animateCards, resetAutoPlay]);

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const swipeThreshold = 50;
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoPlay();
    }
  };

  // Mouse parallax effect
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.current = (e.clientX - centerX) / rect.width;
    mouseY.current = (e.clientY - centerY) / rect.height;

    // Apply parallax to active card
    const activeCard = cardsRef.current[currentIndex];
    if (activeCard && !isAnimatingRef.current) {
      gsap.to(activeCard, {
        rotateY: mouseX.current * 5,
        rotateX: -mouseY.current * 3,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [currentIndex]);

  // Initialize carousel
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const cardWidth = isMobile 
      ? window.innerWidth * 0.92 
      : isTablet 
        ? Math.min(window.innerWidth * 0.78, 750)
        : Math.min(window.innerWidth * 0.68, 950);
    const spacing = isMobile ? cardWidth * 0.18 : cardWidth * 0.14;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, 0);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      const scale = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.72 : 0.85) : 0.58;
      const opacity = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.35 : 0.6) : 0;
      const zIndex = position === 0 ? 40 : absPosition === 1 ? 25 : 10;
      const rotateY = position === 0 ? 0 : position > 0 ? -10 : 10;
      const blur = position === 0 ? 0 : absPosition === 1 ? 3 : 6;
      const brightness = position === 0 ? 1 : absPosition === 1 ? 0.65 : 0.4;

      gsap.set(card, { 
        x: xOffset, 
        scale, 
        opacity, 
        rotateY, 
        zIndex,
        filter: `blur(${blur}px) brightness(${brightness})`
      });
    });

    startAutoPlay();

    return () => {
      if (autoPlayRef.current) {
        autoPlayRef.current.kill();
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [getCardPosition, startAutoPlay]);

  // Handle hover state
  useEffect(() => {
    if (isHovered) {
      if (autoPlayRef.current) {
        autoPlayRef.current.pause();
      }
    } else {
      resetAutoPlay();
    }
  }, [isHovered, resetAutoPlay]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      animateCards(currentIndex);
    };

    const timeoutId = setTimeout(handleResize, 200);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentIndex, animateCards]);

  return (
    <section 
      className="relative bg-black overflow-hidden py-20 md:py-28 lg:py-36"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Modern Section Header */}
      <div className="text-center mb-16 md:mb-20 px-4">
        <div className="inline-block mb-6">
          <h2 className="font-joker text-[clamp(3.5rem,14vw,9rem)] text-white lowercase leading-[0.9] tracking-tight">
            Pronite Artists
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mt-4"></div>
        </div>
      </div>

      {/* Modern Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove}
        style={{
          height: "clamp(500px, 80vh, 750px)",
          perspective: "2500px",
        }}
      >
        <div 
          ref={wrapperRef}
          className="relative w-full h-full"
        >
          {artistData.map((data, index) => (
            <div
              key={index}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform"
              onClick={() => goToSlide(index)}
              style={{
                width: "clamp(320px, 92vw, 950px)",
                height: "clamp(450px, 70vh, 650px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Modern Card Design */}
              <div
                className="w-full h-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden relative group"
                style={{ 
                  backgroundColor: data.hexColor,
                  boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.1),
                    0 30px 60px -12px ${data.hexColor}50,
                    0 0 100px ${data.hexColor}30
                  `
                }}
              >
                {/* Animated background gradient */}
                <div 
                  className="absolute inset-0 bg-gradient opacity-20 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse at 40% 50%, rgba(255,255,255,0.4), transparent 60%)`
                  }}
                />

                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 pointer-events-none"></div>

                <div className="relative w-full h-full p-10 md:p-14 lg:p-18 flex flex-col text-white z-10">
                  {/* Modern Day & Tag */}
                  <div className="absolute left-8 md:left-12 top-12 md:top-14 flex flex-col gap-10 pointer-events-none day-tag">
                    <div className="flex flex-col gap-3">
                      <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-lg md:text-2xl tracking-[0.4em] font-black opacity-95">
                        {data.day}
                      </span>
                      <div className="w-0.5 h-12 bg-gradient-to-b from-white/50 to-transparent ml-1.5"></div>
                      <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-sm md:text-lg tracking-[0.5em] font-bold opacity-70">
                        {data.tag}
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="card-content ml-16 md:ml-24 lg:ml-28 flex flex-col h-full">
                    {/* Artist Info */}
                    <div className="mb-8 md:mb-10 shrink-0">
                      <h3 className="artist-name text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black font-jqka tracking-[-0.02em] mb-4 md:mb-5 leading-[0.85] uppercase">
                        {data.artist}
                      </h3>
                      <p className="artist-description text-sm sm:text-base md:text-lg max-w-xl md:max-w-2xl opacity-95 font-jqka font-medium leading-relaxed tracking-wide uppercase">
                        {data.description}
                      </p>
                    </div>

                    {/* Modern Image Area */}
                    <div className="relative flex-1 min-h-0 mr-0 md:mr-6 rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/30 bg-black/40 card-image group/image backdrop-blur-sm">
                      <Image
                        src={data.image}
                        alt={data.artist}
                        fill
                        sizes="(max-width: 768px) 92vw, 950px"
                        className="object-cover"
                        priority={index === 0}
                      />
                      
                      {/* Modern gradient overlays */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
                      
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/image:translate-x-full transition-transform duration-[2000ms] ease-in-out" />
                      
                      {/* Glow effect */}
                      <div className="absolute inset-0 bg-gradient-radial from-white/10 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>

                  {/* Modern decorative elements */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-[3rem] backdrop-blur-sm"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-tr-[3rem] backdrop-blur-sm"></div>
                  
                  {/* Corner accent lines */}
                  <div className="absolute top-6 right-6 w-16 h-px bg-white/30"></div>
                  <div className="absolute top-6 right-6 w-px h-16 bg-white/30"></div>
                  <div className="absolute bottom-6 left-6 w-16 h-px bg-white/30"></div>
                  <div className="absolute bottom-6 left-6 w-px h-16 bg-white/30"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modern Progress Indicators */}
      <div className="flex flex-col items-center gap-8 mt-16 md:mt-20">
        <div className="flex justify-center gap-3 md:gap-4">
          {artistData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative transition-all duration-300"
              aria-label={`Go to ${artistData[index].artist}`}
            >
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                  index === currentIndex
                    ? "bg-white w-16 shadow-[0_0_20px_rgba(255,255,255,0.6)]"
                    : "bg-white/30 hover:bg-white/50 w-2.5"
                }`}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 h-2.5 w-16 bg-white/40 rounded-full animate-pulse blur-sm" />
              )}
            </button>
          ))}
        </div>
        
        {/* Modern artist indicator */}
        <div className="text-center">
          <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
            <span className="text-white/80 text-sm md:text-base font-jqka uppercase tracking-wider">
              {artistData[currentIndex].day}
            </span>
            <div className="w-1 h-1 rounded-full bg-white/60"></div>
            <span className="text-white/60 text-sm md:text-base font-jqka uppercase tracking-wider">
              {artistData[currentIndex].tag}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
