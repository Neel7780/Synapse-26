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
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FIRST_PHASE_TIME = 4000;

// Imports...
import { useNavigationState } from "@/lib/useNavigationState";

type HeroSectionProps = {
  onEnter: () => void;
};



export default function HeroSection({
  onEnter,
}: { onEnter: () => void }) {
  const INTRO_KEY = "synapse_has_entered";

  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return sessionStorage.getItem(INTRO_KEY) !== "true";
  });

  const [showEnter, setShowEnter] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const { isAuthenticated } = useAuth();
  const { setNavbarVisible, isNavbarVisible } = useNavigationState();

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

  // Disabling explicit-any for GSAP refs temporarily due to complex types
  const masterTLRef = useRef<gsap.core.Timeline | null>(null);
  const progressTriggerRef = useRef<ScrollTrigger | null>(null);
  const scrollHintIdleRef = useRef<gsap.core.Tween | null>(null);
  const scrollHintHomeIdleRef = useRef<gsap.core.Tween | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const clickedEnterRef = useRef(false);

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
        (p as SVGPathElement & { dataset: { len: string } }).dataset.len = String(len);
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
  }, [updateProgressText]);

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
      p.style.strokeDashoffset = `${Number((p as SVGPathElement & { dataset: { len: string } }).dataset.len) * (1 - assetsRef.current.strokeProgress)
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
    clickedEnterRef.current = true;

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
      },
    });

    masterTLRef.current = masterTL;

    masterTL.set(part3_2Ref.current, {
      scale: 0.2,
      rotation: 180,
    });

    // Helper for scoped selection
    const q = gsap.utils.selector(part3Ref);

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
        cardRef.current,
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
        part3_2Ref.current,
        {
          rotation: 360,
          duration: 2,
          scale: 1,
          ease: "none",
        },
        2
      )
      .addLabel("part3Reveal")
      .set(part3Ref.current, { opacity: 1 }, "part3Reveal")
      .from(
        q(".register-btn"),
        {
          x: 100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.2,
        },
        "part3Reveal+=0.4"
      )
      .from(
        q(".countdown"),
        {
          x: -100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Reveal+=0.4"
      )
      .fromTo(
        scrollHintHomeRef.current,
        {
          y: -20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
        },
        "part3Reveal+=0.4"
      )
      .from(
        q(".title-wrapper"),
        {
          opacity: 0,
          y: -100,
          ease: "power3.out",
          stagger: 0.25,
        },
        "part3Reveal+=0.2"
      )
      .add(() => {
        setNavbarVisible(true);
      }, "part3Reveal")
      .to(".screen-container", { duration: 0.5, ease: "power2.inOut" })
      .add(() => {
        setNavbarVisible(false);
      }, "part3Reveal-=0.01")
      .to(".screen-container", { duration: 0.5, ease: "power2.inOut" })
      .addLabel("part3Hide")
      .to(
        q(".register-btn"),
        {
          x: 100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.2,
        },
        "part3Hide+=0.2"
      )
      .to(
        q(".countdown"),
        {
          x: -100,
          opacity: 0,
          ease: "power3.out",
          stagger: 0.15,
        },
        "part3Hide+=0.2"
      )
      .to(
        scrollHintHomeRef.current,
        {
          y: -20,
          opacity: 0,
          duration: 0.6,
          ease: "power3.out",
        },
        "part3Hide+=0.2"
      )
      .to(q(".title-wrapper"), { opacity: 0 }, "part3Hide+=0.15")
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
          scale: isMobile ? 0.65 : 0.25,
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
          scale: isMobile ? 0.55 : 0.15,
          ease: "none",
        },
        "together2"
      ).to({}, { duration: 6, ease: "none" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setNavbarVisible]);

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
      setNavbarVisible(false);
      lockScroll();
      return;
    }
    // Ensure it stays hidden during the mask reveal phase until the GSAP timeline takes over
    setNavbarVisible(false);

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
  }, [isLoading, lockScroll, setNavbarVisible]);

  useEffect(() => {
    const clearIntroOnReload = () => {
      sessionStorage.removeItem(INTRO_KEY);
    };


    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("beforeunload", clearIntroOnReload);
    window.addEventListener("resize", handleResize);

    if (isLoading) {
      requestAnimationFrame(() => {
        startBrowserPreloadTracking();
      });
    }

    return () => {
      window.removeEventListener("beforeunload", clearIntroOnReload);
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, startBrowserPreloadTracking]);

  useEffect(() => {
    if (!isLoading) {
      enterSilently();
    }
  }, [isLoading, enterSilently]);

  useLayoutEffect(() => {
    if (isLoading) return;
    if (!maskLayerRef.current) return;
    if (hasRunMaskRef.current) return;

    hasRunMaskRef.current = true;

    // If we are revisiting, skip the mask animation and just init everything
    if (!clickedEnterRef.current) {
      if (svgContainerRef.current) {
        svgContainerRef.current.style.display = "none";
      }

      // Ensure mask is cleared (though JSX handles it, this is safe)
      gsap.set(maskLayerRef.current, {
        webkitMaskImage: "none",
        maskImage: "none",
      });

      // Delay initialization slightly to ensure DOM is ready
      setTimeout(() => {
        initScrollAnimations();

        // Force the timeline to the start to ensure Red Hand is visible
        if (masterTLRef.current) {
          masterTLRef.current.progress(0);
        }

        ScrollTrigger.refresh(true);
        initScrollProgress();
        unlockScroll();
      }, 50);

      return;
    }

    gsap.to(maskLayerRef.current, {
      duration: 4,
      ease: "expo.out",
      webkitMaskSize: "cover",
      maskSize: "cover",
      onStart: () => {
        requestAnimationFrame(() => {
          const audio = audioRef.current;
          if (!audio) return;

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
        gsap.set(maskLayerRef.current, {
          webkitMaskImage: "none",
          maskImage: "none",
        });

        if (svgContainerRef.current) {
          svgContainerRef.current.style.display = "none";
        }

        initScrollAnimations();

        ScrollTrigger.refresh(true);

        initScrollProgress();
        unlockScroll();
        clickedEnterRef.current = false;
      },
    });
  }, [isLoading, initScrollAnimations, unlockScroll, initScrollProgress]);
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
    // Capture refs at start of effect to ensure we have the correct elements during cleanup
    const maskLayer = maskLayerRef.current;
    const scrollHint = scrollHintRef.current;
    const scrollHintHome = scrollHintHomeRef.current;

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

        // kill progress trigger
        if (progressTriggerRef.current) {
          progressTriggerRef.current.kill();
        }

        // kill idle tweens
        if (scrollHintIdleRef.current) scrollHintIdleRef.current.kill?.();
        if (scrollHintHomeIdleRef.current)
          scrollHintHomeIdleRef.current.kill?.();

        // kill all tweens on important refs
        gsap.killTweensOf(maskLayer);
        gsap.killTweensOf(scrollHint);
        gsap.killTweensOf(scrollHintHome);
      } catch {
        // swallow errors during cleanup
        // console.warn("Error cleaning up animations:", e);
      }
    };
  }, []);
  return (
    <div>
      <div
        id="svgContainer"
        className="fixed inset-0 z-10 transition-opacity duration-2400 pointer-events-none"
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
      <div className="hero relative inset-0 h-[100dvh] z-25" ref={heroRef}>
        <div id="maskLayer" className="absolute inset-0 opacity-100 " ref={maskLayerRef} style={{
          WebkitMaskImage: (isLoading || clickedEnterRef.current) ? 'url("/images_home/inkReveal2.gif")' : 'none',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskSize: (isLoading || clickedEnterRef.current) ? '0% 0%' : 'cover',
          maskImage: (isLoading || clickedEnterRef.current) ? 'url("/images_home/inkReveal2.gif")' : 'none',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: (isLoading || clickedEnterRef.current) ? '0% 0%' : 'cover',
        }}>
          <Image id="coloredImage" src="/images_home/RedHand2.jpeg" alt="Red Hand" fill sizes="100vw" quality={100} className="absolute inset-0 h-full w-full object-contain max-[600px]:rotate-270 min-[1000px]:object-cover pointer-events-none max-[600px]:scale-[1.8]" priority unoptimized ref={coloredImageRef} />

          <div id="flipCard" className="absolute inset-0 transform-3d will-change-transform" ref={flipCardRef}>
            <Image id="redCard" className="absolute inset-0 w-full h-full object-contain max-[600px]:rotate-270 min-[1000px]:object-cover pointer-events-none backface-hidden max-[600px]:scale-[1.8]" src="/images_home/redcard4.png" alt="Red Card" fill sizes="100vw" quality={100} priority unoptimized ref={cardRef} />

            <div id="part3_2" ref={part3_2Ref} className="absolute inset-0 flex flex-col items-center justify-center opacity-100 will-change-transform backface-hidden transform-[rotateY(180deg)]">
              {/* Background image using Next/Image for better quality */}
              <Image 
                src="/images_home/image_part3_2.png" 
                alt="" 
                fill 
                sizes="100vw"
                quality={100}
                unoptimized
                className="object-cover -z-10"
                priority
              />
              {/* Gradient overlay */}
              <div 
                className="absolute inset-0 -z-5 pointer-events-none" 
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.45) 65%, rgba(0,0,0,0.75) 85%, #000 100%)"
                }} 
              />
              <div className="screen-container relative w-screen h-full flex items-center justify-center perspective-[1000px] transform-3d" ref={screenContainerRef}>
                <div ref={frontScreenRef} className="screen-front absolute inset-0 bg-black z-2 backface-hidden border-4 border-solid rounded overflow-hidden" style={{ borderColor: "rgba(250,235,215,0)" }}>
                  {/* Part3 image using Next/Image */}
                  <Image 
                    src="/images_home/part3-image.png" 
                    alt="" 
                    fill 
                    sizes="100vw"
                    quality={100}
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <div className="center-joker-container absolute inset-0 flex items-center justify-center transform-[rotateY(180deg)] backface-hidden z-1">
                  <Image src="/images_home/card_center.png" className="center-joker w-full h-auto rotate-[-64deg] object-contain rounded-lg" alt="Joker Card" width={500} height={500} quality={100} unoptimized />
                </div>
              </div>
            </div>
            <div id="part3" ref={part3Ref} className="absolute inset-0 w-full h-full transform-[rotateY(180deg)] backface-hidden pointer-events-none">
              <div className="register-btn absolute bottom-2/5 max-[450px]:left-1/2 max-[450px]:-translate-x-1/2 min-[450px]:bottom-[40px] min-[450px]:right-[40px] md:bottom-[60px] md:right-[60px] z-50 scale-125 md:scale-100 origin-bottom-right pointer-events-auto">
                {!isAuthenticated && (
                  <NavbarButton href="/auth?next=/" variant="register">
                    Register
                  </NavbarButton>
                )}
              </div>

              <div className="title-wrapper flex justify-center pt-[80px] sm:pt-[60px] md:pt-[120px] h-[calc(100dvh-120px)] md:h-[calc(100dvh-200px)] pointer-events-none">
                <h1 className="title text-4xl min-[450px]:text-6xl sm:text-7xl md:text-[clamp(40px,12vw,140px)] font-joker leading-none text-center px-4" ref={titleRef}>synapse&apos; 26</h1>
              </div>

              <div className="scroll-hint-home absolute bottom-0 left-1/2 -translate-x-1/2 text-white text-center z-15 pointer-events-none opacity-0" ref={scrollHintHomeRef}>
                <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 translate-y-full" />
                <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 translate-y-1/2" />
                <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8" />
                <ChevronDown className="stroke-[3px] w-5 h-5 md:w-8 md:h-8 -translate-y-1/2" />
              </div>

              <CountdownTimer targetDate={new Date("2026-02-26 19:00:00")} />
            </div>
          </div>
          <div
            ref={scrollHintRef}
            className=" absolute left-1/2 -translate-x-1/2  bottom-5 md:bottom-[30px] z-[100] flex flex-col items-center justify-center gap-1 w-[70px] h-[130px] md:w-[70px] md:h-[120px] font-jqka text-amber-50 text-xs md:text-xs leading-tight tracking-wide uppercase border border-amber-50 rounded-full backdrop-blur-[2px]"
          >
            <span className="text-center text-[17px] md:text-[14px]">
              Scroll <br /> To <br /> Explore
            </span>

            <p className="text-xl md:text-3xl mt-1">↓</p>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        id="bgMusic"
        src="/Synapse_Music.mp3"
        preload="auto"
      />

      <div
        ref={scrollTrackRef}
        className="
    fixed right-[12px] md:right-[24px]
    top-1/2 -translate-y-1/2 z-[999]
    h-[180px] md:h-[300px]
    w-[5px] md:w-[10px]
    rounded-full border border-solid border-gray-700
    bg-gray-200 pointer-events-none transition duration-500
  "
        style={{
          opacity: isNavbarVisible ? 1 : 0,
        }}
      >
        <div
          ref={scrollFillRef}
          className="absolute top-0 left-0 w-full h-0 z-[9990]
                   bg-red-600 rounded-full"
        />
      </div>
    </div >
  );
}