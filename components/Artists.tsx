"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Artist = {
  name: string;
  date: string;
  image: {
    avif?: string;
    fallback: string;
  };
};

// Memoized artist image component
const ArtistImage = memo(function ArtistImage({
  artist,
  isCenter,
  onClick,
  onHover,
  onLeave,
}: {
  artist: Artist;
  isCenter: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <picture>
      {artist.image.avif && (
        <source srcSet={artist.image.avif} type="image/avif" />
      )}
      <img
        ref={imageRef}
        src={artist.image.fallback}
        alt={artist.name}
        loading="lazy"
        onClick={onClick}
        onMouseEnter={onHover}
        onMouseLeave={onLeave}
        className="block object-cover z-10 cursor-pointer rounded-lg"
        style={{
          width: isCenter ? "clamp(200px, 35vw, 380px)" : "clamp(100px, 20vw, 180px)",
          height: isCenter ? "clamp(260px, 45vw, 450px)" : "clamp(130px, 26vw, 230px)",
          boxShadow: isCenter
            ? "0 25px 80px rgba(235, 0, 0, 0.4), 0 10px 30px rgba(0,0,0,0.5)"
            : "0 10px 30px rgba(0,0,0,0.3)",
        }}
        sizes="(max-width: 768px) 80vw, 520px"
      />
    </picture>
  );
});

export default function ArtistsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const artists: Artist[] = [
    {
      name: "Sartek",
      date: "21 Feb 2025",
      image: { avif: "/images_home/DJSartek.avif", fallback: "/images_home/DJSartek.jpg" },
    },
    {
      name: "Mohit Chauhan",
      date: "23 Feb 2025",
      image: { avif: "/images_home/MohitChauhan.avif", fallback: "/images_home/MohitChauhan.jpg" },
    },
    {
      name: "Nikhil D' Souza",
      date: "21 Feb 2025",
      image: { avif: "/images_home/NikhilDSouza.avif", fallback: "/images_home/NikhilDSouza.jpg" },
    },
    {
      name: "Shaan",
      date: "22 Feb 2025",
      image: { avif: "/images_home/Shaan.avif", fallback: "/images_home/Shaan.jpg" },
    },
    {
      name: "Teri Miko",
      date: "22 Feb 2025",
      image: { avif: "/images_home/TeriMiko.avif", fallback: "/images_home/TeriMiko.jpg" },
    },
    {
      name: "Ravi Gupta",
      date: "20 Feb 2025",
      image: { avif: "/images_home/RaviGupta.avif", fallback: "/images_home/RaviGupta.jpg" },
    },
    {
      name: "Aditya Gadhvi",
      date: "10 Jan 2026",
      image: { avif: "/images_home/AdityaGadhvi.avif", fallback: "/images_home/AdityaGadhvi.jpeg" },
    },
  ];

  const artistSectionRef = useRef<HTMLDivElement>(null);
  const artistSvgRef = useRef<SVGSVGElement>(null);
  const artistPathRef = useRef<SVGPathElement>(null);
  const artistDotRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);
  const infoBoxRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragDelta = useRef(0);

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

  const animateCarousel = useCallback(() => {
    if (!imagesContainerRef.current || !isInitialized) return;

    const items = imagesContainerRef.current.querySelectorAll(".carousel-item");
    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? window.innerWidth * 0.6 : window.innerWidth * 0.35;

    items.forEach((item, i) => {
      const element = item as HTMLElement;
      let diff = i - currentIndex;
      const total = items.length;

      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const offset = diff * spacing;
      const absDiff = Math.abs(diff);

      let opacity = 1;
      let scale = 1;
      let zIndex = 10;
      let rotateY = 0;
      let blur = 0;

      if (diff === 0) {
        // Center item
        element.classList.add("center");
        zIndex = 10;
        opacity = 1;
        scale = 1;
        rotateY = 0;
        blur = 0;
      } else {
        element.classList.remove("center");

        // 3D rotation based on position
        rotateY = diff > 0 ? -25 : 25;
        
        if (absDiff === 1) {
          opacity = 0.7;
          scale = 0.75;
          zIndex = 8;
          blur = 1;
        } else if (absDiff === 2) {
          opacity = 0.4;
          scale = 0.55;
          zIndex = 6;
          blur = 2;
        } else {
          opacity = 0;
          scale = 0.4;
          zIndex = 4;
          blur = 3;
        }
      }

      gsap.to(element, {
        x: offset,
        xPercent: -50,
        yPercent: -50,
        scale: scale,
        opacity: opacity,
        zIndex: zIndex,
        rotateY: rotateY,
        filter: `blur(${blur}px)`,
        duration: 0.7,
        ease: "power3.out",
      });
    });

    // Animate info box with stagger effect
    if (infoBoxRef.current) {
      const tl = gsap.timeline();
      
      tl.to(infoBoxRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.2,
        ease: "power2.in",
      })
        .set(infoBoxRef.current, { opacity: 0 })
        .to(infoBoxRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "back.out(1.4)",
        });
    }

    // Update progress bar
    if (progressBarRef.current) {
      const progress = ((currentIndex + 1) / artists.length) * 100;
      gsap.to(progressBarRef.current, {
        width: `${progress}%`,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  }, [currentIndex, isInitialized, artists.length]);

  const goToArtist = useCallback(
    (index: number) => {
      const newIndex = ((index % artists.length) + artists.length) % artists.length;
      setCurrentIndex(newIndex);
    },
    [artists.length]
  );

  const nextArtist = useCallback(() => {
    goToArtist(currentIndex + 1);
  }, [currentIndex, goToArtist]);

  const prevArtist = useCallback(() => {
    goToArtist(currentIndex - 1);
  }, [currentIndex, goToArtist]);

  // Drag/Swipe handlers
  const handleDragStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setIsPaused(true);
    dragStartX.current = clientX;
    dragDelta.current = 0;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging) return;
    dragDelta.current = clientX - dragStartX.current;
  }, [isDragging]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (dragDelta.current > threshold) {
      prevArtist();
    } else if (dragDelta.current < -threshold) {
      nextArtist();
    }

    dragDelta.current = 0;
    
    // Resume auto-play after a delay
    setTimeout(() => setIsPaused(false), 3000);
  }, [isDragging, nextArtist, prevArtist]);

  // Mouse events
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleDragStart(e.clientX);
    },
    [handleDragStart]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleDragMove(e.clientX);
    },
    [handleDragMove]
  );

  const handleMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
    },
    [handleDragStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientX);
    },
    [handleDragMove]
  );

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Initialize carousel
  useEffect(() => {
    if (!imagesContainerRef.current || isInitialized) return;

    const items = imagesContainerRef.current.querySelectorAll(".carousel-item");
    const isMobile = window.innerWidth < 768;
    const spacing = isMobile ? window.innerWidth * 0.6 : window.innerWidth * 0.35;

    items.forEach((item, i) => {
      const element = item as HTMLElement;
      let diff = i - currentIndex;
      const total = items.length;

      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const offset = diff * spacing;
      const absDiff = Math.abs(diff);

      gsap.set(element, {
        x: offset,
        scale: diff === 0 ? 1 : absDiff === 1 ? 0.75 : 0.55,
        opacity: diff === 0 ? 1 : absDiff === 1 ? 0.7 : absDiff === 2 ? 0.4 : 0,
        zIndex: 10 - absDiff * 2,
        rotateY: diff === 0 ? 0 : diff > 0 ? -25 : 25,
      });
    });

    // Use RAF to batch state update after render
    requestAnimationFrame(() => {
      setIsInitialized(true);
    });
  }, [currentIndex, isInitialized]);

  // Auto-play timer
  useEffect(() => {
    if (isPaused) {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
        carouselTimerRef.current = null;
      }
      return;
    }

    carouselTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artists.length);
    }, 5000);

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [isPaused, artists.length]);

  // Entrance animations
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Title animation
    if (titleRef.current) {
      const text = titleRef.current.textContent || "";
      titleRef.current.innerHTML = "";

      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.className = "inline-block artist-letter";
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.opacity = "0";
        span.style.transform = "translateY(100%) rotateX(-90deg)";
        titleRef.current?.appendChild(span);
      });

      gsap.to(".artist-letter", {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.05,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: artistSectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    }

    // Line animation
    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: artistSectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    }

    // Progress indicator animation
    if (progressRef.current) {
      gsap.fromTo(
        progressRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          delay: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: artistSectionRef.current,
            start: "top 60%",
            once: true,
          },
        }
      );
    }
  }, []);

  // SVG path animation
  useEffect(() => {
    if (artistSvgRef.current && artistPathRef.current && artistDotRef.current) {
      const artistSvg = artistSvgRef.current;
      const artistPath = artistPathRef.current;
      const artistDot = artistDotRef.current;

      const jokerDot = document.getElementById("jokerPathDot");

      const path = generateViewportPath();
      artistPath.setAttribute("d", path);
      const artistPathLength = artistPath.getTotalLength();

      const scrollTrigger = ScrollTrigger.create({
        trigger: artistSectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
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

      const handleResize = () => {
        const newPath = generateViewportPath();
        artistPath.setAttribute("d", newPath);
        if (isInitialized) {
          animateCarousel();
        }
        scrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        scrollTrigger.kill();
      };
    }
  }, [generateViewportPath, animateCarousel, isInitialized]);

  // Animate carousel on index change
  useEffect(() => {
    if (isInitialized) {
      animateCarousel();
    }
  }, [currentIndex, animateCarousel, isInitialized]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        nextArtist();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 3000);
      } else if (e.key === "ArrowLeft") {
        prevArtist();
        setIsPaused(true);
        setTimeout(() => setIsPaused(false), 3000);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextArtist, prevArtist]);

  return (
    <div
      className="artists-section relative bg-black overflow-hidden select-none"
      id="artistsSection"
      ref={artistSectionRef}
      style={{ height: "100svh", zIndex: 20 }}
    >
      <div className="artists-content relative h-full flex flex-col">
        <svg
          id="artistPath"
          width="100%"
          height="100%"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 pointer-events-none z-1"
          ref={artistSvgRef}
        >
          <path
            id="artistSvgPath"
            stroke="white"
            strokeWidth="2"
            fill="none"
            ref={artistPathRef}
          />
        </svg>

        {/* Title */}
        <div className="shrink-0 pt-8 md:pt-12 pb-6 md:pb-10 relative z-20">
          <h1
            ref={titleRef}
            className="font-joker text-[clamp(2.5rem,10vw,6rem)] px-8 leading-none text-white lowercase text-center"
            style={{ perspective: "1000px" }}
          >
            ARTISTS
          </h1>
        </div>

        {/* Carousel with drag/swipe */}
        <div
          className="carousel relative flex-1 min-h-0 flex items-center justify-center cursor-grab active:cursor-grabbing mt-8"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Animated line through center */}
          <div
            ref={lineRef}
            className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-linear-to-r from-transparent via-white to-transparent origin-center pointer-events-none"
            style={{ zIndex: 1 }}
          />

          {/* Red glow dot */}
          <div
            id="artistPathDot"
            className="fixed w-14 h-14 md:w-22.5 md:h-22.5 bg-[#ff0000] rounded-full blur-[20px] pointer-events-none z-5 opacity-0 -translate-x-1/2 -translate-y-1/2"
            ref={artistDotRef}
          />

          {/* Navigation Arrows */}
          <button
            onClick={() => {
              prevArtist();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
            aria-label="Previous artist"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => {
              nextArtist();
              setIsPaused(true);
              setTimeout(() => setIsPaused(false), 3000);
            }}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group"
            aria-label="Next artist"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Images Container */}
          <div
            className="images-container relative w-full h-full flex items-center justify-center"
            id="imagesContainer"
            ref={imagesContainerRef}
            style={{ perspective: "1200px", zIndex: 5 }}
          >
            {artists.map((artist, i) => (
              <div
                key={i}
                className={`carousel-item absolute top-1/2 left-1/2 -translate-y-1/2 will-change-transform ${
                  i === currentIndex ? "center" : ""
                }`}
                style={{
                  transformStyle: "preserve-3d",
                }}
              >
                <ArtistImage
                  artist={artist}
                  isCenter={i === currentIndex}
                  onClick={() => {
                    if (!isDragging) {
                      goToArtist(i);
                      setIsPaused(true);
                      setTimeout(() => setIsPaused(false), 3000);
                    }
                  }}
                  onHover={() => setIsPaused(true)}
                  onLeave={() => setIsPaused(false)}
                />
              </div>
            ))}
          </div>

          {/* Swipe hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/40 text-xs md:text-sm font-jqka tracking-wider pointer-events-none">
            <span className="hidden md:inline">← Use arrow keys or drag →</span>
            <span className="md:hidden">← Swipe →</span>
          </div>
        </div>

        {/* Artist Info & Progress */}
        <div className="shrink-0 pb-8 md:pb-12 pt-4 flex flex-col items-center px-4">
          {/* Info box */}
          <div
            ref={infoBoxRef}
            className="relative mb-6 text-center"
          >
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-red-500" />
            <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-red-500" />
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-jqka uppercase text-white tracking-wider">
              {artists[currentIndex].name}
            </h2>
            <p className="text-sm sm:text-base md:text-lg font-jqka text-white/70 mt-1">
              {artists[currentIndex].date}
            </p>
          </div>

          {/* Progress indicator dots */}
          <div ref={progressRef} className="flex items-center gap-2">
            {artists.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  goToArtist(i);
                  setIsPaused(true);
                  setTimeout(() => setIsPaused(false), 3000);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? "bg-red-500 w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Go to ${artists[i].name}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="w-48 md:w-64 h-[2px] bg-white/10 rounded-full mt-4 overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-linear-to-r from-red-600 to-red-400 rounded-full"
              style={{ width: `${((currentIndex + 1) / artists.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
