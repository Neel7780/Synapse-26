"use client";

import { useRef, useCallback, useEffect, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// GSAP-powered Marquee component
const GSAPMarquee = memo(function GSAPMarquee() {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const marqueeInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!marqueeRef.current || !marqueeInnerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const inner = marqueeInnerRef.current;
    const marquee = marqueeRef.current;

    // Get the width of one set of content
    const contentWidth = inner.scrollWidth / 2;

    // Create the infinite scroll animation
    const tl = gsap.timeline({ repeat: -1 });

    tl.to(inner, {
      x: -contentWidth,
      duration: 30,
      ease: "none",
    });

    // Speed up on scroll
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      scrollVelocity = Math.abs(currentScrollY - lastScrollY);
      lastScrollY = currentScrollY;

      // Increase speed based on scroll velocity
      const speedMultiplier = Math.min(1 + scrollVelocity * 0.02, 4);
      tl.timeScale(speedMultiplier);

      // Gradually return to normal speed
      gsap.to(tl, {
        timeScale: 1,
        duration: 1,
        ease: "power2.out",
        delay: 0.1,
      });
    };

    // Hover pause effect
    const handleMouseEnter = () => {
      gsap.to(tl, { timeScale: 0.3, duration: 0.5, ease: "power2.out" });
    };

    const handleMouseLeave = () => {
      gsap.to(tl, { timeScale: 1, duration: 0.5, ease: "power2.out" });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    marquee.addEventListener("mouseenter", handleMouseEnter);
    marquee.addEventListener("mouseleave", handleMouseLeave);

    // Entrance animation
    gsap.fromTo(
      marquee,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: marquee,
          start: "top 95%",
          once: true,
        },
      }
    );

    return () => {
      window.removeEventListener("scroll", handleScroll);
      marquee.removeEventListener("mouseenter", handleMouseEnter);
      marquee.removeEventListener("mouseleave", handleMouseLeave);
      tl.kill();
    };
  }, []);

  const marqueeText = "Synapse' 26 #joker's realm • ";
  const repeatedText = marqueeText.repeat(8);

  return (
    <div
      ref={marqueeRef}
      className="relative w-full overflow-hidden py-6 mb-5 bg-black border-y border-white/10"
    >
      <div ref={marqueeInnerRef} className="flex w-max will-change-transform">
        <span className="font-jqka uppercase text-3xl lg:text-5xl whitespace-nowrap text-white/90 px-2">
          {repeatedText}
        </span>
        <span className="font-jqka uppercase text-3xl lg:text-5xl whitespace-nowrap text-white/90 px-2">
          {repeatedText}
        </span>
      </div>
    </div>
  );
});

// Memoized grid image component
const GridImage = memo(function GridImage({
  src,
  alt,
  style,
  className,
  refCallback,
}: {
  src: string;
  alt: string;
  style: React.CSSProperties;
  className: string;
  refCallback?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div ref={refCallback} className={className} style={style}>
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
});

export default function HallOfFame() {
  const hallContainerRef = useRef<HTMLDivElement>(null);
  const hallRef = useRef<Array<HTMLDivElement | null>>([]);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const gridItemsRef = useRef<{
    mobile: (HTMLDivElement | null)[];
    tablet: (HTMLDivElement | null)[];
    desktop: (HTMLDivElement | null)[];
  }>({
    mobile: [],
    tablet: [],
    desktop: [],
  });

  const getActiveMode = () => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  };

  const setMobileGridRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      gridItemsRef.current.mobile[index] = el;
    },
    []
  );

  const setTabletGridRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      gridItemsRef.current.tablet[index] = el;
    },
    []
  );

  const setDesktopGridRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      gridItemsRef.current.desktop[index] = el;
    },
    []
  );

  const gridImages = [
    // Row 1 (Top)
    {
      src: "/images_halloffame/6.jpeg",
      alt: "Concert crowd",
      gridPosition: { col: 0, row: 0 },
      colSpan: 2,
      rowSpan: 1,
      startX: -500,
      startY: -400,
      startRotation: -15,
      delay: 0.05,
      mobileCol: 0,
      mobileRow: 0,
      mobileColSpan: 2,
      tabletCol: 0,
      tabletRow: 0,
      tabletColSpan: 2,
    },
    {
      src: "/images_halloffame/11.jpeg",
      alt: "Festival crowd energy",
      gridPosition: { col: 2, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 0,
      startY: -450,
      startRotation: 10,
      delay: 0.07,
      mobileHidden: true,
      tabletCol: 2,
      tabletRow: 0,
    },
    {
      src: "/images_halloffame/14.jpeg",
      alt: "Festival vibes",
      gridPosition: { col: 3, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 100,
      startY: -450,
      startRotation: -8,
      delay: 0.09,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 0,
    },
    {
      src: "/images_halloffame/15.jpeg",
      alt: "Festival friends",
      gridPosition: { col: 4, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 200,
      startY: -400,
      startRotation: 12,
      delay: 0.1,
      mobileCol: 2,
      mobileRow: 0,
      mobileColSpan: 1,
      tabletCol: 4,
      tabletRow: 0,
    },
    {
      src: "/images_halloffame/1.jpeg",
      alt: "Concert energy",
      gridPosition: { col: 5, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 600,
      startY: -400,
      startRotation: -10,
      delay: 0.11,
      mobileHidden: true,
      tabletHidden: true,
    },
    // Row 2
    {
      src: "/images_halloffame/4.jpeg",
      alt: "Dancers",
      gridPosition: { col: 0, row: 1 },
      colSpan: 1,
      rowSpan: 1,
      startX: -600,
      startY: -50,
      startRotation: 15,
      delay: 0.12,
      mobileCol: 0,
      mobileRow: 1,
      mobileColSpan: 1,
      tabletCol: 0,
      tabletRow: 1,
    },
    {
      src: "/images_halloffame/12.jpeg",
      alt: "Concert lights",
      gridPosition: { col: 5, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: 600,
      startY: 0,
      startRotation: -12,
      delay: 0.14,
      mobileCol: 2,
      mobileRow: 1,
      mobileColSpan: 1,
      tabletCol: 4,
      tabletRow: 1,
      tabletRowSpan: 2,
    },
    // Row 3
    {
      src: "/images_halloffame/13.jpeg",
      alt: "Stage show",
      gridPosition: { col: 0, row: 2 },
      colSpan: 1,
      startX: -600,
      startY: 50,
      startRotation: 8,
      delay: 0.16,
      mobileCol: 0,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletCol: 0,
      tabletRow: 2,
      tabletRowSpan: 2,
    },
    {
      src: "/images_halloffame/3.jpeg",
      alt: "Fireworks",
      gridPosition: { col: 1, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: -400,
      startY: 100,
      startRotation: -6,
      delay: 0.17,
      mobileHidden: true,
      tabletCol: 1,
      tabletRow: 2,
      tabletHidden: true,
    },
    {
      src: "/images_halloffame/16.jpeg",
      alt: "Festival food",
      gridPosition: { col: 4, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: 400,
      startY: 100,
      startRotation: 10,
      delay: 0.18,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 1,
      tabletHidden: true,
    },
    // Row 4 (Bottom)
    {
      src: "/images_halloffame/5.jpeg",
      alt: "Festival lights",
      gridPosition: { col: 0, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -600,
      startY: 400,
      startRotation: -15,
      delay: 0.19,
      mobileHidden: true,
      tabletHidden: true,
    },
    {
      src: "/images_halloffame/7.jpeg",
      alt: "Festival art",
      gridPosition: { col: 1, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -400,
      startY: 400,
      startRotation: 12,
      delay: 0.2,
      mobileCol: 1,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletCol: 1,
      tabletRow: 3,
    },
    {
      src: "/images_halloffame/2.jpeg",
      alt: "Art gallery",
      gridPosition: { col: 2, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -200,
      startY: 450,
      startRotation: -8,
      delay: 0.22,
      mobileHidden: true,
      tabletCol: 2,
      tabletRow: 3,
    },
    {
      src: "/images_halloffame/10.jpeg",
      alt: "Live music",
      gridPosition: { col: 3, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 200,
      startY: 450,
      startRotation: 6,
      delay: 0.24,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 3,
    },
    {
      src: "/images_halloffame/9.jpeg",
      alt: "Festival stage",
      gridPosition: { col: 4, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 400,
      startY: 400,
      startRotation: -10,
      delay: 0.25,
      mobileHidden: true,
      tabletCol: 4,
      tabletRow: 3,
    },
    {
      src: "/images_halloffame/8.jpeg",
      alt: "Festival sunset",
      gridPosition: { col: 5, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 600,
      startY: 400,
      startRotation: 15,
      delay: 0.26,
      mobileCol: 2,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletHidden: true,
    },
  ];

  const getGridMetrics = () => {
    if (typeof window === "undefined") {
      return { cellW: 0, cellH: 0, heroCols: 2, heroRows: 2 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w < 768) {
      return { cellW: (w - 16) / 3, cellH: (h - 16) / 3, heroCols: 1, heroRows: 1 };
    }

    if (w < 1024) {
      return { cellW: (w - 24) / 5, cellH: (h - 24) / 4, heroCols: 3, heroRows: 2 };
    }

    return { cellW: (w - 32) / 6, cellH: (h - 32) / 4, heroCols: 2, heroRows: 2 };
  };

  const getActiveHeroIndex = () => {
    if (typeof window === "undefined") return 2;
    const w = window.innerWidth;
    if (w < 768) return 0;
    if (w < 1024) return 1;
    return 2;
  };

  const isItemVisible = (image: (typeof gridImages)[0]) => {
    if (typeof window === "undefined") return true;
    const w = window.innerWidth;
    if (w < 768) return !image.mobileHidden;
    if (w < 1024) return !image.tabletHidden;
    return true;
  };

  const resetGridItems = () => {
    gridImages.forEach((image, index) => {
      const mode = getActiveMode();
      const item = gridItemsRef.current[mode][index];

      if (!item) return;

      if (!isItemVisible(image)) {
        gsap.set(item, { clearProps: "all" });
        return;
      }

      gsap.set(item, {
        x: image.startX,
        y: image.startY,
        rotation: image.startRotation || 0,
        opacity: 0,
        scale: 0.3,
      });
    });
  };

  useGSAP(
    () => {
      if (!hallContainerRef.current) return;

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let startScaleX = 1;
      let startScaleY = 1;
      let hero: HTMLDivElement | null = null;
      let mainScrollTrigger: ScrollTrigger | null = null;

      const resolveHero = () => {
        const index = getActiveHeroIndex();
        hero = hallRef.current[index] ?? null;
        return hero;
      };

      // Scroll indicator bounce animation
      if (scrollIndicatorRef.current && !prefersReducedMotion) {
        gsap.to(scrollIndicatorRef.current.querySelector(".scroll-arrow"), {
          y: 10,
          duration: 0.8,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        });
      }

      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        pointerEvents: "none",
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top",
          end: "+=15%",
          scrub: 1,
        },
      });

      // Title fade with scale
      gsap.to(".hof-title", {
        opacity: 0,
        scale: 0.8,
        y: -30,
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top",
          end: "+=50%",
          scrub: 1,
        },
      });

      const calculateStartScale = () => {
        hero = resolveHero();
        if (!hero) return false;

        const { cellW, cellH, heroCols, heroRows } = getGridMetrics();

        startScaleX = window.innerWidth / (cellW * heroCols);
        startScaleY = window.innerHeight / (cellH * heroRows);

        gsap.set(hero, {
          scaleX: startScaleX,
          scaleY: startScaleY,
          borderRadius: 0,
          transformOrigin: "center center",
        });

        resetGridItems();
        return true;
      };

      const waitForHero = () => {
        if (!calculateStartScale()) {
          requestAnimationFrame(waitForHero);
          return;
        }

        mainScrollTrigger = ScrollTrigger.create({
          trigger: hallContainerRef.current!,
          start: "top top",
          end: "bottom top",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          pinSpacing: true,
          onRefreshInit: calculateStartScale,

          onUpdate: (self) => {
            if (!hero) return;

            const eased = gsap.parseEase("power2.out")(Math.min(self.progress / 0.6, 1));

            // HERO with enhanced animation
            gsap.set(hero, {
              scaleX: gsap.utils.interpolate(startScaleX, 1, eased),
              scaleY: gsap.utils.interpolate(startScaleY, 1, eased),
              borderRadius: `${gsap.utils.interpolate(0, 16, self.progress)}px`,
            });

            // GRID with rotation
            const mode = getActiveMode();

            gridImages.forEach((image, index) => {
              const item = gridItemsRef.current[mode][index];
              if (!item || !isItemVisible(image)) return;

              if (self.progress < image.delay) {
                gsap.set(item, {
                  x: image.startX,
                  y: image.startY,
                  rotation: image.startRotation || 0,
                  opacity: 0,
                  scale: 0.3,
                });
                return;
              }

              const p = gsap.utils.clamp(0, 1, (self.progress - image.delay) / 0.55);
              const easedP = gsap.parseEase("back.out(1.2)")(p);

              gsap.set(item, {
                x: gsap.utils.interpolate(image.startX, 0, easedP),
                y: gsap.utils.interpolate(image.startY, 0, easedP),
                rotation: gsap.utils.interpolate(image.startRotation || 0, 0, easedP),
                opacity: gsap.utils.interpolate(0, 1, p),
                scale: gsap.utils.interpolate(0.3, 1, easedP),
              });
            });
          },
        });

        // Set z-index on pinned element and spacer to ensure correct stacking
        if (mainScrollTrigger.pin) {
          (mainScrollTrigger.pin as HTMLElement).style.zIndex = "5";
        }
        if (mainScrollTrigger.spacer) {
          (mainScrollTrigger.spacer as HTMLElement).style.zIndex = "5";
        }

        ScrollTrigger.refresh();
      };

      waitForHero();

      return () => {
        // Only kill the main ScrollTrigger, not all of them
        mainScrollTrigger?.kill();
      };
    },
    { scope: hallContainerRef }
  );

  return (
    <div className="relative overflow-hidden w-full bg-black z-0">
      <div ref={hallContainerRef} className="relative" style={{ zIndex: 0 }}>
        <div className="h-[100svh] w-full bg-black">
          {/* Mobile Grid (3x3) */}
          <div className="md:hidden absolute inset-0 flex items-center justify-center p-2">
            <div
              className="relative w-full h-full grid gap-1"
              style={{
                gridTemplateColumns: "repeat(3, 1fr)",
                gridTemplateRows: "repeat(3, 1fr)",
              }}
            >
              {gridImages.map((image, index) => {
                if (image.mobileHidden) return null;

                return (
                  <GridImage
                    key={`mobile-${index}`}
                    src={image.src}
                    alt={image.alt}
                    refCallback={setMobileGridRef(index)}
                    className="rounded-lg overflow-hidden shadow-2xl will-change-transform"
                    style={{
                      gridColumn: `${(image.mobileCol ?? image.gridPosition.col) + 1} / span ${image.mobileColSpan ?? 1}`,
                      gridRow: `${(image.mobileRow ?? image.gridPosition.row) + 1} / span 1`,
                    }}
                  />
                );
              })}

              {/* Mobile Hero */}
              <div
                ref={(el) => {
                  hallRef.current[0] = el;
                }}
                className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-lg relative"
                style={{
                  gridColumn: "2 / 3",
                  gridRow: "2 / 3",
                  transformOrigin: "center center",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-xl text-center w-full z-5 font-white font-joker will-change-transform">
                  hall of fame
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tablet Grid (5x4) */}
          <div className="hidden md:flex lg:hidden absolute inset-0 items-center justify-center p-3">
            <div
              className="relative grid gap-2 w-full h-full"
              style={{
                gridTemplateColumns: "repeat(5, 1fr)",
                gridTemplateRows: "repeat(4, 1fr)",
              }}
            >
              {gridImages.map((image, index) => {
                if (image.tabletHidden) return null;

                return (
                  <GridImage
                    key={`tablet-${index}`}
                    src={image.src}
                    alt={image.alt}
                    refCallback={setTabletGridRef(index)}
                    className="rounded-xl overflow-hidden shadow-2xl will-change-transform"
                    style={{
                      gridColumn: `${(image.tabletCol ?? image.gridPosition.col) + 1} / span ${image.tabletColSpan ?? image.colSpan ?? 1}`,
                      gridRow: `${(image.tabletRow ?? image.gridPosition.row) + 1} / span ${image.tabletRowSpan ?? image.rowSpan ?? 1}`,
                    }}
                  />
                );
              })}

              {/* Tablet Hero */}
              <div
                ref={(el) => {
                  hallRef.current[1] = el;
                }}
                className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-xl relative"
                style={{
                  gridColumn: "2 / 5",
                  gridRow: "2 / 4",
                  transformOrigin: "center center",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker will-change-transform">
                  hall of fame
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Desktop Grid (6x4) */}
          <div className="hidden lg:flex absolute inset-0 items-center justify-center p-4">
            <div
              className="relative grid gap-3 w-full h-full"
              style={{
                gridTemplateColumns: "repeat(6, 1fr)",
                gridTemplateRows: "repeat(4, 1fr)",
              }}
            >
              {gridImages.map((image, index) => (
                <GridImage
                  key={`desktop-${index}`}
                  src={image.src}
                  alt={image.alt}
                  refCallback={setDesktopGridRef(index)}
                  className="rounded-xl overflow-hidden shadow-2xl will-change-transform"
                  style={{
                    gridColumn: `${image.gridPosition.col + 1} / span ${image.colSpan ?? 1}`,
                    gridRow: `${image.gridPosition.row + 1} / span ${image.rowSpan ?? 1}`,
                  }}
                />
              ))}

              {/* Desktop Hero */}
              <div
                ref={(el) => {
                  hallRef.current[2] = el;
                }}
                className="overflow-hidden relative will-change-transform shadow-2xl z-10 rounded-xl"
                style={{
                  gridColumn: "3 / 5",
                  gridRow: "2 / 4",
                  transformOrigin: "center center",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker will-change-transform">
                  hall of fame
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Enhanced Scroll indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute top-30 right-2 sm:right-10 flex flex-col items-center gap-2 text-white z-20"
          >
            <span className="text-xl md:text-3xl tracking-widest uppercase font-jqka">
              Scroll to explore
            </span>
            <div className="scroll-arrow flex flex-col items-center">
              <svg
                className="w-6 h-6 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* GSAP-Powered Marquee */}
      <GSAPMarquee />
    </div>
  );
}
