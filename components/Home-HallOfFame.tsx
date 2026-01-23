"use client";

import { useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Hero card component - moved outside to avoid creating during render
const HeroCard = ({
  refIndex: _refIndex,
  gridStyle,
  titleSize,
  refSetter
}: {
  refIndex: number;
  gridStyle: React.CSSProperties;
  titleSize: string;
  refSetter: (el: HTMLDivElement | null) => void;
}) => (
  <div
    ref={refSetter}
    className="overflow-hidden relative will-change-transform shadow-2xl z-10 rounded-xl"
    style={{
      ...gridStyle,
      transformOrigin: "center center",
    }}
  >
    <Image
      src="/images_home/HallOfFame.png"
      alt="Hall of Fame"
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
    <div className="hof-title absolute inset-0 flex items-end justify-center pb-6 md:pb-8">
      <span className={`${titleSize} text-center font-white font-joker text-white drop-shadow-lg tracking-wider`}>
        hall of fame
      </span>
    </div>
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
  </div>
);

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

  const getActiveMode = useCallback(() => {
    if (typeof window === "undefined") return "desktop";
    const w = window.innerWidth;
    if (w < 768) return "mobile";
    if (w < 1024) return "tablet";
    return "desktop";
  }, []);

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
      src: '/images_halloffame/6.jpeg',
      alt: 'Concert crowd',
      gridPosition: { col: 0, row: 0 },
      colSpan: 2,
      rowSpan: 1,
      startX: -500,
      startY: -400,
      startRotation: -15,
      delay: 0.08,
      mobileCol: 0,
      mobileRow: 0,
      mobileColSpan: 2,
      tabletCol: 0,
      tabletRow: 0,
      tabletColSpan: 2,
    },
    {
      src: '/images_halloffame/11.jpeg',
      alt: 'Festival crowd energy',
      gridPosition: { col: 2, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 0,
      startY: -450,
      startRotation: 8,
      delay: 0.12,
      mobileHidden: true,
      tabletCol: 2,
      tabletRow: 0,
    },
    {
      src: '/images_halloffame/14.jpeg',
      alt: 'Festival vibes',
      gridPosition: { col: 3, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 100,
      startY: -450,
      startRotation: -10,
      delay: 0.15,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 0,
    },
    {
      src: '/images_halloffame/15.jpeg',
      alt: 'Festival friends',
      gridPosition: { col: 4, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 200,
      startY: -400,
      startRotation: 12,
      delay: 0.18,
      mobileCol: 2,
      mobileRow: 0,
      mobileColSpan: 1,
      tabletCol: 4,
      tabletRow: 0,
    },
    {
      src: '/images_halloffame/1.jpeg',
      alt: 'Concert energy',
      gridPosition: { col: 5, row: 0 },
      colSpan: 1,
      rowSpan: 1,
      startX: 600,
      startY: -400,
      startRotation: -8,
      delay: 0.2,
      mobileHidden: true,
      tabletHidden: true,
    },

    // Row 2
    {
      src: '/images_halloffame/4.jpeg',
      alt: 'Dancers',
      gridPosition: { col: 0, row: 1 },
      colSpan: 1,
      rowSpan: 1,
      startX: -600,
      startY: -50,
      startRotation: 15,
      delay: 0.22,
      mobileCol: 0,
      mobileRow: 1,
      mobileColSpan: 1,
      tabletCol: 0,
      tabletRow: 1,
    },
    {
      src: '/images_halloffame/12.jpeg',
      alt: 'Concert lights',
      gridPosition: { col: 5, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: 600,
      startY: 0,
      startRotation: -12,
      delay: 0.25,
      mobileCol: 2,
      mobileRow: 1,
      mobileColSpan: 1,
      tabletCol: 4,
      tabletRow: 1,
      tabletRowSpan: 2,
    },

    // Row 3
    {
      src: '/images_halloffame/13.jpeg',
      alt: 'Stage show',
      gridPosition: { col: 0, row: 2 },
      colSpan: 1,
      startX: -600,
      startY: 50,
      startRotation: -10,
      delay: 0.28,
      mobileCol: 0,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletCol: 0,
      tabletRow: 2,
      tabletRowSpan: 2,
    },
    {
      src: '/images_halloffame/3.jpeg',
      alt: 'Fireworks',
      gridPosition: { col: 1, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: -400,
      startY: 100,
      startRotation: 8,
      delay: 0.3,
      mobileHidden: true,
      tabletCol: 1,
      tabletRow: 2,
      tabletHidden: true,
    },
    {
      src: '/images_halloffame/16.jpeg',
      alt: 'Festival food',
      gridPosition: { col: 4, row: 1 },
      colSpan: 1,
      rowSpan: 2,
      startX: 400,
      startY: 100,
      startRotation: -15,
      delay: 0.32,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 1,
      tabletHidden: true,
    },

    // Row 4 (Bottom)
    {
      src: '/images_halloffame/5.jpeg',
      alt: 'Festival lights',
      gridPosition: { col: 0, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -600,
      startY: 400,
      startRotation: 10,
      delay: 0.35,
      mobileHidden: true,
      tabletHidden: true,
    },
    {
      src: '/images_halloffame/7.jpeg',
      alt: 'Festival art',
      gridPosition: { col: 1, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -400,
      startY: 400,
      startRotation: -8,
      delay: 0.38,
      mobileCol: 1,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletCol: 1,
      tabletRow: 3,
    },
    {
      src: '/images_halloffame/2.jpeg',
      alt: 'Art gallery',
      gridPosition: { col: 2, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: -200,
      startY: 450,
      startRotation: 12,
      delay: 0.4,
      mobileHidden: true,
      tabletCol: 2,
      tabletRow: 3,
    },
    {
      src: '/images_halloffame/10.jpeg',
      alt: 'Live music',
      gridPosition: { col: 3, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 200,
      startY: 450,
      startRotation: -10,
      delay: 0.42,
      mobileHidden: true,
      tabletCol: 3,
      tabletRow: 3,
    },
    {
      src: '/images_halloffame/9.jpeg',
      alt: 'Festival stage',
      gridPosition: { col: 4, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 400,
      startY: 400,
      startRotation: 8,
      delay: 0.45,
      mobileHidden: true,
      tabletCol: 4,
      tabletRow: 3,
    },
    {
      src: '/images_halloffame/8.jpeg',
      alt: 'Festival sunset',
      gridPosition: { col: 5, row: 3 },
      colSpan: 1,
      rowSpan: 1,
      startX: 600,
      startY: 400,
      startRotation: -12,
      delay: 0.48,
      mobileCol: 2,
      mobileRow: 2,
      mobileColSpan: 1,
      tabletHidden: true,
    },
  ];

  const getGridMetrics = useCallback(() => {
    if (typeof window === "undefined") {
      return { cellW: 0, cellH: 0, heroCols: 2, heroRows: 2 };
    }
    const w = window.innerWidth;
    const h = window.innerHeight;

    if (w < 768) {
      return {
        cellW: (w - 16) / 3,
        cellH: (h - 16) / 3,
        heroCols: 1,
        heroRows: 1,
      };
    }

    if (w < 1024) {
      return {
        cellW: (w - 24) / 5,
        cellH: (h - 24) / 4,
        heroCols: 3,
        heroRows: 2,
      };
    }

    return {
      cellW: (w - 32) / 6,
      cellH: (h - 32) / 4,
      heroCols: 2,
      heroRows: 2,
    };
  }, []);

  const getActiveHeroIndex = useCallback(() => {
    if (typeof window === "undefined") return 2;
    const w = window.innerWidth;
    if (w < 768) return 0;
    if (w < 1024) return 1;
    return 2;
  }, []);

  const isItemVisible = useCallback((image: typeof gridImages[0]) => {
    if (typeof window === "undefined") return true;
    const w = window.innerWidth;
    if (w < 768) return !image.mobileHidden;
    if (w < 1024) return !image.tabletHidden;
    return true;
  }, []);

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
        filter: "blur(10px)",
      });
    });
  };

  // Scroll indicator bounce animation
  useEffect(() => {
    if (!scrollIndicatorRef.current) return;

    const arrow = scrollIndicatorRef.current.querySelector('.scroll-arrow');
    if (arrow) {
      gsap.to(arrow, {
        y: 8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!hallContainerRef.current) return;

      let startScaleX = 1;
      let startScaleY = 1;
      let hero: HTMLDivElement | null = null;

      const resolveHero = () => {
        const index = getActiveHeroIndex();
        hero = hallRef.current[index] ?? null;
        return hero;
      };

      // Fade out scroll indicator smoothly
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        y: -20,
        pointerEvents: "none",
        ease: "power2.out",
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top+=2%",
          end: "+=15%",
          scrub: 0.5,
        },
      });

      // Fade out title with elegant animation
      gsap.to(".hof-title", {
        opacity: 0,
        y: 30,
        scale: 0.95,
        ease: "power2.out",
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top+=5%",
          end: "+=50%",
          scrub: 0.8,
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
          filter: "brightness(1)",
        });

        resetGridItems();
        return true;
      };

      const waitForHero = () => {
        if (!calculateStartScale()) {
          requestAnimationFrame(waitForHero);
          return;
        }

        ScrollTrigger.create({
          trigger: hallContainerRef.current!,
          start: "top top-=5%",
          end: "bottom top",
          scrub: 1.2, // Smoother scrubbing
          pin: true,
          anticipatePin: 1,
          onRefreshInit: calculateStartScale,

          onUpdate: (self) => {
            if (!hero) return;

            // Use a custom easing for the hero zoom-out
            const heroProgress = Math.min(self.progress / 0.5, 1);
            const heroEased = gsap.parseEase("power3.out")(heroProgress);

            // Hero zoom-out animation with enhanced effects
            const currentScaleX = gsap.utils.interpolate(startScaleX, 1, heroEased);
            const currentScaleY = gsap.utils.interpolate(startScaleY, 1, heroEased);
            const currentRadius = gsap.utils.interpolate(0, 20, heroEased);
            const currentBrightness = gsap.utils.interpolate(1, 0.95, heroEased);

            gsap.set(hero, {
              scaleX: currentScaleX,
              scaleY: currentScaleY,
              borderRadius: `${currentRadius}px`,
              filter: `brightness(${currentBrightness})`,
            });

            // Grid items animation with staggered reveal
            const mode = getActiveMode();

            gridImages.forEach((image, index) => {
              const item = gridItemsRef.current[mode][index];
              if (!item || !isItemVisible(image)) return;

              const itemDelay = image.delay;
              const itemDuration = 0.4; // Duration of each item's animation

              if (self.progress < itemDelay) {
                // Item hasn't started animating yet
                gsap.set(item, {
                  x: image.startX,
                  y: image.startY,
                  rotation: image.startRotation || 0,
                  opacity: 0,
                  scale: 0.3,
                  filter: "blur(10px)",
                });
                return;
              }

              // Calculate item's individual progress
              const itemProgress = gsap.utils.clamp(
                0,
                1,
                (self.progress - itemDelay) / itemDuration
              );

              // Use elastic easing for a bouncy, playful feel
              const itemEased = gsap.parseEase("back.out(1)")(itemProgress);
              const opacityEased = gsap.parseEase("power2.out")(itemProgress);

              gsap.set(item, {
                x: gsap.utils.interpolate(image.startX, 0, itemEased),
                y: gsap.utils.interpolate(image.startY, 0, itemEased),
                rotation: gsap.utils.interpolate(image.startRotation || 0, 0, itemEased),
                opacity: gsap.utils.interpolate(0, 1, opacityEased),
                scale: gsap.utils.interpolate(0.3, 1, itemEased),
                filter: `blur(${gsap.utils.interpolate(10, 0, opacityEased)}px)`,
              });
            });
          },
        });

        ScrollTrigger.refresh();
      };

      waitForHero();

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: hallContainerRef }
  );

  // Image card component for cleaner code
  const ImageCard = ({
    image,
    index,
    refSetter,
    gridStyle
  }: {
    image: typeof gridImages[0];
    index: number;
    refSetter: (el: HTMLDivElement | null) => void;
    gridStyle: React.CSSProperties;
  }) => (
    <div
      key={index}
      ref={refSetter}
      className="rounded-xl overflow-hidden shadow-2xl will-change-transform group"
      style={gridStyle}
    >
      <div className="relative w-full h-full overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          sizes="(max-width: 768px) 33vw, (max-width: 1024px) 20vw, 16vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
    </div>
  );

  // Ref setter for hero cards
  const setHeroRef = useCallback(
    (index: number) => (el: HTMLDivElement | null) => {
      hallRef.current[index] = el;
    },
    []
  );

  return (
    <div className="relative overflow-hidden w-full bg-black">
      <div ref={hallContainerRef} className="relative">
        <div className="h-[100svh] w-full bg-black">

          {/* Mobile Grid (3x3) */}
          <div className="md:hidden absolute inset-0 flex items-center justify-center p-2">
            <div
              className="relative w-full h-full grid gap-1.5"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
              }}
            >
              {gridImages.map((image, index) => {
                if (image.mobileHidden) return null;

                return (
                  <ImageCard
                    key={`mobile-${index}`}
                    image={image}
                    index={index}
                    refSetter={setMobileGridRef(index)}
                    gridStyle={{
                      gridColumn: `${(image.mobileCol ?? image.gridPosition.col) + 1} / span ${image.mobileColSpan ?? 1}`,
                      gridRow: `${(image.mobileRow ?? image.gridPosition.row) + 1} / span 1`,
                    }}
                  />
                );
              })}

              <HeroCard
                refIndex={0}
                gridStyle={{
                  gridColumn: "2 / 3",
                  gridRow: "2 / 3",
                }}
                titleSize="text-lg"
                refSetter={setHeroRef(0)}
              />
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
                  <ImageCard
                    key={`tablet-${index}`}
                    image={image}
                    index={index}
                    refSetter={setTabletGridRef(index)}
                    gridStyle={{
                      gridColumn: `${(image.tabletCol ?? image.gridPosition.col) + 1} / span ${image.tabletColSpan ?? image.colSpan ?? 1}`,
                      gridRow: `${(image.tabletRow ?? image.gridPosition.row) + 1} / span ${image.tabletRowSpan ?? image.rowSpan ?? 1}`,
                    }}
                  />
                );
              })}

              <HeroCard
                refIndex={1}
                gridStyle={{
                  gridColumn: "2 / 5",
                  gridRow: "2 / 4",
                }}
                titleSize="text-4xl"
                refSetter={setHeroRef(1)}
              />
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
                <ImageCard
                  key={`desktop-${index}`}
                  image={image}
                  index={index}
                  refSetter={setDesktopGridRef(index)}
                  gridStyle={{
                    gridColumn: `${image.gridPosition.col + 1} / span ${image.colSpan ?? 1}`,
                    gridRow: `${image.gridPosition.row + 1} / span ${image.rowSpan ?? 1}`,
                  }}
                />
              ))}

              <HeroCard
                refIndex={2}
                gridStyle={{
                  gridColumn: "3 / 5",
                  gridRow: "2 / 4",
                }}
                titleSize="text-5xl"
                refSetter={setHeroRef(2)}
              />
            </div>
          </div>

          {/* Scroll indicator - Enhanced */}
          <div
            ref={scrollIndicatorRef}
            className="absolute top-24 md:top-28 right-4 sm:right-8 flex flex-col items-center gap-3 text-white z-20"
          >
            <span className="text-sm md:text-lg tracking-[0.3em] uppercase font-jqka opacity-80">
              Scroll
            </span>
            <div className="scroll-arrow flex flex-col items-center gap-1">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-60"
              >
                <path
                  d="M12 4L12 20M12 20L6 14M12 20L18 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Section - Enhanced */}
      <div className="relative w-full overflow-hidden py-6 bg-black border-t border-white/10">
        <div className="flex w-max animate-marquee">
          {[...Array(2)].map((_, i) => (
            <span key={i} className="font-jqka uppercase text-2xl md:text-4xl lg:text-5xl whitespace-nowrap text-white/90 tracking-wider">
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
              Synapse&apos; 26 #joker&apos;s realm&nbsp;&nbsp;•&nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
