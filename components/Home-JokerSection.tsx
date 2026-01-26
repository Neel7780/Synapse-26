"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNavigationState } from "@/lib/useNavigationState";
import { useIsMobile } from "@/hooks/useIsMobile";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function JokerSection() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const { startTransition } = useNavigationState();
  const jokerSectionRef = useRef<HTMLDivElement>(null);
  const jokerSvgRef = useRef<SVGSVGElement>(null);
  const jokerPathRef = useRef<SVGPathElement>(null);
  const jokerDotRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const leftTitleRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollhintjokerRef = useRef<HTMLDivElement>(null);
  const exploreTitleRef = useRef<HTMLHeadingElement>(null);

  const generateViewportPath = useCallback(() => {
    if (typeof window === "undefined") return "";
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sx = 1000 / w;
    const sy = 1000 / h;
    const startX = (w / 2) * sx;
    const startY = 0;
    const endX = (w / 2) * sx;
    const endY = 1000;
    const c1x = w * 0.15 * sx;
    const c1y = h * 0.35 * sy;
    const c2x = w * 0.85 * sx;
    const c2y = h * 0.65 * sy;

    return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
  }, []);

  const setupPaths = useCallback(() => {
    if (jokerPathRef.current) {
      const path = generateViewportPath();
      jokerPathRef.current.setAttribute("d", path);
    }
  }, [generateViewportPath]);

  const handleScrollEnd = useCallback(() => {
    if (!document.body.classList.contains("is-scrolling-joker")) return;

    document.body.classList.remove("is-scrolling-joker");
    const containers = document.querySelectorAll(".card-container");
    containers.forEach(el => {
      const card = el as HTMLElement;
      card.style.pointerEvents = "auto";

      // Manually check if mouse is over the card when scroll stops
      if (card.matches(":hover")) {
        const inner = card.querySelector(".card-inner");
        const wrapper = card.querySelector(".card-scroll-wrapper");
        let targetRotation = 180;

        if (wrapper) {
          const wrapperRotation = gsap.getProperty(wrapper, "rotateY") as number;
          targetRotation = 180 - wrapperRotation;
        }

        if (inner) {
          gsap.to(inner, {
            rotateY: targetRotation,
            duration: 0.2, // Reduced as requested
            ease: "power2.out",
            overwrite: "auto",
          });
        }
      }
    });
  }, []);

  const setupCardHoverAnimations = useCallback(() => {
    const cards = document.querySelectorAll(".card-container");

    // Simplifed Hover Logic
    cards.forEach((card) => {
      const inner = card.querySelector(".card-inner") as HTMLElement;
      if (!inner) return;

      card.addEventListener("mouseenter", () => {
        // If scrolling, do nothing (pointer-events will handle this mostly, but safety check)
        if (document.body.classList.contains("is-scrolling-joker")) return;

        // Calculate target rotation for Inner so that Total (Inner + Wrapper) = 180
        const wrapper = card.querySelector(".card-scroll-wrapper");
        let targetRotation = 180;

        if (wrapper) {
          const wrapperRotation = gsap.getProperty(wrapper, "rotateY") as number;
          // Target = 180 - Wrapper. 
          // Example: Wrapper is 90. Inner goes to 90. Total = 180.
          // Example: Wrapper is 0. Inner goes to 180. Total = 180.
          targetRotation = 180 - wrapperRotation;
        }

        gsap.to(inner, {
          rotateY: targetRotation,
          duration: 0.2, // Reduced as requested
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      card.addEventListener("mouseleave", () => {
        // If scrolling, let the scrollStart handler handle the reset
        if (document.body.classList.contains("is-scrolling-joker")) return;

        gsap.to(inner, {
          rotateY: 0,
          duration: 0.2,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    });

    // Global Scroll Listeners
    const onScrollStart = () => {
      document.body.classList.add("is-scrolling-joker");
      const containers = document.querySelectorAll(".card-container");
      containers.forEach(el => (el as HTMLElement).style.pointerEvents = "none");

      // Smoothly un-flip the INNER card (Hover layer).
      // If user was hovering (Inner=180), this goes 180->0.
      // Simultaneously, the Wrapper (Scroll layer) goes 0->180.
      // This additive effect keeps the card visually "Back" without snapping.
      gsap.to(".card-inner", {
        rotateY: 0,
        duration: 0.2,
        ease: "power2.out",
        overwrite: "auto"
      });
    };

    ScrollTrigger.addEventListener("scrollStart", onScrollStart);
    ScrollTrigger.addEventListener("scrollEnd", handleScrollEnd);

    return () => {
      ScrollTrigger.removeEventListener("scrollStart", onScrollStart);
      ScrollTrigger.removeEventListener("scrollEnd", handleScrollEnd);
    }
  }, [handleScrollEnd]);

  useEffect(() => {
    if (
      jokerSvgRef.current &&
      jokerPathRef.current &&
      jokerDotRef.current &&
      leftDoorRef.current &&
      rightDoorRef.current &&
      leftTitleRef.current &&
      rightTitleRef.current
    ) {
      const jokerSvg = jokerSvgRef.current;
      const jokerPath = jokerPathRef.current;
      const jokerDot = jokerDotRef.current;
      const leftDoor = leftDoorRef.current;
      const rightDoor = rightDoorRef.current;
      const leftTitle = leftTitleRef.current;
      const rightTitle = rightTitleRef.current;

      const path = generateViewportPath();
      jokerPath.setAttribute("d", path);

      const jokerPathLength = jokerPath.getTotalLength();

      const mm = gsap.matchMedia();

      mm.add({
        isMobile: "(max-width: 767px)",
        isDesktop: "(min-width: 768px)"
      }, (context) => {
        const { isMobile } = context.conditions as { isMobile: boolean };

        const jokerTl = gsap.timeline({
          scrollTrigger: {
            trigger: jokerSectionRef.current,
            start: "top top",
            end: "+=300%",
            scrub: isMobile ? 1 : 2.5,
            pin: true,
            pinSpacing: false,
            anticipatePin: 1.2,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              // Eagerly unlock if velocity is very low
              if (Math.abs(self.getVelocity()) < 5) {
                handleScrollEnd();
              }

              const progress = self.progress;
              const point = jokerPath.getPointAtLength(
                jokerPathLength * progress
              );
              const rect = jokerSvg.getBoundingClientRect();

              const x = rect.left + (point.x / 1000) * rect.width;
              const y = rect.top + (point.y / 1000) * rect.height;

              jokerDot.style.left = `${x}px`;
              jokerDot.style.top = `${y}px`;
            },
            onEnter: () => {
              jokerDot.style.opacity = "1";
              const artistDot = document.getElementById("artistPathDot");
              if (artistDot) artistDot.style.opacity = "0";
            },
            onLeave: () => {
              jokerDot.style.opacity = "0";
              const artistDot = document.getElementById("artistPathDot");
              if (artistDot) artistDot.style.opacity = "1";
            },
            onEnterBack: () => {
              jokerDot.style.opacity = "1";
              const artistDot = document.getElementById("artistPathDot");
              if (artistDot) artistDot.style.opacity = "0";
            },
          },
        });

        jokerTl.set(scrollhintjokerRef.current, { opacity: 1 });
        jokerTl.to({}, { duration: 2 });
        jokerTl.to(
          scrollhintjokerRef.current,
          {
            opacity: 0,
            duration: 1,
            ease: "power2.out",
          },
          ">"
        );

        jokerTl
          .to(
            leftTitle,
            {
              y: isMobile ? -20 : -40,
              duration: 2,
              ease: "power2.out",
            },
            ">"
          )
          .to(
            rightTitle,
            {
              y: isMobile ? 20 : 40,
              duration: 2,
              ease: "power2.out",
            },
            "<"
          );

        jokerTl
          .to(
            leftDoor,
            {
              x: "-100%",
              duration: 4,
              ease: "power2.inOut",
            },
            "<"
          )
          .to(
            rightDoor,
            {
              x: "100%",
              duration: 4,
              ease: "power2.inOut",
            },
            "<"
          );

        gsap.set(exploreTitleRef.current, {
          opacity: 0,
          y: isMobile ? 40 : 80,
          scale: 1.1,
          color: "#9ca3af",
        });
        
        jokerTl.to(
          exploreTitleRef.current,
          {
            opacity: 1,
            y: isMobile ? 20 : 40,
            duration: 1.2,
            ease: "power2.out",
          },
          "<+0.3"
        );

        jokerTl.to(
          exploreTitleRef.current,
          {
            y: -window.innerHeight * 0.03,
            scale: 1,
            color: "#ffffff",
            duration: 2.5,
            ease: "power1.out",
          },
          ">+0.8"
        );
        
        jokerTl.to(
          exploreTitleRef.current,
          {
            top: "2%",
            y: -10,
            duration: 1.8,
            ease: "power2.inOut",
          },
          ">"
        );

        const getCardX = (i: number) => {
          const vw = window.innerWidth;
          const isSmallMobile = vw < 426;
          const isTablet = vw < 729;
          const isother = vw < 1000;

          if (isSmallMobile) {
            const offset = Math.min(vw * 0.15, 240);
            return i % 2 === 0 ? -offset : offset;
          }
          else if (isTablet) {
            const spread = Math.min(vw * 0.4, 290);
            return (i - 1.5) * (spread / 2.5);
          } else if (isother) {
            const spread = Math.min(vw * 0.5, 370);
            return (i - 1.5) * (spread / 2.3);
          }

          const spread = Math.min(vw * 0.35, 420);
          return (i - 1.5) * (spread / 1.5);
        };

        const getCardY = (i: number) => {
          const vh = window.innerHeight;
          const isSmallMobile = window.innerWidth < 426;
          const isTablet = window.innerWidth < 769;
          const isother = window.innerWidth < 1000;

          if (isSmallMobile) {
            const step = vh * 0.15;
            return i * step - vh * 0.18;
          } else if (isTablet) {
            const TabletStagger = [0.07, -0.1, 0.07, -0.07];
            return TabletStagger[i] * vh;
          } else if (isother) {
            const TabletStagger = [0.12, -0.09, 0.15, -0.1];
            return TabletStagger[i] * vh;
          }

          return [0.1, -0.08, 0.11, -0.02][i] * vh;
        };

        const getCardR = (i: number) => {
          const isSmallMobile = window.innerWidth < 426;
          const isTablet = window.innerWidth < 769;

          if (isSmallMobile) {
            return i % 2 === 0 ? -6 : 6;
          }
          if (isTablet) {
            return [-15, 10, 5, 15][i];
          }

          return [-15, 5, -5, 15][i];
        };

        jokerTl.to(
          ["#c1", "#c2", "#c3", "#c4"],
          {
            opacity: 1,
            scale: 1,
            x: (i: number) => getCardX(i),
            y: (i: number) => getCardY(i),
            rotation: (i: number) => getCardR(i),
            rotateY: 0,
            duration: 2,
            ease: "expo.out",
          },
          ">+0.5"
        );

        const cardWrappers = gsap.utils.toArray(".card-scroll-wrapper");
        const shuffledWrappers = cardWrappers.sort(() => Math.random() - 0.5);

        jokerTl
          .to(
            shuffledWrappers,
            {
              rotateY: 180,
              duration: 1,
              stagger: isMobile ? 0.5 : 1,
              ease: "power1.inOut",
            }
          )
          .to(shuffledWrappers, {
            duration: 1,
            ease: "none",
          });

        return () => {
          jokerTl.scrollTrigger?.kill();
          jokerTl.kill();
        };
      });

      const cleanupHover = setupCardHoverAnimations();

      const handleResize = () => {
        const newPath = generateViewportPath();
        jokerPath.setAttribute("d", newPath);
        ScrollTrigger.refresh();
      };

      window.addEventListener("resize", handleResize);

      // Store ref value before cleanup to avoid stale ref
      const sectionRef = jokerSectionRef.current;
      return () => {
        window.removeEventListener("resize", handleResize);
        mm.revert();
        cleanupHover?.();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === sectionRef) {
            trigger.kill();
          }
        });
      };
    }
  }, [generateViewportPath, setupCardHoverAnimations, setupPaths, handleScrollEnd]);

  useEffect(() => {
    setupPaths();
  }, [setupPaths]);

  useEffect(() => {
    if (scrollhintjokerRef.current) {
      gsap.fromTo(
        scrollhintjokerRef.current,
        { y: 0 },
        {
          y: 10,
          duration: 1,
          ease: "power1.inOut",
          repeat: -1,
          yoyo: true,
        }
      );
    }
  });

  const cards = [
    {
      id: "c1",
      name: "Ace of Heart",
      image: {
        avif: "/images_home/Ace_Heart.avif",
        png: "/images_home/Ace_Heart.png",
      },
      day: "Day 1",
      isRed: true,
    },
    {
      id: "c2",
      name: "Ace of Clubs",
      image: {
        avif: "/images_home/Ace_Clubs.avif",
        png: "/images_home/Ace_Clubs.png",
      },
      day: "Day 2",
    },
    {
      id: "c3",
      name: "Ace of Diamond",
      image: {
        avif: "/images_home/Ace_Diamond.avif",
        png: "/images_home/Ace_Diamond.png",
      },
      day: "Day 3",
      isRed: true,
    },
    {
      id: "c4",
      name: "Ace of Spades",
      image: {
        avif: "/images_home/Ace_Spades.avif",
        png: "/images_home/Ace_Spades.png",
      },
      day: "Day 4",
    },
  ];

  return (
    <div className='relative'>
      <div
        className="joker-section relative h-dvh overflow-hidden"
        id="jokerSection"
        ref={jokerSectionRef}
      >
        <div className="joker-content relative top-0 h-dvh overflow-hidden">
          <div className="viewport-wrapper absolute inset-0 flex overflow-hidden z-10">

            {/* LEFT DOOR */}
            <div
              className="door door-left absolute top-0 w-1/2 h-full bg-white z-100 bg-cover md:bg-contain bg-no-repeat"
              id="leftDoor"
              ref={leftDoorRef}
              style={{
                background: "white url('/images_home/left.png') no-repeat right center",
                backgroundSize: "min(200%, 100vh)",
              }}
            >
              <div
                className="door-title left-title absolute 
                            bottom-20 md:bottom-8 
                            right-0
                            font-joker
                            text-[clamp(2rem,10vw,5rem)]
                            leading-none
                            text-black
                            pointer-events-none
                            lg:tracking-widest
                            will-change-transform
                            text-right
                            pr-4 md:pr-12"
                ref={leftTitleRef}
              >
                joker&apos;s
              </div>
            </div>

            {/* RIGHT DOOR */}
            <div
              className="door door-right absolute top-0 right-0 w-1/2 h-full bg-white z-100 object-cover bg-cover md:bg-contain bg-no-repeat"
              id="rightDoor"
              ref={rightDoorRef}
              style={{
                background: "white url('/images_home/right.png') no-repeat left center",
                backgroundSize: "min(200%, 100vh)",
              }}
            >
              <div
                className="door-title right-title absolute 
                            bottom-20 md:bottom-8
                            left-0
                            font-joker
                            text-[clamp(2rem,10vw,5rem)]
                            leading-none
                            text-black
                            lg:tracking-widest
                            pointer-events-none
                            will-change-transform
                            text-left
                            pl-4 md:pl-12"
                ref={rightTitleRef}
              >
                realm
              </div>
            </div>

            {/* CENTER CONTENT */}
            <div className="main-content absolute inset-0 flex flex-col items-center justify-center bg-black z-5">
              <h1
                ref={exploreTitleRef}
                className="font-joker text-center
                            text-[clamp(2.5rem,10vw,8rem)]
                            w-11/12
                            z-2
                            absolute
                            top-1/2
                            -translate-y-1/2
                            text-gray-500
                            will-change-transform
                            origin-center"
              >
                explore
                <br className="block sm:hidden" />
                <span className="hidden sm:inline"> </span>
                events
              </h1>

              {<svg
                id="jokerPath"
                width="100%"
                height="100%"
                viewBox="0 0 1000 1000"
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0 pointer-events-none z-5"
                ref={jokerSvgRef}
              >
                <path
                  id="jokerSvgPath"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  ref={jokerPathRef}
                />
              </svg>}

              <div
                id="jokerPathDot"
                className="fixed w-14 h-14 md:w-22.5 md:h-22.5 bg-[#ff0000] rounded-full blur-[15px] md:blur-[20px] pointer-events-none z-5 opacity-0 -translate-x-1/2 -translate-y-1/2"
                ref={jokerDotRef}
              ></div>

              {/* CARD BURST ZONE */}
              <div className="burst-zone relative w-full h-[60vh] md:h-[70vh] pointer-events-auto flex justify-center items-center z-10">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="card-container absolute min-h[180px] min-w-[150px] cursor-pointer"
                    style={{
                      // Modified clamps for better mobile aspect ratio
                      width: "clamp(110px, 25vw, 240px)",
                      height: "clamp(140px, 30vw, 300px)",
                      transform: "translateY(120vh)"
                    }}
                    id={card.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                    onClick={() => {
                      startTransition();
                      const dayNum = index + 1;
                      router.push(`/timeline#day-${dayNum}`);
                    }}
                  >
                    <div
                      className="card-scroll-wrapper w-full h-full transform-style-preserve-3d "
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div
                        className="card-inner w-full h-full transform-style-preserve-3d transition-transform duration-100 ease-in-out "
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {/* Card Front */}
                        <div
                          className="card-front absolute inset-0 backface-hidden lowercase font-joker"
                          style={{
                            backgroundImage: `image-set(url(${card.image.avif}) type("image/avif"),url(${card.image.png}) type("image/png"))`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                            backgroundSize: "contain",
                            backfaceVisibility: "hidden",
                          }}
                        ></div>

                        {/* Card Back */}
                        <div
                          className="card-back absolute inset-0 backface-hidden lowercase font-joker flex flex-col gap-2 md:gap-4 items-center justify-center p-4 md:p-8 text-center"
                          style={{
                            background:
                              "url('/images_home/card_back.avif') no-repeat center center",
                            backgroundSize: "contain",
                            backfaceVisibility: "hidden",
                            transform: "rotateY(180deg)",
                          }}
                        >
                          <h2 className="text-black text-sm md:text-xl lg:text-3xl font-bold">
                            {card.day}
                          </h2>
                          <h2
                            className={
                              card.isRed
                                ? "text-[#cf0000] font-jqka max-w-[70%] md:max-w-full text-base md:text-xl lg:text-4xl font-bold "
                                : "text-black max-w-[70%] md:max-w-full text-base md:text-xl lg:text-4xl font-jqka font-bold"
                            }
                          >
                            {card.name}
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCROLL HINT */}
          <div
            ref={scrollhintjokerRef}
            className="scroll-hint opacity-0 fixed bottom-4 md:bottom-0 left-1/2 -translate-x-1/2 z-50
       text-black select-none pointer-events-none"
          >
            <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 translate-y-full" />
            <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 translate-y-1/2" />
            <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8" />
            <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className='h-[300vh]' />
    </div>
  );
}