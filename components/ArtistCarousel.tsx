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
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const autoPlayRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const total = artistData.length;

  // Calculate card positions
  const getCardPosition = useCallback((index: number, active: number) => {
    let diff = index - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  }, [total]);

  // Animate cards with enhanced effects
  const animateCards = useCallback((newIndex: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const cardWidth = isMobile 
      ? window.innerWidth * 0.9 
      : isTablet 
        ? Math.min(window.innerWidth * 0.75, 700)
        : Math.min(window.innerWidth * 0.65, 900);
    const spacing = isMobile ? cardWidth * 0.2 : cardWidth * 0.15;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, newIndex);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      // Enhanced visual properties
      const scale = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.7 : 0.82) : 0.55;
      const opacity = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.4 : 0.65) : 0;
      const zIndex = position === 0 ? 30 : absPosition === 1 ? 20 : 10;
      const rotateY = position === 0 ? 0 : position > 0 ? -12 : 12;
      const blur = position === 0 ? 0 : absPosition === 1 ? 2 : 4;
      const brightness = position === 0 ? 1 : absPosition === 1 ? 0.7 : 0.5;


      // Animate with GSAP
      gsap.to(card, {
        x: xOffset,
        scale,
        opacity,
        rotateY,
        zIndex,
        filter: `blur(${blur}px) brightness(${brightness})`,
        duration: 1,
        ease: "power3.out",
        onComplete: () => {
          if (index === newIndex) {
            isAnimatingRef.current = false;
          }
        },
      });

      // Animate inner content with stagger
      const content = card.querySelector(".card-content");
      const image = card.querySelector(".card-image");
      const dayTag = card.querySelector(".day-tag");
      const artistName = card.querySelector(".artist-name");
      const description = card.querySelector(".artist-description");

      if (position === 0) {
        // Center card animations
        if (content) {
          gsap.fromTo(content,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, delay: 0.1, ease: "power2.out" }
          );
        }
        if (image) {
          gsap.fromTo(image,
            { scale: 1.1, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1, delay: 0.2, ease: "power2.out" }
          );
        }
        if (dayTag) {
          gsap.fromTo(dayTag,
            { opacity: 0, x: -20 },
            { opacity: 1, x: 0, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
          );
        }
        if (artistName) {
          gsap.fromTo(artistName,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.4, ease: "power2.out" }
          );
        }
        if (description) {
          gsap.fromTo(description,
            { opacity: 0, y: 15 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.5, ease: "power2.out" }
          );
        }
      } else {
        // Reset non-active cards
        gsap.set([content, image, dayTag, artistName, description], { opacity: 0.8 });
      }
    });
  }, [getCardPosition]);

  // Auto-play with pause on hover
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }

    autoPlayRef.current = gsap.to({}, {
      duration: 6,
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

  // Navigation functions
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
    handleSwipe();
  };

  const handleSwipe = () => {
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

  // Initialize carousel
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    const cardWidth = isMobile 
      ? window.innerWidth * 0.9 
      : isTablet 
        ? Math.min(window.innerWidth * 0.75, 700)
        : Math.min(window.innerWidth * 0.65, 900);
    const spacing = isMobile ? cardWidth * 0.2 : cardWidth * 0.15;

    cardsRef.current.forEach((card, index) => {
      if (!card) return;

      const position = getCardPosition(index, 0);
      const xOffset = position * (cardWidth + spacing);
      const absPosition = Math.abs(position);

      const scale = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.7 : 0.82) : 0.55;
      const opacity = position === 0 ? 1 : absPosition === 1 ? (isMobile ? 0.4 : 0.65) : 0;
      const zIndex = position === 0 ? 30 : absPosition === 1 ? 20 : 10;
      const rotateY = position === 0 ? 0 : position > 0 ? -12 : 12;
      const blur = position === 0 ? 0 : absPosition === 1 ? 2 : 4;
      const brightness = position === 0 ? 1 : absPosition === 1 ? 0.7 : 0.5;

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

    const timeoutId = setTimeout(handleResize, 150);
    window.addEventListener("resize", handleResize);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [currentIndex, animateCards]);

  return (
    <section 
      className="relative bg-black overflow-hidden py-16 md:py-24 lg:py-32"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Header */}
      <div className="text-center mb-12 md:mb-16 px-4">
        <h2 className="font-joker text-[clamp(3rem,12vw,8rem)] text-white mb-4 lowercase leading-none">
          Pronite Artists
        </h2>
        <div className="w-24 h-1 bg-red-600 mx-auto"></div>
      </div>

      {/* Carousel Container */}
      <div
        ref={containerRef}
        className="relative w-full flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          height: "clamp(450px, 75vh, 700px)",
          perspective: "2000px",
        }}
      >
        {artistData.map((data, index) => (
          <div
            key={index}
            ref={(el) => { cardsRef.current[index] = el; }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer will-change-transform"
            onClick={() => goToSlide(index)}
            style={{
              width: "clamp(300px, 90vw, 900px)",
              height: "clamp(400px, 65vh, 600px)",
              transformStyle: "preserve-3d",
            }}
          >
            {/* Card with enhanced design */}
            <div
              className="w-full h-full rounded-3xl md:rounded-4xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative group"
              style={{ 
                backgroundColor: data.hexColor,
                boxShadow: `0 25px 50px -12px ${data.hexColor}40, 0 0 0 1px rgba(255,255,255,0.1)`
              }}
            >
              {/* Animated background gradient */}
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                style={{
                  background: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.3), transparent 50%)`
                }}
              />

              <div className="relative w-full h-full p-8 md:p-12 lg:p-16 flex flex-col text-white z-10">
                {/* Day & Tag - Enhanced vertical text */}
                <div className="absolute left-6 md:left-10 top-10 md:top-12 flex flex-col gap-8 pointer-events-none day-tag">
                  <div className="flex flex-col gap-2">
                    <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-base md:text-xl tracking-[0.3em] font-black opacity-90">
                      {data.day}
                    </span>
                    <div className="w-px h-8 bg-white/30 ml-1"></div>
                    <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-sm md:text-base tracking-[0.4em] font-bold opacity-60">
                      {data.tag}
                    </span>
                  </div>
                </div>

                {/* Content Area - Better spacing */}
                <div className="card-content ml-14 md:ml-20 lg:ml-24 flex flex-col h-full">
                  {/* Artist Info - Enhanced typography */}
                  <div className="mb-6 md:mb-8 shrink-0">
                    <h3 className="artist-name text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black font-jqka tracking-tighter mb-3 md:mb-4 leading-[0.9] uppercase">
                      {data.artist}
                    </h3>
                    <p className="artist-description text-xs sm:text-sm md:text-base max-w-lg md:max-w-xl opacity-90 font-jqka font-semibold leading-relaxed tracking-wide uppercase">
                      {data.description}
                    </p>
                  </div>

                  {/* Image Area - Enhanced with better styling */}
                  <div className="relative flex-1 min-h-0 mr-0 md:mr-4 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black/30 card-image group/image">
                    <Image
                      src={data.image}
                      alt={data.artist}
                      fill
                      sizes="(max-width: 768px) 90vw, 900px"
                      className="object-cover transition-transform duration-700 group-hover/image:scale-110"
                      priority={index === 0}
                    />
                    {/* Enhanced gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30" />
                    
                    {/* Shine effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/image:translate-x-full transition-transform duration-1000" />
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-tr-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Progress Indicators */}
      <div className="flex flex-col items-center gap-6 mt-12 md:mt-16">
        <div className="flex justify-center gap-2 md:gap-3">
          {artistData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="group relative"
              aria-label={`Go to ${artistData[index].artist}`}
            >
              <div 
                className={`h-2 rounded-full transition-all duration-500 ease-out ${
                  index === currentIndex
                    ? "bg-white w-12 shadow-lg shadow-white/50"
                    : "bg-white/40 hover:bg-white/60 w-2"
                }`}
              />
              {index === currentIndex && (
                <div className="absolute inset-0 h-2 w-12 bg-white/30 rounded-full animate-pulse" />
              )}
            </button>
          ))}
        </div>
        
        {/* Artist name indicator */}
        <div className="text-center">
          <p className="text-white/60 text-sm md:text-base font-jqka uppercase tracking-wider">
            {artistData[currentIndex].day} • {artistData[currentIndex].tag}
          </p>
        </div>
      </div>
    </section>
  );
}
