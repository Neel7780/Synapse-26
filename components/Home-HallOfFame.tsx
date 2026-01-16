"use client";

import { useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HallOfFame() {
  const hallContainerRef = useRef<HTMLDivElement>(null);
  const hallRef = useRef<Array<HTMLDivElement | null>>([]);
  const scrollIndicatorRef = useRef(null);
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
      src: '/images_halloffame/6.jpeg',
      alt: 'Concert crowd',
      gridPosition: { col: 0, row: 0 },
      colSpan: 2,
      rowSpan: 1,
      startX: -500,
      startY: -400,
      delay: 0.05,
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
      delay: 0.07,
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
      delay: 0.09,
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
      delay: 0.1,
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
      delay: 0.11,
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
      delay: 0.12,
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
      src: '/images_halloffame/13.jpeg',
      alt: 'Stage show',
      gridPosition: { col: 0, row: 2 },
      colSpan: 1,
      startX: -600,
      startY: 50,
      delay: 0.16,
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
      delay: 0.17,
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
      delay: 0.18,
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
      delay: 0.19,
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
      delay: 0.2,
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
      delay: 0.22,
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
      delay: 0.24,
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
      delay: 0.25,
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
  };
  const getActiveHeroIndex = () => {
    if (typeof window === "undefined") return 2;
    const w = window.innerWidth;
    if (w < 768) return 0;
    if (w < 1024) return 1;
    return 2;
  };

  const isItemVisible = (image: any) => {
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
        opacity: 0,
        scale: 0.4,
      });
    });
  };

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
      gsap.to(scrollIndicatorRef.current, {
        opacity: 0,
        pointerEvents: "none",
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top",
          end: "+=20%",
          scrub: true,
        },
      });

      gsap.to(".hof-title", {
        opacity: 0,
        scrollTrigger: {
          trigger: hallContainerRef.current,
          start: "top top",
          end: "+=70%",
          scrub: true,
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

        ScrollTrigger.create({
          trigger: hallContainerRef.current!,
          start: "top top",
          end: "+=200%",
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: calculateStartScale,

          onUpdate: (self) => {
            if (!hero) return;

            const eased = gsap.parseEase("power3.out")(
              Math.min(self.progress / 0.6, 1)
            );

            // HERO - Smoother scaling with enhanced easing
            gsap.to(hero, {
              scaleX: gsap.utils.interpolate(startScaleX, 1, eased),
              scaleY: gsap.utils.interpolate(startScaleY, 1, eased),
              borderRadius: `${gsap.utils.interpolate(0, 16, self.progress)}px`,
              duration: 0.3,
              ease: "power3.out",
              overwrite: "auto",
              force3D: true,
            });

            // GRID - Enhanced entrance animations with back.out easing
            const mode = getActiveMode();

            gridImages.forEach((image, index) => {
              const item = gridItemsRef.current[mode][index];
              if (!item || !isItemVisible(image)) return;

              if (self.progress < image.delay) {
                gsap.to(item, {
                  x: image.startX,
                  y: image.startY,
                  opacity: 0,
                  scale: 0.4,
                  duration: 0.2,
                  ease: "power2.in",
                  overwrite: "auto",
                  force3D: true,
                });
                return;
              }

              const p = gsap.utils.clamp(
                0,
                1,
                (self.progress - image.delay) / 0.55
              );

              // Apply back.out easing for slight overshoot effect
              const backEased = gsap.parseEase("back.out(1.7)")(p);

              gsap.to(item, {
                x: gsap.utils.interpolate(image.startX, 0, p),
                y: gsap.utils.interpolate(image.startY, 0, p),
                opacity: gsap.utils.interpolate(0, 1, p),
                scale: gsap.utils.interpolate(0.4, 1, backEased),
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto",
                force3D: true,
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

  return (
    <div className="relative overflow-hidden w-full bg-black">
      <div ref={hallContainerRef} className="relative">
        <div className="h-[100dvh] w-full bg-black">
          {/* Mobile Grid (3x3) */}
          <div className="md:hidden absolute inset-0 flex items-center justify-center p-2">
            <div
              className="relative w-full h-full grid gap-1"
              style={{
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
              }}
            >
              {gridImages.map((image, index) => {
                if (image.mobileHidden) return null;

                return (
                  <div
                    key={`mobile-${index}`}
                    ref={setMobileGridRef(index)}
                    className="rounded-lg overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-20 cursor-pointer"
                    style={{
                      gridColumn: `${(image.mobileCol ?? image.gridPosition.col) + 1
                        } / span ${image.mobileColSpan ?? 1}`,
                      gridRow: `${(image.mobileRow ?? image.gridPosition.row) + 1
                        } / span 1`,
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {/* Mobile Hero */}
              <div
                ref={(el) => {
                  hallRef.current[0] = el;
                }}
                className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-lg"
                style={{
                  gridColumn: "2 / 3",
                  gridRow: "2 / 3",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-xl text-center w-full z-5 font-white font-joker">
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
                  <div
                    key={`tablet-${index}`}
                    ref={setTabletGridRef(index)}
                    className="rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-20 cursor-pointer"
                    style={{
                      gridColumn: `${(image.tabletCol ?? image.gridPosition.col) + 1
                        } / span ${image.tabletColSpan ?? image.colSpan ?? 1}`,
                      gridRow: `${(image.tabletRow ?? image.gridPosition.row) + 1
                        } / span ${image.tabletRowSpan ?? image.rowSpan ?? 1}`,
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {/* Tablet Hero - Spans 2x2 center */}
              <div
                ref={(el) => {
                  hallRef.current[1] = el;
                }}
                className="overflow-hidden will-change-transform shadow-2xl z-10 rounded-xl"
                style={{
                  gridColumn: "2 / 5",
                  gridRow: "2 / 4",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker">
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
              {gridImages.map((image, index) => {
                return (
                  <div
                    key={`desktop-${index}`}
                    ref={setDesktopGridRef(index)}
                    className="rounded-xl overflow-hidden shadow-2xl transition-transform duration-300 hover:scale-105 hover:z-20 cursor-pointer"
                    style={{
                      gridColumn: `${image.gridPosition.col + 1} / span ${image.colSpan ?? 1
                        }`,
                      gridRow: `${image.gridPosition.row + 1} / span ${image.rowSpan ?? 1
                        }`,
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              })}

              {/* Desktop Hero - Spans 2x2 center */}
              <div
                ref={(el) => {
                  hallRef.current[2] = el;
                }}
                className="overflow-hidden relative will-change-transform shadow-2xl z-10 rounded-xl"
                style={{
                  gridColumn: "3 / 5",
                  gridRow: "2 / 4",
                  transformOrigin: "center center",
                  willChange: "transform",
                }}
              >
                <img
                  src="/images_home/HallOfFame.png"
                  alt="Hall of Fame"
                  className="w-full h-full object-cover"
                />
                <span className="hof-title absolute bottom-5 text-5xl text-center w-full z-5 font-white font-joker">
                  hall of fame
                </span>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div
            ref={scrollIndicatorRef}
            className="absolute top-30 right-2 sm:right-10 flex flex-col items-center gap-2 text-white z-20"
          >
            <span className="text-xl md:text-3xl tracking-widest uppercase font-jqka">Scroll to explore</span>
          </div>
        </div>
      </div>
      <div className="relative w-full overflow-hidden py-5 mb-5 bg-black">
        <div className="flex w-max animate-marquee">
          <span className="font-jqka uppercase text-3xl lg:text-5xl whitespace-nowrap">
            Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm •
          </span>
          <span className="font-jqka uppercase text-3xl lg:text-5xl whitespace-nowrap">
            Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm • Synapse' 26 #joker's realm •
          </span>
        </div>
      </div>
    </div>
  );
}
