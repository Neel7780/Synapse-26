"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useLayoutEffect,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CountdownTimer } from "./CountdownTimer";
import { NavbarButton } from "@/components/ui/Resizable-navbar";
import Svg from "@/components/Svg";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FIRST_PHASE_TIME = 4000;

type HeroSectionProps = {
  onEnter: () => void;
  showNavbar: boolean;
  setShowNavbar: React.Dispatch<React.SetStateAction<boolean>>;
};

let check = false;

export default function HeroSection({
  onEnter,
  setShowNavbar,
  showNavbar,
}: HeroSectionProps) {
  const INTRO_KEY = "synapse_has_entered";

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(INTRO_KEY) !== "true";
  });

  const [showEnter, setShowEnter] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [part3Active, setPart3Active] = useState(false);
  const { isAuthenticated } = useAuth();

  const hasRunMaskRef = useRef(false);
  const enterTriggeredRef = useRef(false);
  const scrollHintRef = useRef<HTMLDivElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const enterBtnRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLImageElement>(null);
  const coloredImageRef = useRef<HTMLImageElement>(null);
  const maskLayerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const part3Ref = useRef<HTMLDivElement>(null);
  const part3_2Ref = useRef<HTMLDivElement>(null);
  const screenContainerRef = useRef<HTMLDivElement>(null);
  const frontScreenRef = useRef<HTMLDivElement>(null);
  const flipCardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollFillRef = useRef<HTMLDivElement>(null);
  const scrollHintHomeRef = useRef<HTMLDivElement>(null);
  const prevOverflow = useRef<{ html: string; body: string }>({
    html: "",
    body: "",
  });

  const assetsRef = useRef({
    paths: [] as SVGPathElement[],
    loaded: 0,
    total: 0,
    finished: false,
    finishing: false,
    strokeProgress: 0,
    strokeStartTime: 0,
    assetProgress: 0,
    pending: new Set<string>(),
    resolved: new Set<string>(),
  });
  const masterTLRef = useRef<any>(null);
  const progressTriggerRef = useRef<any>(null);
  const scrollHintIdleRef = useRef<any>(null);
  const scrollHintHomeIdleRef = useRef<any>(null);
  const rafIdRef = useRef<number | null>(null);

  const updateProgressText = useCallback((progress: number) => {
    if (progressTextRef.current) {
      progressTextRef.current.textContent = `Loading ${Math.round(
        progress * 100
      )}%`;
    }

    setLoadingProgress(Math.round(progress * 100));
  }, []);

  const loadSVG = useCallback(async () => {
    const svg = svgContainerRef.current?.querySelector("svg");
    if (svg) {
      const g = svg.querySelector("g");
      svg.style.height = "100%";
      svg.style.width = "100%";
      if (window.innerWidth < 600) {
        svg.classList.add("scale-250");
        svg.classList.remove("scale-100");
        if (g) {
          g.setAttribute("transform", "rotate(270 1536 1024)");
        }
      } else {
        svg.classList.add("scale-100");
        svg.classList.remove("scale-250");
        if (g) {
          g.removeAttribute("transform");
        }
      }
      if (window.innerWidth > 1000) {
        svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
      } else {
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
      }
      const pathsArray = Array.from(svg.querySelectorAll("path")) as SVGPathElement[];
      assetsRef.current.paths = pathsArray;

      pathsArray.forEach((p) => {
        p.style.fillOpacity = "0";
        p.style.stroke = "#ffffff";
        p.style.strokeWidth = "1.6";

        const len = p.getTotalLength();
        p.style.strokeDasharray = `${len}`;
        p.style.strokeDashoffset = `${len}`;
        (p as any).dataset.len = len;
        p.style.opacity = "1";
      });
    }
  }, []);

  const revealFill = useCallback(() => {
    updateProgressText(1);
    if (progressTextRef.current) {
      progressTextRef.current.style.opacity = "0";
    }

    if (enterBtnRef.current) {
      setShowEnter(true);
    }
  }, []);

  const FINISH_THRESHOLD = 0.99;
  const observeBrowserLoading = (
    onProgress: (p: number) => void,
    onDone: () => void
  ) => {
    let totalBytes = 0;
    let loadedBytes = 0;
    const seen = new Set<string>();

    const update = () => {
      const entries = performance.getEntriesByType(
        "resource"
      ) as PerformanceResourceTiming[];

      totalBytes = 0;
      loadedBytes = 0;

      entries.forEach((e) => {
        if (!e.name) return;

        totalBytes += e.transferSize || e.decodedBodySize || 0;

        if (e.responseEnd > 0) {
          loadedBytes += e.transferSize || e.decodedBodySize || 0;
        }
      });

      const progress = totalBytes === 0 ? 0 : loadedBytes / totalBytes;
      onProgress(Math.min(progress, 1));
    };

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!seen.has(entry.name)) {
          seen.add(entry.name);
          update();
        }
      });
    });

    observer.observe({ entryTypes: ["resource"] });

    // Final check when page fully loaded
    window.addEventListener("load", () => {
      update();
      onDone();
      observer.disconnect();
    });
  };

  const drawStroke = useCallback(() => {
    const now = Date.now();
    const elapsed = now - assetsRef.current.strokeStartTime;

    const timeProgress = Math.min(1, elapsed / FIRST_PHASE_TIME);
    const combinedProgress =
      0.5 * timeProgress + 0.5 * assetsRef.current.assetProgress;

    const target = assetsRef.current.finishing ? 1 : combinedProgress;

    const ease = assetsRef.current.finishing ? 0.35 : 0.08;

    assetsRef.current.strokeProgress +=
      (target - assetsRef.current.strokeProgress) * ease;

    assetsRef.current.paths.forEach((p) => {
      p.style.strokeDashoffset = `${Number((p as any).dataset.len) * (1 - assetsRef.current.strokeProgress)
        }`;
    });

    updateProgressText(assetsRef.current.strokeProgress);

    const timeDone = elapsed >= FIRST_PHASE_TIME;
    const assetsDone = assetsRef.current.assetProgress >= 0.9;

    // 🔑 enter finishing phase (once)
    if (timeDone && assetsDone && !assetsRef.current.finishing) {
      assetsRef.current.finishing = true;
    }

    // ✅ final snap & completion
    if (
      assetsRef.current.finishing &&
      assetsRef.current.strokeProgress >= FINISH_THRESHOLD
    ) {
      assetsRef.current.strokeProgress = 1;

      assetsRef.current.paths.forEach((p) => {
        p.style.strokeDashoffset = "0";
      });

      updateProgressText(0.99);
      assetsRef.current.finished = true;
      revealFill();
      return;
    }

    const id = requestAnimationFrame(drawStroke);
    rafIdRef.current = id;
  }, [updateProgressText, revealFill]);

  const startBrowserPreloadTracking = useCallback(() => {
    assetsRef.current.strokeProgress = 0;
    assetsRef.current.finished = false;

    loadSVG().then(() => {
      assetsRef.current.strokeStartTime = Date.now();
      drawStroke();
    });

    observeBrowserLoading(
      (progress) => {
        assetsRef.current.assetProgress = progress;
      },
      () => {
        assetsRef.current.assetProgress = 1;
      }
    );
  }, [loadSVG, drawStroke]);

  const lockScroll = useCallback(() => {
    const scrollY = window.scrollY;

    prevOverflow.current.html = document.documentElement.style.overflow;
    prevOverflow.current.body = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
  }, []);

  const unlockScroll = useCallback(() => {
    const scrollY = Math.abs(parseInt(document.body.style.top || "0", 10));

    document.documentElement.style.overflow = prevOverflow.current.html;
    document.body.style.overflow = prevOverflow.current.body;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, scrollY);
    ScrollTrigger.refresh(true);
  }, []);

  const enterSilently = useCallback(() => {
    if (enterTriggeredRef.current) return;
    enterTriggeredRef.current = true;

    sessionStorage.setItem(INTRO_KEY, "true");
    setIsLoading(false);
    onEnter();
  }, [onEnter]);

  const handleEnterClick = useCallback(() => {
    if (enterTriggeredRef.current) return;
    enterTriggeredRef.current = true;
    check = true;

    sessionStorage.setItem(INTRO_KEY, "true");
    setIsLoading(false);
    onEnter();
  }, [onEnter]);

  const initScrollAnimations = useCallback(() => {
    if (
      !screenContainerRef.current ||
      !part3_2Ref.current ||
      !flipCardRef.current ||
      !part3Ref.current ||
      !titleRef.current
    )
      return;

    const isMobile = window.innerWidth < 500;

    gsap.set(screenContainerRef.current, {
      transformStyle: "preserve-3d",
      backfaceVisibility: "hidden",
    });

    gsap.set(part3_2Ref.current, {
      rotateY: 180,
      transformOrigin: "center center",
      backfaceVisibility: "hidden",
    });

    const masterTL = gsap.timeline({
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "+=300%",
        scrub: 2.5,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1.2,
        onUpdate: (self) => {
          if (self.progress > 0.35 && self.progress < 0.5) {
            setPart3Active(true);
          } else {
            setPart3Active(false);
          }
        },
      },
    });
    masterTLRef.current = masterTL;

    masterTL.set("#part3_2", {
      scale: 0.2,
      rotation: 180,
    });
    masterTL
      .to(
        scrollHintRef.current,
        {
          opacity: 0,
          ease: "none",
        },
        0.05
      )

      .to(
        "#redCard",
        {
          rotation: 180,
          scale: 0.5,
          duration: 2,
          ease: "none",
        },
        0
      )
      .to(
        frontScreenRef.current,
        {
          borderColor: "rgba(250,235,215,0.8)",
          duration: 0.6,
          ease: "power2.out",
        },
        0.3
      )
      .to(
        flipCardRef.current,
        {
          rotationY: 90,
          duration: 2,
          ease: "none",
        },
        0
      )
      .to(
        frontScreenRef.current,
        {
          borderColor: "rgba(250,235,215,0)",
          duration: 0.6,
          ease: "power2.in",
        },
        3.3
      )
      .to(
        flipCardRef.current,
        {
          rotationY: 180,
          duration: 2,
          ease: "none",
        },
        2
      )
      .to(
        "#part3_2",
        {
          rotation: 360,
          duration: 2,
          scale: 1,
          ease: "none",
        },
        2
      )
      .addLabel("part3Reveal")
      .set("#part3", { opacity: 1 }, "part3Reveal")
      .from(
        "#part3 .register-btn",
        {
          x: 100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.2,
        },
        "part3Reveal+=0.4"
      )
      .from(
        "#part3 .countdown",
        {
          x: -100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Reveal+=0.4"
      )
      .from(
        "#part3 .scroll-hint-home",
        {
          y: -20,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Reveal+=0.4"
      )
      .from(
        "#part3 .title-wrapper",
        {
          opacity: 0,
          y: -100,
          ease: "power3.out",
          stagger: 0.25,
        },
        "part3Reveal+=0.2"
      )
      .add(() => {
        setShowNavbar(true);
      }, "part3Reveal")
      .to(".screen-container", { duration: 0.5, ease: "power2.inOut" })
      .add(() => {
        setShowNavbar(false);
      }, "part3Reveal-=0.01")
      .to(".screen-container", { duration: 0.5, ease: "power2.inOut" })
      .addLabel("part3Hide")
      .to(
        ["#part3 .register-btn"],
        {
          x: 100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.2,
        },
        "part3Hide+=0.2"
      )
      .to(
        "#part3 .countdown",
        {
          x: -100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Hide+=0.2"
      )
      .to(
        "#part3 .scroll-hint-home",
        {
          y: -20,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Hide+=0.2"
      )
      .to("#part3 .title-wrapper", { opacity: 0 }, "part3Hide+=0.15")
      .addLabel("together")
      .to(
        frontScreenRef.current,
        {
          borderColor: "rgba(250,235,215,0.8)",
          duration: 0.6,
          ease: "power2.out",
        },
        "together-=0.1"
      )
      .to(
        ".screen-container",
        {
          rotationZ: 185,
          duration: 1.5,
          scale: isMobile ? 0.5 : 0.25,
          ease: "none",
        },
        "together"
      )
      .to(
        ".screen-container",
        { rotationY: 90, duration: 1.5, ease: "none" },
        "together"
      )
      .addLabel("together2")
      .to(
        ".screen-container",
        { rotationY: 180, duration: 1.5, ease: "none" },
        "together2"
      )
      .to(
        ".screen-container",
        {
          rotationZ: 420,
          duration: 2,
          scale: isMobile ? 0.4 : 0.15,
          ease: "none",
        },
        "together2"
      )
      .to(".screen-container", { duration: 1, ease: "none" });
  }, []);

  const initScrollProgress = useCallback(() => {
    const trigger = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => {
        const progress = self.progress;

        if (scrollFillRef.current) {
          scrollFillRef.current.style.height = `${progress * 100}%`;
        }
      },
    });
    progressTriggerRef.current = trigger;
  }, []);

  useEffect(() => {
    if (isLoading) {
      lockScroll();
      return;
    }
    if (!scrollHintRef.current) return;

    scrollHintIdleRef.current = gsap.fromTo(
      scrollHintRef.current,
      { y: 0 },
      {
        y: 20,
        duration: 1.4,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        overwrite: false,
        id: "scrollHintIdle",
      }
    );

    return () => {
      if (scrollHintIdleRef.current) {
        scrollHintIdleRef.current.kill?.();
      } else {
        gsap.getById("scrollHintIdle")?.kill();
      }
    };
  }, [isLoading]);

  useEffect(() => {
    const clearIntroOnReload = () => {
      sessionStorage.removeItem(INTRO_KEY);
    };

    window.addEventListener("beforeunload", clearIntroOnReload);

    requestAnimationFrame(() => {
      startBrowserPreloadTracking();
    });

    if (!isLoading) {
      enterSilently();
    }

    return () => {
      window.removeEventListener("beforeunload", clearIntroOnReload);
    };
  }, []);

  useLayoutEffect(() => {
    if (isLoading) return;
    if (!maskLayerRef.current) return;
    if (hasRunMaskRef.current) return;

    hasRunMaskRef.current = true;
    gsap.to(maskLayerRef.current, {
      duration: check ? 4 : 0.1,
      ease: "expo.out",
      webkitMaskSize: "cover",
      maskSize: "cover",
      onStart: () => {
        requestAnimationFrame(() => {
          const audio = audioRef.current;
          if (!check || !audio) return;

          audio.muted = false;
          audio.volume = 0;
          audio.play().catch(() => { });
          gsap.to(audio, {
            volume: 1,
            duration: 5,
            ease: "power2.out",
          });
        });
      },
      onComplete: () => {
        if (svgContainerRef.current) {
          svgContainerRef.current.style.display = "none";
        }

        initScrollAnimations();

        ScrollTrigger.refresh(true);

        initScrollProgress();
        unlockScroll();
        check = false;
      },
    });
  }, [isLoading, initScrollAnimations, unlockScroll]);
  useEffect(() => {
    // subtle breathing animation (idle)
    if (scrollHintHomeRef.current) {
      scrollHintHomeIdleRef.current = gsap.fromTo(
        scrollHintHomeRef.current,
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
    return () => {
      if (scrollHintHomeIdleRef.current) {
        scrollHintHomeIdleRef.current.kill?.();
      }
    };
  });

  // Cleanup GSAP and RAF on unmount to avoid lingering transitions and memory leaks
  useEffect(() => {
    return () => {
      try {
        // cancel any running RAF
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
        }

        // kill master timeline
        if (
          masterTLRef.current &&
          typeof masterTLRef.current.kill === "function"
        ) {
          masterTLRef.current.kill();
        }

        // kill idle tweens
        if (scrollHintIdleRef.current) scrollHintIdleRef.current.kill?.();
        if (scrollHintHomeIdleRef.current)
          scrollHintHomeIdleRef.current.kill?.();

        // kill all ScrollTriggers
        if (typeof ScrollTrigger !== "undefined" && ScrollTrigger.getAll) {
          ScrollTrigger.getAll().forEach((st: any) => st.kill());
        }

        // kill all tweens on important refs
        gsap.killTweensOf(maskLayerRef.current);
        gsap.killTweensOf(scrollHintRef.current);
        gsap.killTweensOf(scrollHintHomeRef.current);
      } catch (e) {
        // swallow errors during cleanup
        // console.warn("Error cleaning up animations:", e);
      }
    };
  }, []);
  return (
    <div>
      <div
        id="svgContainer"
        className="fixed inset-0 z-10 transition-opacity duration-2400"
        ref={svgContainerRef}
      >
        <Svg />
      </div>

      {isLoading ? (
        <>
          <div id="progress" ref={progressTextRef} className="fixed bottom-[5%] right-[2%] text-white text-[clamp(20px,5vw,40px)] tracking-[2px] z-11 transition-opacity duration-600 font-jqka">
            Loading {loadingProgress}%
          </div>
          <button id="enterBtn" ref={enterBtnRef} onClick={handleEnterClick} className={`fixed left-1/2 -translate-x-1/2 bottom-[10%] scale-90 px-[clamp(20px,5vw,40px)] py-[8px] text-[clamp(24px,5vw,40px)] text-white bg-black border-[3px] md:border-[5px] border-white rounded-[10px] cursor-pointer opacity-0 z-40 shadow-[5px_5px_0px_#ff0000] md:shadow-[10px_10px_0px_#ff0000] transition-all duration-200 font-jqka pointer-events-auto hover:bg-[#EB0000] hover:text-black hover:border-black hover:shadow-[5px_5px_0px_#ffffff] md:hover:shadow-[10px_10px_0px_#ffffff] ${showEnter
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-90 pointer-events-none"}`}>
            Enter
          </button>
        </>
      ) : <></>
      }
      <>


        <div className="hero relative inset-0 h-[100dvh] z-25" ref={heroRef}>
          <div id="maskLayer" className="absolute inset-0 opacity-100 " ref={maskLayerRef} style={{
            WebkitMaskImage: 'url("/images_home/inkReveal2.gif")',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            WebkitMaskSize: '0% 0%',
            maskImage: 'url("/images_home/inkReveal2.gif")',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
            maskSize: '0% 0%',
          }}>
            <img id="coloredImage" src="/images_home/RedHand2.jpeg" alt="Red Hand" ref={coloredImageRef} className="absolute inset-0 h-full w-full object-contain max-[600px]:rotate-270 min-[1000px]:object-cover pointer-events-none max-[600px]:scale-250" />

            <div id="flipCard" className="absolute inset-0 transform-3d" ref={flipCardRef}>
              <img id="redCard" className="absolute inset-0 w-full h-full object-contain max-[600px]:rotate-270 min-[1000px]:object-cover pointer-events-none backface-hidden max-[600px]:scale-250" src="/images_home/redcard4.png" alt="Red Card" ref={cardRef} />

              <div id="part3_2" ref={part3_2Ref} style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.75) 85%, #000 100%), url(/images_home/image_part3_2.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }} className=" absolute inset-0 flex flex-col items-center justify-center opacity-100 will-change-transform backface-hidden transform-[rotateY(180deg)]">
                <div className="screen-container relative w-screen h-[100dvh] flex items-center justify-center perspective-[1000px] transform-3d" ref={screenContainerRef}>
                  <div ref={frontScreenRef} className="screen-front absolute inset-0 bg-black bg-[url('/images_home/part3-image.png')] bg-no-repeat bg-center bg-contain z-2 backface-hidden border-4 border-solid rounded " style={{ borderColor: "rgba(250,235,215,0)" }}></div>
                  <div className="center-joker-container absolute inset-0 flex items-center justify-center transform-[rotateY(180deg)] backface-hidden z-1">
                    <img src="/images_home/card_center.png" className="center-joker w-full h-auto rotate-[-64deg] object-contain" alt="Joker Card" />
                  </div>
                </div>
              </div>

              <div id="part3" ref={part3Ref} className={`absolute inset-0 w-full h-[100dvh] transform-[rotateY(180deg)] backface-hidden ${part3Active ? "pointer-events-auto" : "pointer-events-none"}`}>
                <div className="register-btn absolute bottom-2/5  max-[450px]:left-1/2 min-[450px]:bottom-[40px] min-[450px]:right-[40px] md:bottom-[60px] md:right-[60px]">
                  <NavbarButton href="/auth" variant="register">
                    Register
                  </NavbarButton>
                </div>

                <div className="title-wrapper flex justify-center pt-[80px] sm:pt-[60px] md:pt-[120px] h-[calc(100dvh-120px)] md:h-[calc(100dvh-200px)]">
                  <h1 className="title text-4xl min-[450px]:text-6xl sm:text-7xl md:text-[clamp(40px,12vw,140px)] font-joker leading-none text-center px-4" ref={titleRef}>synapse' 26</h1>
                </div>
                <div
                  ref={scrollHintHomeRef}
                  className="scroll-hint-home fixed bottom-0 left-1/2 -translate-x-1/2 z-50
               text-white select-none pointer-events-none"
                >
                  <ChevronDown className="stroke-[3px] h-4 w-5 sm:w-8 sm:h-8 translate-y-full" />
                  <ChevronDown className="stroke-[3px] h-4 w-5 sm:w-8 sm:h-8 translate-y-1/2" />
                  <ChevronDown className="stroke-[3px] h-4 w-5 sm:w-8 sm:h-8" />
                  <ChevronDown className="stroke-[3px] h-4 w-5 sm:w-8 sm:h-8 -translate-y-1/2" />
                </div>

                <CountdownTimer targetDate={new Date("2026-02-26 00:00:00")} />
              </div>
            </div>
            <div
              ref={scrollHintRef}
              className=" absolute left-1/2 -translate-x-1/2  bottom-5 md:bottom-[30px] z-[100] flex flex-col items-center justify-center gap-1 w-[50px] h-[100px]  md:w-[70px] md:h-[120px] font-jqka text-amber-50 text-[10px] md:text-xs  leading-tight tracking-wide uppercase border border-amber-50  rounded-full backdrop-blur-[2px]"
            >
              <span className="text-center">
                Scroll <br /> To <br /> Explore
              </span>

              <p className="text-xl md:text-3xl mt-1">↓</p>
            </div>
          </div>
        </div>
      </>
      <audio
        ref={audioRef}
        id="bgMusic"
        src="/Synapse_Music.mp3"
        preload="auto"
      />

      <div
        ref={scrollTrackRef}
        className="fixed right-[24px] top-1/2 -translate-y-1/2 z-[9999]
               h-[300px] w-[10px] rounded-full border border-solid border-gray-700
               bg-gray-200 pointer-events-none transition duration-500"
        style={{
          opacity: showNavbar ? 1 : 0,
        }}
      >
        <div
          ref={scrollFillRef}
          className="absolute top-0 left-0 w-full h-0 z-[9999]
                   bg-red-600 rounded-full"
        />
      </div>
    </div>
  );
}
