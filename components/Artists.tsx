"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/dist/Draggable";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Draggable);
}

type Artist = {
  name: string;
  date: string;
  image: {
    avif?: string;
    fallback: string;
  };
};

export default function ArtistsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [artists] = useState<Artist[]>([
    {
      name: "Sartek",
      date: "21 Feb 2025",
      image: {
        avif: "/images_home/DJSartek.avif",
        fallback: "/images_home/DJSartek.jpg",
      },
    },
    {
      name: "Mohit Chauhan",
      date: "23 Feb 2025",
      image: {
        avif: "/images_home/MohitChauhan.avif",
        fallback: "/images_home/MohitChauhan.jpg",
      },
    },
    {
      name: "Nikhil D' Souza",
      date: "21 Feb 2025",
      image: {
        avif: "/images_home/NikhilDSouza.avif",
        fallback: "/images_home/NikhilDSouza.jpg",
      },
    },
    {
      name: "Shaan",
      date: "22 Feb 2025",
      image: {
        avif: "/images_home/Shaan.avif",
        fallback: "/images_home/Shaan.jpg",
      },
    },
    {
      name: "Teri Miko",
      date: "22 Feb 2025",
      image: {
        avif: "/images_home/TeriMiko.avif",
        fallback: "/images_home/TeriMiko.jpg",
      },
    },
    {
      name: "Ravi Gupta",
      date: "20 Feb 2025",
      image: {
        avif: "/images_home/RaviGupta.avif",
        fallback: "/images_home/RaviGupta.jpg",
      },
    },
    {
      name: "Aditya Gadhvi",
      date: "10 Jan 2026",
      image: {
        avif: "/images_home/AdityaGadhvi.avif",
        fallback: "/images_home/AdityaGadhvi.jpeg",
      },
    },
  ]);

  const artistSectionRef = useRef<HTMLDivElement>(null);
  const artistSvgRef = useRef<SVGSVGElement>(null);
  const artistPathRef = useRef<SVGPathElement>(null);
  const artistDotRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselTimerRef = useRef<gsap.core.Tween | null>(null);
  const draggableRef = useRef<Draggable[] | null>(null);
  const dragStartXRef = useRef(0);
  const currentIndexRef = useRef(0);

  // Keep ref in sync with state
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

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

  const animateCarousel = useCallback((index: number, animate = true) => {
    if (!carouselRef.current) return;

    const items = carouselRef.current.querySelectorAll(".artist-card");
    const isMobile = window.innerWidth < 768;
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    
    // Responsive spacing - tighter on mobile for better visibility
    const spacing = isMobile 
      ? window.innerWidth * 0.7
      : isTablet 
        ? window.innerWidth * 0.45
        : window.innerWidth * 0.35;

    items.forEach((item, i) => {
      const element = item as HTMLElement;
      let diff = i - index;
      const total = items.length;

      // Wrap around for infinite effect
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const offset = diff * spacing;
      const absDiff = Math.abs(diff);

      // Calculate visual properties based on position
      let opacity: number;
      let scale: number;
      let zIndex: number;
      let rotateY: number;
      let brightness: number;

      if (diff === 0) {
        // Center card - full prominence
        opacity = 1;
        scale = 1;
        zIndex = 20;
        rotateY = 0;
        brightness = 1;
      } else if (absDiff === 1) {
        // Adjacent cards - visible but recessed
        opacity = isMobile ? 0.6 : 0.75;
        scale = isMobile ? 0.75 : 0.8;
        zIndex = 15;
        rotateY = diff > 0 ? -8 : 8;
        brightness = 0.7;
      } else if (absDiff === 2) {
        // Second level - barely visible on desktop
        opacity = isMobile ? 0 : 0.4;
        scale = isMobile ? 0.6 : 0.65;
        zIndex = 10;
        rotateY = diff > 0 ? -12 : 12;
        brightness = 0.5;
      } else {
        // Hidden
        opacity = 0;
        scale = 0.5;
        zIndex = 5;
        rotateY = diff > 0 ? -15 : 15;
        brightness = 0.3;
      }

      const duration = animate ? 0.6 : 0;
      const ease = "power2.out";

      gsap.to(element, {
        x: offset,
        scale,
        opacity,
        rotateY,
        zIndex,
        filter: `brightness(${brightness})`,
        duration,
        ease,
        overwrite: true,
      });
    });
  }, []);

  const goToIndex = useCallback((newIndex: number, animate = true) => {
    const total = artists.length;
    const wrappedIndex = ((newIndex % total) + total) % total;
    setCurrentIndex(wrappedIndex);
    animateCarousel(wrappedIndex, animate);
  }, [artists.length, animateCarousel]);

  const nextArtist = useCallback(() => {
    goToIndex(currentIndexRef.current + 1);
  }, [goToIndex]);

  // Auto-play carousel
  const startAutoPlay = useCallback(() => {
    if (carouselTimerRef.current) {
      carouselTimerRef.current.kill();
    }

    carouselTimerRef.current = gsap.to({}, {
      duration: 4,
      repeat: -1,
      onRepeat: () => {
        if (!isDragging) {
          nextArtist();
        }
      },
    });
  }, [isDragging, nextArtist]);

  const pauseAutoPlay = useCallback(() => {
    if (carouselTimerRef.current) {
      carouselTimerRef.current.pause();
    }
  }, []);

  const resumeAutoPlay = useCallback(() => {
    if (carouselTimerRef.current) {
      carouselTimerRef.current.resume();
    }
  }, []);

  // Initialize draggable for touch devices
  useEffect(() => {
    if (!carouselRef.current) return;

    const isTouchDevice = window.innerWidth < 1024;
    
    if (isTouchDevice) {
      const proxy = document.createElement("div");
      
      draggableRef.current = Draggable.create(proxy, {
        type: "x",
        trigger: carouselRef.current,
        inertia: true,
        onDragStart: function() {
          setIsDragging(true);
          pauseAutoPlay();
          dragStartXRef.current = this.x;
        },
        onDrag: function() {
          const dragDistance = this.x - dragStartXRef.current;
          const threshold = window.innerWidth * 0.12;
          const slidesMoved = Math.round(dragDistance / threshold);
          const newIndex = currentIndexRef.current - slidesMoved;
          animateCarousel(newIndex, false);
        },
        onDragEnd: function() {
          const dragDistance = this.x - dragStartXRef.current;
          const threshold = window.innerWidth * 0.12;
          const slidesMoved = Math.round(dragDistance / threshold);
          const newIndex = currentIndexRef.current - slidesMoved;
          
          goToIndex(newIndex, true);
          gsap.set(proxy, { x: 0 });
          
          setTimeout(() => {
            setIsDragging(false);
            resumeAutoPlay();
          }, 100);
        },
      });
    }

    return () => {
      if (draggableRef.current) {
        draggableRef.current.forEach(d => d.kill());
      }
    };
  }, [animateCarousel, goToIndex, pauseAutoPlay, resumeAutoPlay]);

  // Start auto-play
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (carouselTimerRef.current) {
        carouselTimerRef.current.kill();
      }
    };
  }, [startAutoPlay]);

  // Pause on hover (desktop)
  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      if (window.innerWidth >= 1024) pauseAutoPlay();
    };
    const handleMouseLeave = () => {
      if (window.innerWidth >= 1024 && !isDragging) resumeAutoPlay();
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [pauseAutoPlay, resumeAutoPlay, isDragging]);

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
        animateCarousel(currentIndexRef.current, false);
        scrollTrigger.refresh();
        if (draggableRef.current) {
          draggableRef.current.forEach(d => d.kill());
        }
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        scrollTrigger.kill();
      };
    }
  }, [generateViewportPath, animateCarousel]);

  // Initial animation
  useEffect(() => {
    animateCarousel(currentIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate artist info
  useEffect(() => {
    const nameEl = document.querySelector(".artist-name");
    const dateEl = document.querySelector(".artist-date");
    
    if (nameEl && dateEl) {
      gsap.fromTo([nameEl, dateEl], 
        { opacity: 0, y: 15 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          ease: "power2.out",
          stagger: 0.1
        }
      );
    }
  }, [currentIndex]);

  return (
    <section
      className="artists-section relative bg-black overflow-hidden"
      id="artistsSection"
      ref={artistSectionRef}
      style={{ height: "100svh" }}
    >
      {/* SVG Path */}
      <svg
        id="artistPath"
        width="100%"
        height="100%"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 pointer-events-none z-[1]"
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

      {/* Animated dot */}
      <div
        id="artistPathDot"
        className="fixed w-14 h-14 md:w-20 md:h-20 bg-red-600 rounded-full blur-[20px] pointer-events-none z-[5] opacity-0 -translate-x-1/2 -translate-y-1/2"
        ref={artistDotRef}
      />

      {/* Main Content Container */}
      <div className="relative h-full flex flex-col">
        
        {/* Title */}
        <header className="pt-6 pb-4 md:pt-10 md:pb-6 text-center">
          <h1
            id="artistsTitle"
            className="font-joker text-[clamp(3rem,12vw,7rem)] leading-none text-white lowercase"
          >
            Artists
          </h1>
        </header>

        {/* Carousel Section */}
        <div className="flex-1 flex flex-col justify-center relative min-h-0">

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            className="relative w-full flex items-center justify-center touch-pan-y select-none"
            style={{ 
              height: "clamp(280px, 55vh, 480px)",
              perspective: "1200px"
            }}
          >
            {artists.map((artist, i) => (
              <article
                key={i}
                className={`artist-card absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform cursor-pointer ${
                  i === currentIndex ? "active" : ""
                }`}
                onClick={() => !isDragging && goToIndex(i)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Card with image */}
                <div 
                  className="relative overflow-hidden rounded-lg shadow-2xl"
                  style={{
                    width: "clamp(200px, 35vw, 340px)",
                    aspectRatio: "3/4",
                  }}
                >
                  {/* Image */}
                  <picture>
                    {artist.image.avif && (
                      <source srcSet={artist.image.avif} type="image/avif" />
                    )}
                    <img
                      src={artist.image.fallback}
                      alt={artist.name}
                      loading="lazy"
                      draggable={false}
                      className="w-full h-full object-cover"
                    />
                  </picture>

                  {/* Gradient overlay for active card */}
                  {i === currentIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  )}

                  {/* Red accent border for active */}
                  {i === currentIndex && (
                    <div className="absolute inset-0 border-2 border-red-600/80 rounded-lg" />
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Artist Info - Positioned below carousel */}
          <div className="relative z-10 text-center mt-6 md:mt-8 px-4">
            <h2 className="artist-name font-jqka text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white uppercase tracking-wider">
              {artists[currentIndex].name}
            </h2>
            <p className="artist-date font-jqka text-sm sm:text-base md:text-lg text-white/70 mt-2">
              {artists[currentIndex].date}
            </p>
          </div>

          {/* Progress Indicators */}
          <nav className="flex justify-center gap-2 mt-6 md:mt-8 pb-8" aria-label="Artist navigation">
            {artists.map((_, i) => (
              <button
                key={i}
                onClick={() => goToIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-400 ease-out ${
                  i === currentIndex 
                    ? "bg-red-600 w-8" 
                    : "bg-white/30 hover:bg-white/50 w-1.5"
                }`}
                aria-label={`View ${artists[i].name}`}
                aria-current={i === currentIndex ? "true" : "false"}
              />
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
