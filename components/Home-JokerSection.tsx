"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type JokerSectionProps = {
  setShowNavbar: React.Dispatch<React.SetStateAction<boolean>>;
  showNavbar: boolean;
};

export default function JokerSection({
  setShowNavbar,
  showNavbar,
}: JokerSectionProps) {
  const jokerSectionRef = useRef<HTMLDivElement>(null);
  const jokerSvgRef = useRef<SVGSVGElement>(null);
  const jokerPathRef = useRef<SVGPathElement>(null);
  const jokerDotRef = useRef<HTMLDivElement>(null);
  const leftDoorRef = useRef<HTMLDivElement>(null);
  const rightDoorRef = useRef<HTMLDivElement>(null);
  const leftTitleRef = useRef<HTMLDivElement>(null);
  const rightTitleRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollHintRef = useRef<HTMLDivElement>(null);
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

  const setupCardHoverAnimations = useCallback(() => {
    const cards = document.querySelectorAll(".card-container");
    const cardState = new WeakMap();

    cards.forEach((card) => {
      const inner = card.querySelector(".card-inner") as HTMLElement;
      if (!inner) return;

      let hoverDidFlip = false;
      let preHoverRotation = 0;
      let hoverLockedUntilLeave = false;

      card.addEventListener("mouseenter", () => {
        if (hoverLockedUntilLeave) return;

        const currentRotation = gsap.getProperty(inner, "rotateY") as number;
        const normalized = ((currentRotation % 360) + 360) % 360;
        const isFullyBack = Math.abs(normalized - 180) < 5;

        if (isFullyBack) {
          hoverDidFlip = false;
          return;
        }

        hoverDidFlip = true;
        preHoverRotation = currentRotation;

        gsap.to(inner, {
          rotateY: 180,
          duration: 0.3,
          ease: "power2.inOut",
          overwrite: "auto",
        });
      });

      card.addEventListener("mouseleave", () => {
        hoverLockedUntilLeave = false;

        if (!hoverDidFlip) return;

        gsap.to(inner, {
          rotateY: preHoverRotation,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });

        hoverDidFlip = false;
      });

      ScrollTrigger.addEventListener("scrollStart", () => {
        if (!hoverDidFlip) return;

        hoverLockedUntilLeave = true;
        hoverDidFlip = false;

        gsap.to(inner, {
          rotateY: preHoverRotation,
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      cardState.set(inner, {
        hovering: false,
        lastScrollRotation: 0,
      });
    });

    ScrollTrigger.addEventListener("scrollEnd", () => {
      document.querySelectorAll(".card-inner").forEach((inner) => {
        const state = cardState.get(inner);
        if (!state || !state.hovering) return;
        state.lastScrollRotation = gsap.getProperty(inner, "rotateY") as number;
      });
    });
  }, []);

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

      const jokerTl = gsap.timeline({
        scrollTrigger: {
          trigger: jokerSectionRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 2.5,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1.2,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            if (progress > 0.3) {
              setShowNavbar(true);
            } else if (progress <= 0.3) {
              setShowNavbar(false);
            }
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
            setShowNavbar(false);
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
      jokerTl.set(scrollHintRef.current, { opacity: 1 });
      jokerTl.to({}, { duration: 2 });
      jokerTl.to(
        scrollHintRef.current,
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
            y: -40,
            duration: 2,
            ease: "power2.out",
          },
          ">"
        )
        .to(
          rightTitle,
          {
            y: 40,
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
        y: 80,
        scale: 1.1,
        color: "#9ca3af", // gray-400
      });
      jokerTl.to(
        exploreTitleRef.current,
        {
          opacity: 1,
          y: 40,
          duration: 1.2,
          ease: "power2.out",
        },
        "<+0.3"
      );

      jokerTl.to(
        exploreTitleRef.current,
        {
          y: -window.innerHeight * 0.25,
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
          top: "5%",
          y: -10,
          duration: 1.8,
          ease: "power2.inOut",
        },
        ">"
      );

      // --- REVISED CARD POSITIONING LOGIC ---
      const getCardX = (i: number) => {
        const vw = window.innerWidth;
        const isMobile = vw < 426;
        const isTablet = vw < 729;
        const isother = vw < 1000;

        if (isMobile) {
          // Reduce spread significantly for mobile ("Inward")
          // Use a tighter clustering
          const spread = Math.min(vw * 0.4, 140);
          // Divide spread by a larger number to compress horizontal space
          return (i - 1.5) * (spread / 2.5);
        } else if (isTablet) {
          const spread = Math.min(vw * 0.4, 290);

          return (i - 1.5) * (spread / 2.5);
        } else if (isother) {
          const spread = Math.min(vw * 0.5, 370);

          return (i - 1.5) * (spread / 2.3);
        }

        // Desktop logic
        const spread = Math.min(vw * 0.35, 420);
        return (i - 1.5) * (spread / 1.5);
      };

      const getCardY = (i: number) => {
        const vh = window.innerHeight;
        const isMobile = window.innerWidth < 426;
        const isTablet = window.innerWidth < 769;
        const isother = window.innerWidth < 1000;

        if (isMobile) {
          const mobileStagger = [-0.15, 0.08, -0.12, 0.18];
          return mobileStagger[i] * vh;
        } else if (isTablet) {
          const TabletStagger = [0.09, -0.15, 0.1, -0.1];
          return TabletStagger[i] * vh;
        } else if (isother) {
          const TabletStagger = [0.12, -0.09, 0.15, -0.1];
          return TabletStagger[i] * vh;
        }

        // Desktop logic (Existing)
        return [0.1, -0.08, 0.11, -0.02][i] * vh;
      };

      const getCardR = (i: number) => {
        const isMobile = window.innerWidth < 426;
        const isTablet = window.innerWidth < 769;

        if (isMobile) {
          return [-5, -15, 15, 15][i];
        }
        if (isTablet) {
          return [-15, 10, 5, 15][i];
        }

        // Slightly steeper rotation on edges for visual flair
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
          duration: 2,
          ease: "expo.out",
        },
        ">+0.5"
      );

      const cardInners = gsap.utils.toArray(".card-inner");
      const shuffledCards = cardInners.sort(() => Math.random() - 0.5);

      jokerTl
        .to(
          shuffledCards,
          {
            rotateY: 180,
            duration: 1,
            stagger: 2,
            ease: "power1.inOut",
          },
          "+=0.5"
        )
        .to(shuffledCards, {
          duration: 1,
          ease: "none",
        });

      setupCardHoverAnimations();

      const handleResize = () => {
        const newPath = generateViewportPath();
        jokerPath.setAttribute("d", newPath);

        // Re-calculate positions on resize so mobile/desktop switch works dynamically
        jokerTl.scrollTrigger?.refresh();
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        jokerTl.scrollTrigger?.kill();
        ScrollTrigger.getAll().forEach((trigger) => {
          if (trigger.trigger === jokerSectionRef.current) {
            trigger.kill();
          }
        });
      };
    }
  }, [generateViewportPath, setupCardHoverAnimations, setShowNavbar]);

  useEffect(() => {
    setupPaths();
  }, [setupPaths]);

  useEffect(() => {
    if (scrollHintRef.current) {
      gsap.fromTo(
        scrollHintRef.current,
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
        className="joker-section relative h-[100dvh] overflow-hidden"
        id="jokerSection"
        ref={jokerSectionRef}
      >
        <div className="joker-content relative top-0 h-[100dvh] overflow-hidden">
          <div className="viewport-wrapper absolute inset-0 flex overflow-hidden z-10">

            {/* LEFT DOOR */}
            <div
              className="door door-left absolute top-0 w-1/2 h-full bg-white z-[100]"
              id="leftDoor"
              ref={leftDoorRef}
              style={{
                background: "white url('/images_home/left.png') no-repeat right center",
                backgroundSize: 'contain'
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
                            lg:tracking-[0.1em]
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
              className="door door-right absolute top-0 right-0 w-1/2 h-full bg-white z-100 object-cover"
              id="rightDoor"
              ref={rightDoorRef}
              style={{
                background:
                  "white url('/images_home/right.png') no-repeat left center",
                backgroundSize: "contain",
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
                            lg:tracking-[0.1em]
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
                explore events
              </h1>

              <svg
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
              </svg>

              <div
                id="jokerPathDot"
                className="fixed w-14 h-14 md:w-22.5 md:h-22.5 bg-[#ff0000] rounded-full blur-[15px] md:blur-[20px] pointer-events-none z-5 opacity-0 -translate-x-1/2 -translate-y-1/2"
                ref={jokerDotRef}
              ></div>

              {/* CARD BURST ZONE */}
              <div className="burst-zone relative w-full h-[60dvh] md:h-[70dvh] pointer-events-auto flex justify-center items-center z-10">
                {cards.map((card, index) => (
                  <div
                    key={card.id}
                    className="card-container absolute min-h[180px] min-w-[150px]"
                    style={{
                      // Modified clamps for better mobile aspect ratio
                      width: "clamp(90px, 20vw, 240px)",
                      height: "clamp(120px, 25vw, 300px)",
                      transform: "translateY(120dvh)",
                    }}
                    id={card.id}
                    ref={(el) => {
                      cardRefs.current[index] = el;
                    }}
                  >
                    <div
                      className="card-inner w-full h-full transform-style-preserve-3d transition-transform duration-100 ease-in-out"
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
                ))}
              </div>
            </div>
          </div>

          {/* SCROLL HINT */}
          <div
            ref={scrollHintRef}
            className="scroll-hint opacity-0 fixed bottom-4 md:bottom-0 left-1/2 -translate-x-1/2 z-50
       text-black select-none pointer-events-none"
          >
            <ChevronDown className="stroke-[3px] w-6 h-6 md:w-8 md:h-8 translate-y-full" />
            <ChevronDown className="stroke-[3px] w-6 h-6 md:w-8 md:h-8 translate-y-1/2" />
            <ChevronDown className="stroke-[3px] w-6 h-6 md:w-8 md:h-8" />
            <ChevronDown className="stroke-[3px] w-6 h-6 md:w-8 md:h-8 -translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className='h-[100dvh]' />
      <div className='h-[100dvh]' />
      <div className='h-[100dvh]' />
    </div>
  );
}
