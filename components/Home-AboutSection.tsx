"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GRADIENT = { angle: 195, stop: 0.6, offsetRatio: -0.4 };

export default function AboutSection() {
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const singleCardRef = useRef<HTMLImageElement>(null);
  const hasSplitRef = useRef(false);
  const themeContentRef = useRef<HTMLDivElement>(null);
  const decorativeRef = useRef<HTMLDivElement>(null);

  /* ---------------- TEXT SPLIT ---------------- */
  const splitTextToWords = useCallback((element: HTMLElement) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return node.nodeValue?.trim()
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });

    const textNodes: Node[] = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((textNode) => {
      const words = (textNode.nodeValue || "").split(/(\s+)/);
      const fragment = document.createDocumentFragment();

      words.forEach((word) => {
        if (!word.trim()) fragment.appendChild(document.createTextNode(word));
        else {
          const span = document.createElement("span");
          span.className = "word inline-block whitespace-pre";
          span.textContent = word;
          fragment.appendChild(span);
        }
      });
      textNode.parentNode?.replaceChild(fragment, textNode);
    });
  }, []);

  const positionImageFromGradientCenter = useCallback(() => {
    const section = aboutSectionRef.current;
    const image = singleCardRef.current;
    if (!section || !image) return;

    const rect = section.getBoundingClientRect();
    const angle = (GRADIENT.angle * Math.PI) / 180;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const L = Math.hypot(rect.width, rect.height);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const t = GRADIENT.stop * L - L / 2;

    const midX = cx + dx * t;
    const midY = cy + dy * t;
    const x1 = midX - dx * L;
    const y1 = midY - dy * L;
    const x2 = midX + dx * L;
    const y2 = midY + dy * L;
    const m = (y2 - y1) / (x2 - x1);
    const b = y1 - m * x1;

    const imageXPercent = 80;
    const imageX = rect.width * (imageXPercent / 100);
    const yOnLine = m * imageX + b;
    const offsetPx = image.offsetHeight * GRADIENT.offsetRatio;

    image.style.left = `${imageXPercent}%`;
    image.style.top = `${yOnLine + offsetPx}px`;
  }, []);

  const splitTitleToLetters = (el: HTMLElement) => {
    const text = el.textContent || "";
    el.textContent = "";

    const words = text.trim().split(/\s+/);

    words.forEach((word, index) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "title-word inline-block overflow-hidden";

      const innerSpan = document.createElement("span");
      innerSpan.className = "title-letter inline-block";
      innerSpan.textContent = word;

      wordSpan.appendChild(innerSpan);
      el.appendChild(wordSpan);
      if (index < words.length - 1) {
        el.appendChild(document.createTextNode(" "));
      }
    });
  };

  /* ---------------- GSAP ---------------- */
  useEffect(() => {
    const section = themeContentRef.current;
    const image = singleCardRef.current;
    const titleEl = document.querySelector(".doittitle") as HTMLElement;
    if (!section || !image || !titleEl) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasSplitRef.current) {
      splitTextToWords(section);
      splitTitleToLetters(titleEl);
      hasSplitRef.current = true;
    }

    if (prefersReducedMotion) {
      gsap.set(".Theme_content .word", { opacity: 1, y: 0 });
      gsap.set(".doittitle .title-letter", { opacity: 1, y: 0 });
      gsap.set(image, { opacity: 1 });
      return;
    }

    gsap.set(".Theme_content .word", { opacity: 0, y: 30, filter: "blur(4px)" });
    gsap.set(".doittitle .title-letter", { opacity: 0, y: 100, rotateX: -45 });
    gsap.set(image, { opacity: 0, scale: 0.8, rotation: -15 });

    // Title animation - dramatic entrance
    gsap.to(".doittitle .title-letter", {
      opacity: 1,
      y: 0,
      rotateX: 0,
      duration: 1.5,
      ease: "power4.out",
      stagger: { each: 0.15 },
      scrollTrigger: {
        trigger: ".part3_end",
        start: "top center",
        end: "top center-=10%",
        scrub: 2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: positionImageFromGradientCenter,
      },
    });

    // Content words animation - blur to clear with stagger
    gsap.to(".Theme_content .word", {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      ease: "power3.out",
      stagger: { each: 0.03 },
      scrollTrigger: {
        trigger: ".part3_end",
        start: "top center",
        end: "bottom bottom",
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onRefresh: positionImageFromGradientCenter,
      },
    });

    // Image animation - card flip entrance with float
    const imageTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".part3_end",
        start: "top center-=15%",
        end: "top center-=35%",
        scrub: 2,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    imageTl.to(image, {
      opacity: 1,
      scale: 1,
      rotation: 0,
      duration: 2,
      ease: "power3.out",
    });

    // Floating animation for image after entrance
    gsap.to(image, {
      y: "+=15",
      rotation: "+=2",
      duration: 3,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      delay: 2,
    });

    // Decorative elements animation
    if (decorativeRef.current) {
      const particles = decorativeRef.current.querySelectorAll(".particle");
      particles.forEach((particle, i) => {
        gsap.to(particle, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-20, 20),
          opacity: gsap.utils.random(0.3, 0.8),
          duration: gsap.utils.random(2, 4),
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: i * 0.2,
        });
      });
    }

    Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      image.complete ? Promise.resolve() : image.decode(),
    ]).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true);
          positionImageFromGradientCenter();
        });
      });
    });

    const ro = new ResizeObserver(positionImageFromGradientCenter);
    ro.observe(section);
    window.addEventListener("resize", positionImageFromGradientCenter);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", positionImageFromGradientCenter);
    };
  }, [splitTextToWords, positionImageFromGradientCenter]);

  return (
    <section
      ref={aboutSectionRef}
      className="part3_end relative min-h-[100vh] w-full flex flex-col px-[clamp(1.5rem,4vw,3.75rem)] py-[clamp(1.2rem,5svh,5rem)] overflow-hidden justify-evenly"
      style={{
        background: `linear-gradient(195deg, #000000 0%, #000000 60%, #ffffff 60%, #ffffff 100%)`,
      }}
    >
      {/* Decorative floating particles */}


      <div
        className="doittitle mb-6 text-white text-[clamp(3rem,15vw,5rem)] font-joker tracking-wide leading-relaxed"
        style={{ perspective: "1000px" }}
      >
        about synapse
      </div>

      <div ref={themeContentRef} className="Theme max-w-full md:max-w-[60%]">
        <div className="Theme_content text-white text-[clamp(1.15rem,1.5vw,2.1rem)] font-jqka mix-blend-difference leading-relaxed">
          Synapse is more than a college fest — it&apos;s an experience. A
          convergence of creativity, competition, culture, and chaos, Synapse
          brings together minds that dare to think, perform, and challenge the
          ordinary .
          <br />
          <br />
          This year, Synapse&apos;26 invites you into The Joker&apos;s Realm — a
          world where every choice is a move, every event is a game, and nothing
          is ever as simple as it seems .
          <br />
          <br />
          From high-energy concert nights and intense competitions to immersive
          events spread across four action-packed days, Synapse&apos;26
          transforms the campus into a playground of possibilities .
          <br />
          <br />
          Step in, choose your game, and remember — in the Joker&apos;s Realm,
          the game is always watching .
        </div>
      </div>

      <Image
        ref={singleCardRef}
        src="/images_home/Group_9.png"
        alt="Single Card"
        width={673}
        height={567}
        className="hidden md:block absolute pointer-events-none object-contain -translate-x-1/2 md:max-w-[60%] min-w-70 max-h-125 rounded-[10px] will-change-transform w-[clamp(300px,30vw,380px)]"
        style={{ transformStyle: "preserve-3d" }}
      />
    </section>
  );
}
