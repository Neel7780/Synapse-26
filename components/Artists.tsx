"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
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

  const artistSectionRef = useRef<HTMLDivElement>(null);
  const artistSvgRef = useRef<SVGSVGElement>(null);
  const artistPathRef = useRef<SVGPathElement>(null);
  const artistDotRef = useRef<HTMLDivElement>(null);
  const imagesContainerRef = useRef<HTMLDivElement>(null);
  const carouselTimerRef = useRef<NodeJS.Timeout | null>(null);

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
        // Empty state
        loadedArtists = [
          {
            name: "TO BE DECLARED",
            date: "COMING SOON",
            image: "", // Empty image string triggers fallback UI
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

  const animateCarousel = useCallback(() => {
    if (!imagesContainerRef.current) return;

    const items = imagesContainerRef.current.querySelectorAll(".carousel-item");
    if (items.length === 0) return;

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
      } else if (Math.abs(diff) === 1) {
        element.classList.remove("center");
        opacity = 1; // Show neighbors
        scale = 0.8; // Slightly smaller
        zIndex = 5;
      } else {
        element.classList.remove("center");
        // Hide items further away to prevent "back crossing" visual artifacts
        opacity = 0;
        scale = 0.5;
        zIndex = 1;
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

    if (artists.length <= 1) return; // No auto-scroll for single item

    carouselTimerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % artists.length);
    }, 10000);
  }, [artists.length]);

  const resetCarouselTimer = useCallback(() => {
    startCarouselTimer();
  }, [startCarouselTimer]);

  const nextArtist = useCallback(() => {
    if (artists.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % artists.length);
    resetCarouselTimer();
  }, [artists.length, resetCarouselTimer]);

  const prevArtist = useCallback(() => {
    if (artists.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + artists.length) % artists.length);
    resetCarouselTimer();
  }, [artists.length, resetCarouselTimer]);

  useEffect(() => {
    if (!loading) {
      startCarouselTimer();
    }

    return () => {
      if (carouselTimerRef.current) {
        clearInterval(carouselTimerRef.current);
      }
    };
  }, [startCarouselTimer, loading]);

  useEffect(() => {
    if (loading) return;

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
      // Trigger initial animation
      animateCarousel();

      return () => {
        window.removeEventListener("resize", handleResize);
        scrollTrigger.kill();
      };
    }
  }, [generateViewportPath, animateCarousel, loading]);

  useEffect(() => {
    if (!loading) animateCarousel();
  }, [currentIndex, animateCarousel, loading]);

  if (loading) return null; // Or a loader

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
                {artist.image ? (
                  <img
                    src={artist.image}
                    alt={artist.name}
                    loading="lazy"
                    className="block object-cover z-10 transition-transform duration-300 md:hover:scale-110 cursor-pointer max-[550px]:scale-120"
                    style={{
                      width:
                        i === currentIndex
                          ? "clamp(240px, 45vw, 480px)"
                          : "clamp(140px, 28vw, 260px)",
                      height:
                        i === currentIndex
                          ? "clamp(150px, 35vw, 420px)"
                          : "clamp(110px, 28vw, 260px)",
                    }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center bg-zinc-900 border border-white/20 z-10 transition-transform duration-300 cursor-default"
                    style={{
                      width:
                        i === currentIndex
                          ? "clamp(240px, 45vw, 480px)"
                          : "clamp(140px, 28vw, 260px)",
                      height:
                        i === currentIndex
                          ? "clamp(150px, 20vw, 300px)"
                          : "clamp(110px, 22vw, 260px)",
                    }}
                  >
                    <span className="font-joker text-white text-3xl md:text-5xl text-center opacity-50 px-4">
                      TO BE DECLARED
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          {artists.length > 1 && (
            <>
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
                  left: "calc(clamp(240px, 45vw, 480px)/2 + 50%)",
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
                  right: "calc(clamp(240px, 45vw, 480px)/2 + 50%)",
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
            </>
          )}
        </div>

        {/* Artist Info at bottom */}
        {artists.length > 0 && (
          <div className="flex-shrink-0 pb-2 sm:pb-4 pt-4 flex justify-center px-4 mb-6">
            <div className="border-t-2 border-b-2 border-white py-3 px-6 text-center text-white bg-black/50 backdrop-blur-sm w-full max-w-md">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-jqka uppercase">
                {artists[currentIndex].name}
              </h2>
              <p className="text-sm sm:text-base md:text-xl font-jqka">
                {artists[currentIndex].date}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}