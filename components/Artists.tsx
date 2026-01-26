'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Artist = {
  name: string;
  date: string;
  image: string;
};

export default function ArtistsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const artistSectionRef = useRef<HTMLDivElement>(null);
  const artistSvgRef = useRef<SVGSVGElement>(null);
  const artistPathRef = useRef<SVGPathElement>(null);
  const artistDotRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<gsap.core.Tween | null>(null);
  const isPausedRef = useRef(false);

  useEffect(() => {
    const fetchArtists = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("artist")
        .select(`
          name,
          artist_image_url,
          concert (
            concert_date
          )
        `);

      if (error) {
        console.error("Error fetching artists:", error);
        setLoading(false);
        return;
      }

      let loadedArtists: Artist[] = [];

      if (data && data.length > 0) {
        loadedArtists = data.map((item) => ({
          name: item.name,
          date: item.concert?.concert_date
            ? new Date(item.concert.concert_date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
            : "DATE TBA",
          image: item.artist_image_url || "/images_home/AdityaGadhvi.jpeg",
        }));
      } else {
        loadedArtists = [
          {
            name: "TO BE ANNOUNCED",
            date: "",
            image: "",
          },
        ];
      }

      setArtists(loadedArtists);
      setLoading(false);
    };

    fetchArtists();
  }, []);

  const generateViewportPath = useCallback(() => {
    if (typeof window === "undefined") return "";
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sx = 1000 / w;
    const sy = 1000 / h;
    const startX = (w / 2) * sx;
    const startY = 1;
    const endX = (w / 2) * sx;
    const endY = 1000;
    const c1x = w * 0.15 * sx;
    const c1y = h * 0.35 * sy;
    const c2x = w * 0.85 * sx;
    const c2y = h * 0.65 * sy;

    return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  }, []);

  // Modern GSAP-based card animation
  const animateCards = useCallback((direction: 'next' | 'prev' | 'initial' = 'initial') => {
    if (artists.length === 0) return;
    
    const mm = gsap.matchMedia();

    mm.add({
      isMobile: "(max-width: 767px)",
      isDesktop: "(min-width: 768px)"
    }, (context) => {
      const { isMobile } = context.conditions as { isMobile: boolean };
      const cardWidth = isMobile ? 280 : 420;
      const gap = isMobile ? 20 : 40;

      cardRefs.current.forEach((card, i) => {
        if (!card) return;

        let diff = i - currentIndex;
        const total = artists.length;

        // Handle wrapping
        if (total > 2) {
          if (diff > total / 2) diff -= total;
          if (diff < -total / 2) diff += total;
        }

        const isCenter = diff === 0;
        const isAdjacent = Math.abs(diff) === 1;

        // Calculate position with perspective offset
        const xOffset = diff * (cardWidth * 0.6 + gap);
        
        // Visual properties
        const scale = isCenter ? 1 : 0.65;
        const opacity = isCenter ? 1 : isAdjacent ? 0.4 : 0;
        const zIndex = isCenter ? 30 : isAdjacent ? 20 : 10;
        const rotateY = isCenter ? 0 : diff > 0 ? -15 : 15;
        const brightness = isCenter ? 1 : 0.5;

        gsap.to(card, {
          x: xOffset,
          scale,
          opacity,
          rotateY: isMobile ? 0 : rotateY, // Disable rotateY on mobile for performance
          filter: `brightness(${brightness})`,
          zIndex,
          duration: direction === 'initial' ? 0 : 0.7,
          ease: "power3.out",
        });
      });
    });

    return () => mm.revert();
  }, [artists.length, currentIndex]);

  // Auto-play with progress bar
  const startAutoPlay = useCallback(() => {
    if (artists.length <= 1) return;

    if (autoPlayRef.current) {
      autoPlayRef.current.kill();
    }

    if (progressRef.current) {
      gsap.set(progressRef.current, { scaleX: 0 });
    }

    autoPlayRef.current = gsap.to(progressRef.current, {
      scaleX: 1,
      duration: 5,
      ease: "none",
      onComplete: () => {
        if (!isPausedRef.current) {
          setCurrentIndex((prev) => (prev + 1) % artists.length);
        }
      }
    });
  }, [artists.length]);

  const pauseAutoPlay = useCallback(() => {
    isPausedRef.current = true;
    if (autoPlayRef.current) {
      autoPlayRef.current.pause();
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    isPausedRef.current = false;
    if (autoPlayRef.current) {
      autoPlayRef.current.resume();
    }
  }, []);

  const restartAutoPlay = useCallback(() => {
    isPausedRef.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

  const nextArtist = useCallback(() => {
    if (artists.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % artists.length);
    restartAutoPlay();
    setTimeout(() => setIsAnimating(false), 700);
  }, [artists.length, isAnimating, restartAutoPlay]);

  const prevArtist = useCallback(() => {
    if (artists.length <= 1 || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + artists.length) % artists.length);
    restartAutoPlay();
    setTimeout(() => setIsAnimating(false), 700);
  }, [artists.length, isAnimating, restartAutoPlay]);

  const goToArtist = useCallback((index: number) => {
    if (index === currentIndex || isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    restartAutoPlay();
    setTimeout(() => setIsAnimating(false), 700);
  }, [currentIndex, isAnimating, restartAutoPlay]);

  // Start auto-play
  useEffect(() => {
    if (!loading && artists.length > 1) {
      startAutoPlay();
    }

    return () => {
      if (autoPlayRef.current) {
        autoPlayRef.current.kill();
      }
    };
  }, [loading, artists.length, startAutoPlay]);

  // SVG path animation
  useEffect(() => {
    if (loading) return;

    if (artistSvgRef.current && artistPathRef.current && artistDotRef.current) {
      const artistSvg = artistSvgRef.current;
      const artistPath = artistPathRef.current;
      const artistDot = artistDotRef.current;
      const jokerDot = document.getElementById("jokerPathDot");

      const mm = gsap.matchMedia();

      mm.add({
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)"
      }, (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };
        
        const path = generateViewportPath();
        artistPath.setAttribute("d", path);
        const artistPathLength = artistPath.getTotalLength();

        const scrollTrigger = ScrollTrigger.create({
          trigger: artistSectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: isMobile ? 0.5 : true, // Faster scrub on mobile
          onEnter: () => {
            if (jokerDot) jokerDot.style.opacity = "0";
            if (artistDot) artistDot.style.opacity = "1";
          },
          onLeave: () => {
            if (jokerDot) jokerDot.style.opacity = "0";
            if (artistDot) artistDot.style.opacity = "0";
          },
          onEnterBack: () => {
            if (jokerDot) jokerDot.style.opacity = "0";
            if (artistDot) artistDot.style.opacity = "1";
          },
          onUpdate: (self) => {
            const progress = self.progress;
            const point = artistPath.getPointAtLength(progress * artistPathLength);
            const rect = artistSvg.getBoundingClientRect();

            const x = rect.left + (point.x / 1000) * rect.width;
            const y = rect.top + (point.y / 1000) * rect.height;

            artistDot.style.left = `${x}px`;
            artistDot.style.top = `${y}px`;
          },
        });

        return () => scrollTrigger.kill();
      });

      const handleResize = () => {
        animateCards('initial');
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);
      animateCards('initial');

      return () => {
        window.removeEventListener("resize", handleResize);
        mm.revert();
      };
    }
  }, [generateViewportPath, animateCards, loading]);

  // Update cards when index changes
  useEffect(() => {
    if (!loading) {
      animateCards('next');
      startAutoPlay();
    }
  }, [currentIndex, animateCards, loading, startAutoPlay]);

  if (loading) return null;

  return (
    <div
      className="artists-section relative bg-black overflow-hidden"
      id="artistsSection"
      ref={artistSectionRef}
      style={{ height: "100svh" }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-black via-zinc-950 to-black pointer-events-none z-0" />

      {/* SVG Path - Behind cards */}
      <svg
        ref={artistSvgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        className="absolute inset-0 pointer-events-none z-1"
      >
        <path
          ref={artistPathRef}
          stroke="white"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      {/* Animated dot - Above path but can be behind cards */}
      <div
        ref={artistDotRef}
        className="fixed w-16 h-16 md:w-24 md:h-24 bg-red-600 rounded-full blur-[25px] pointer-events-none z-2 opacity-0 -translate-x-1/2 -translate-y-1/2"
        id="artistPathDot"
      />

      {/* Main content - Above SVG path */}
      <div className="relative h-full flex flex-col z-10">
        {/* Header with title and counter */}
        <div className="pt-8 md:pt-12 px-6 md:px-12 flex items-center justify-between">
          <h1 className="font-joker text-5xl md:text-7xl lg:text-8xl text-white">
            artists
          </h1>
          
          {artists.length > 1 && (
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-6xl font-jqka text-white tabular-nums">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-xl md:text-2xl text-white/30 font-jqka">/</span>
              <span className="text-xl md:text-2xl text-white/30 font-jqka">
                {String(artists.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {artists.length > 1 && (
          <div className="px-6 md:px-12 mt-4">
            <div className="h-[2px] bg-white/10 rounded-full overflow-hidden">
              <div 
                ref={progressRef}
                className="h-full bg-linear-to-r from-red-600 to-red-500 origin-left rounded-full"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        )}

        {/* Main carousel area */}
        <div 
          className="flex-1 relative flex items-center justify-center perspective-distant"
          onMouseEnter={pauseAutoPlay}
          onMouseLeave={resumeAutoPlay}
        >
          {/* Cards container */}
          <div
            ref={cardsContainerRef}
            className="relative w-full h-full flex items-center justify-center"
            style={{ transformStyle: "preserve-3d" }}
          >
            {artists.map((artist, i) => (
              <div
                key={i}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute cursor-pointer transform-gpu"
                onClick={() => goToArtist(i)}
                style={{
                  width: "clamp(280px, 40vw, 420px)",
                  height: "clamp(350px, 55vw, 550px)",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* Card */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden group">
                  {/* Glowing border effect for active card */}
                  <div 
                    className={`absolute -inset-[2px] rounded-2xl transition-opacity duration-500 ${
                      i === currentIndex 
                        ? 'opacity-100 bg-linear-to-b from-red-500/50 via-transparent to-red-500/50' 
                        : 'opacity-0'
                    }`}
                  />
                  
                  {/* Card inner */}
                  <div className="absolute inset-[2px] rounded-2xl overflow-hidden bg-zinc-900">
                    {artist.image ? (
                      <>
                        <Image
                          src={artist.image}
                          alt={artist.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          quality={80}
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          priority={i < 3}
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80" />
                        
                        {/* Artist info on card */}
                        <div 
                          className={`absolute bottom-0 left-0 right-0 p-6 transform transition-all duration-500 ${
                            i === currentIndex ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                          }`}
                        >
                          <h3 className="text-2xl md:text-3xl font-jqka text-white uppercase tracking-wide">
                            {artist.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-8 h-[2px] bg-red-600" />
                            <p className="text-sm md:text-base text-white/70 font-jqka uppercase tracking-wider">
                              {artist.date}
                            </p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                        <span className="font-joker text-white/30 text-3xl md:text-5xl text-center px-4">
                          TBA
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Shine effect on hover */}
                  <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />
                </div>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {artists.length > 1 && (
            <>
              {/* Previous button */}
              <button
                onClick={prevArtist}
                disabled={isAnimating}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:border-red-600 group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous artist"
              >
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform duration-300 group-hover:-translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Next button */}
              <button
                onClick={nextArtist}
                disabled={isAnimating}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all duration-300 hover:bg-red-600 hover:border-red-600 group disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next artist"
              >
                <svg
                  className="w-6 h-6 md:w-7 md:h-7 text-white transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Bottom navigation dots */}
        {artists.length > 1 && (
          <div className="pb-8 md:pb-12 flex items-center justify-center gap-3">
            {artists.map((_, i) => (
              <button
                key={i}
                onClick={() => goToArtist(i)}
                className={`relative h-3 rounded-full transition-all duration-500 overflow-hidden ${
                  i === currentIndex 
                    ? "w-12 bg-white/20" 
                    : "w-3 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to artist ${i + 1}`}
              >
                {i === currentIndex && (
                  <div className="absolute inset-0 bg-red-600 origin-left animate-[fillDot_5s_linear]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CSS for dot animation */}
      <style jsx>{`
        @keyframes fillDot {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
