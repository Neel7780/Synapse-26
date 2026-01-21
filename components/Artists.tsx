"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

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

export default function ArtistsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

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
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

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
    if (!imagesContainerRef.current) return;

    const items = imagesContainerRef.current.querySelectorAll(".carousel-item");
    const isMobile = window.innerWidth < 600;
    const spacing = isMobile ? window.innerWidth * 0.75 : window.innerWidth * 0.45;

    items.forEach((item, i) => {
      const element = item as HTMLElement;
      let diff = i - currentIndex;
      const total = items.length;

      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      const offset = diff * spacing;
      const absOffset = Math.abs(offset);

      let opacity = 1;
      let scale = 1;
      let zIndex = 5;

      if (diff === 0) {
        element.classList.add("center");
        zIndex = 10;
        opacity = 1;
        scale = 1;
      } else {
        element.classList.remove("center");

        if (isMobile) {
          // Mobile: show only adjacent items with reduced opacity
          if (Math.abs(diff) === 1) {
            opacity = 0.4;
            scale = 0.7;
          } else {
            opacity = 0;
            scale = 0.5;
          }
        } else {
          // Desktop Fade Logic
          if (absOffset > spacing) {
            opacity = Math.max(0.3, 1 - (absOffset - spacing) / (spacing * 2));
            scale = 0.8;
          }
        }

        zIndex = 5 - Math.abs(diff);
      }

      element.style.transform = `translateX(${offset}px) scale(${scale})`;
      element.style.opacity = `${opacity}`;
      element.style.zIndex = `${zIndex}`;
    });
  }, [currentIndex]);

  const startCarouselTimer = useCallback(() => {
    if (carouselTimerRef.current) {
      clearInterval(carouselTimerRef.current);
    }

    carouselTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artists.length);
    }, 10000);
  }, [artists.length]);

  const resetCarouselTimer = useCallback(() => {
    startCarouselTimer();
  }, [startCarouselTimer]);

  const nextArtist = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % artists.length);
    resetCarouselTimer();
  }, [artists.length, resetCarouselTimer]);

  const prevArtist = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + artists.length) % artists.length);
    resetCarouselTimer();
  }, [artists.length, resetCarouselTimer]);

  useEffect(() => {
    startCarouselTimer();

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [startCarouselTimer]);

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
          const point = artistPath.getPointAtLength(
            progress * artistPathLength
          );
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
        animateCarousel();
        scrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        scrollTrigger.kill();
      };
    }
  }, [generateViewportPath, animateCarousel]);

  useEffect(() => {
    animateCarousel();
  }, [currentIndex, animateCarousel]);

  return (
    <div
      className="artists-section relative bg-black overflow-x-clip"
      id="artistsSection"
      ref={artistSectionRef}
      style={{
        height: "100svh",
      }}
    >
      <div className="artists-content relative top-[-1.6px] right-[-1px] h-full flex flex-col">
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

        {/* Title at top */}
        <div className="flex-shrink-0 pt-1 pb-12">
          <h1
            id="artistsTitle"
            className="font-joker text-[clamp(2.5rem,10vw,6rem)] px-8 leading-none text-white lowercase text-center"
          >
            ARTISTS
          </h1>
        </div>

        {/* Carousel - Center area */}
        <div className="carousel relative flex-1 min-h-0 flex items-center justify-center">
          {/* White line through center - Perfectly centered */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-white z-0"></div>

          <div
            id="artistPathDot"
            className="fixed w-14 h-14 md:w-22.5 md:h-22.5 bg-[#ff0000] rounded-full blur-[20px] pointer-events-none z-5 opacity-0 -translate-x-1/2 -translate-y-1/2"
            ref={artistDotRef}
          ></div>

          {/* Images Container - Centered */}
          <div
            className="images-container relative w-full h-full flex items-center justify-center"
            id="imagesContainer"
            ref={imagesContainerRef}
          >
            {artists.map((artist, i) => (
              <div
                key={i}
                className={`carousel-item absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-600 ease-in-out ${i === currentIndex ? "center" : ""
                  }`}
                onClick={() => {
                  setCurrentIndex(i);
                  resetCarouselTimer();
                }}
                style={{
                  transform: `translate(-50%, -50%) translateX(0px) scale(1)`,
                }}
              >
                <picture>
                  {artist.image.avif && (
                    <source srcSet={artist.image.avif} type="image/avif" />
                  )}

                  <img
                    src={artist.image.fallback}
                    alt={artist.name}
                    loading="lazy"
                    className="block object-cover z-10 transition-transform duration-300 md:hover:scale-110 cursor-pointer"
                    style={{
                      width:
                        i === currentIndex
                          ? "clamp(200px, 50vw, 480px)"
                          : "clamp(120px, 25vw, 230px)",
                      height:
                        i === currentIndex
                          ? "clamp(120px, 35vw, 390px)"
                          : "clamp(90px, 25vw, 230px)",
                    }}
                    sizes="(max-width: 768px) 80vw, 520px"
                  />
                </picture>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <button
            className="
          group
          absolute top-1/2 -translate-y-1/2
          flex items-center justify-center
          bg-red-600 hover:bg-white
          transition-colors duration-400
          z-20 cursor-pointer
        "
            onClick={nextArtist}
            style={{
              width: "clamp(32px, 6vw, 62px)",
              height: "clamp(28px, 5vw, 54px)",
              left: "calc(clamp(200px, 50vw, 480px)/2 + 50%)",
            }}
            aria-label="Next artist"
          >
            <div
              className="
            bg-white
            group-hover:bg-red-600
            transition-colors duration-400
            rotate-90
          "
              style={{
                width: "clamp(14px, 2.5vw, 33px)",
                height: "clamp(10px, 1.8vw, 22px)",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </button>

          <button
            className="
          group
          absolute top-1/2 -translate-y-1/2
          flex items-center justify-center
          bg-red-600 hover:bg-white
          transition-colors duration-400
          z-20 cursor-pointer
        "
            onClick={prevArtist}
            style={{
              width: "clamp(32px, 6vw, 62px)",
              height: "clamp(28px, 5vw, 54px)",
              right: "calc(clamp(200px, 50vw, 480px)/2 + 50%)",
            }}
            aria-label="Previous artist"
          >
            <div
              className="
            bg-white
            group-hover:bg-red-600
            transition-colors duration-400
            -rotate-90
          "
              style={{
                width: "clamp(14px, 2.5vw, 33px)",
                height: "clamp(10px, 1.8vw, 22px)",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
              }}
            />
          </button>
        </div>

        {/* Artist Info at bottom */}
        <div className="flex-shrink-0 pb-6 sm:pb-8 pt-4 flex justify-center px-4 mb-8">
          <div className="border-t-2 border-b-2 border-white py-3 px-6 text-center text-white bg-black/50 backdrop-blur-sm w-full max-w-md">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-jqka uppercase">
              {artists[currentIndex].name}
            </h2>
            <p className="text-sm sm:text-base md:text-xl font-jqka">
              {artists[currentIndex].date}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}