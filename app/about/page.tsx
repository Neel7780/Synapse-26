"use client";

import { useRef, useEffect } from "react";
import Footer from "@/components/ui/Footer";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function About() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const paragraphRefs = useRef<(HTMLParagraphElement | null)[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let ctx: gsap.Context;

    const initAnimations = () => {
      ctx = gsap.context(() => {
        const isMobile = window.innerWidth < 768;

        // Title animation
        if (titleRef.current) {
          if (!isMobile) {
            // DESKTOP: Complex Split Text
            const text = titleRef.current.textContent || "";
            if (!titleRef.current.querySelector("span")) {
              titleRef.current.innerHTML = "";
              text.split("").forEach((char) => {
                const span = document.createElement("span");
                span.className = "inline-block";
                span.textContent = char === " " ? "\u00A0" : char;
                span.style.opacity = "0";
                titleRef.current?.appendChild(span);
              });
            }
            gsap.fromTo(
              titleRef.current.querySelectorAll("span"),
              { opacity: 0, y: 100, rotateX: -90, scale: 0.5 },
              {
                opacity: 1,
                y: 0,
                rotateX: 0,
                scale: 1,
                duration: 0.8,
                ease: "back.out(1.7)",
                stagger: 0.04,
                scrollTrigger: {
                  trigger: titleRef.current,
                  start: "top 85%",
                  end: "top 30%",
                  scrub: 1,
                },
              }
            );
          } else {
            // MOBILE: Simple Fade In
            gsap.fromTo(
              titleRef.current,
              { opacity: 0, y: 50 },
              {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: titleRef.current,
                  start: "top 85%",
                  end: "top 40%",
                  scrub: 1,
                },
              }
            );
          }
        }

        // Image float animation
        if (imageRef.current) {
          gsap.fromTo(
            imageRef.current,
            { opacity: 0, x: -100, rotateZ: -15 },
            {
              opacity: 1,
              x: 0,
              rotateZ: 0,
              duration: 1.2,
              ease: "power3.out",
              scrollTrigger: {
                trigger: imageRef.current,
                start: "top 80%",
                end: "top 30%",
                scrub: 1,
              },
            }
          );

          gsap.to(imageRef.current, {
            y: 15,
            duration: 3,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        }

        // Paragraph animations
        paragraphRefs.current.forEach((para, index) => {
          if (!para) return;

          if (!isMobile) {
            // DESKTOP: Word Split
            const text = para.textContent || "";
            if (!para.querySelector(".gsap-word")) {
              para.innerHTML = "";
              const words = text.split(/\s+/);
              words.forEach((word) => {
                const span = document.createElement("span");
                span.className = "inline-block mr-[0.25em] gsap-word";
                span.textContent = word;
                para.appendChild(span);
              });
            }

            gsap.fromTo(
              para.querySelectorAll(".gsap-word"),
              { opacity: 0, y: 20, filter: "blur(4px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                duration: 0.5,
                ease: "power2.out",
                stagger: 0.02,
                scrollTrigger: {
                  trigger: para,
                  start: "top 90%",
                  end: "bottom 70%",
                  scrub: 1,
                },
                delay: index * 0.1,
              }
            );
          } else {
            // MOBILE: Simple Fade Up
            gsap.fromTo(
              para,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: para,
                  start: "top 95%",
                  end: "bottom 85%",
                  scrub: 1,
                },
                delay: index * 0.1,
              }
            );
          }
        });
      }, containerRef);
    };

    // Small delay to ensure layout is ready
    const timer = setTimeout(() => {
      initAnimations();
      ScrollTrigger.refresh();
    }, 100);

    return () => {
      clearTimeout(timer);
      ctx?.revert();
    };
  }, []);

  const setParagraphRef = (index: number) => (el: HTMLParagraphElement | null) => {
    paragraphRefs.current[index] = el;
  };

  return (
    <div ref={containerRef}>


      {/* MAIN AREA */}
      <main className="w-screen bg-black text-white overflow-x-hidden">
        {/* MAIN CONTENT */}
        <section className="flex flex-col md:flex-row">
          {/* LEFT ART – narrow */}
          <div
            ref={imageRef}
            className="w-full md:w-[30%] hidden md:flex items-end pl-10 justify-center md:justify-start"
          >
            <Image
              src="/about-art.png"
              width={500}
              height={500}
              alt="Decorative cards"
              className="h-[90%]"
            />
          </div>

          {/* MOBILE IMAGE BACKGROUND */}
          <div className="fixed inset-0 md:hidden z-0">
            <Image
              src="/about-art.png"
              alt="Decorative background"
              fill
              className="object-cover opacity-60"
              priority
            />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* RIGHT TEXT – zyada width */}
          <div className="w-full lg:w-[70%] flex flex-col justify-center items-start px-6 py-15 md:px-12 lg:py-24 lg:pr-[120px] relative z-10">
            {/* ABOUT US HEADING (Joker) */}
            <h1
              ref={titleRef}
              className="font-joker font-normal text-5xl md:text-8xl xl:text-[140px] leading-none tracking-normal mb-8 w-full text-center lg:text-right"
              style={{ perspective: "1000px" }}
            >
              about us
            </h1>

            {/* CONTENT (JQKAs Wild) */}
            <div className="font-jqka text-left w-full">
              <div className="space-y-6 text-[#e5e5e5] text-lg md:text-xl lg:text-2xl leading-relaxed lg:leading-[39px] tracking-wide">
                <p ref={setParagraphRef(0)}>
                  Step into the twisted wonderland of Synapse&apos;26, Gujarat&apos;s most
                  electrifying and unforgettable annual cultural festival!
                  Curated by the bold and brilliant Synapse Committee, this
                  four-day spectacle is where chaos meets creativity and rules
                  are meant to be bent.
                </p>

                <p ref={setParagraphRef(1)}>
                  From 26th February to 1st March, Synapse&apos;26 unveils The Joker&apos;s Realm — a world where
                  laughter hides secrets, madness fuels art, and unpredictability is
                  the only constant. Expect three explosive concert nights with
                  artists who&apos;ll shake your reality, a riotous stand-up comedy night,
                  and 25+ high-energy events designed to test your talent, nerve, and
                  wit.
                </p>

                <p ref={setParagraphRef(2)}>
                  This isn&apos;t just a fest — it&apos;s a game of minds and moments.
                  From jaw-dropping performances and immersive experiences to
                  thrilling competitions and surprise twists at every turn, The
                  Joker&apos;s Realm invites you to embrace the beautiful chaos.
                </p>

                <p ref={setParagraphRef(3)}>
                  Whether you&apos;re a performer craving the spotlight, a strategist
                  chasing victory, or a free spirit seeking unforgettable vibes
                  — Synapse&apos;26 is your wild card.
                </p>

                <p ref={setParagraphRef(4)} className="text-white mt-8 font-medium">
                  So shuffle the deck, take your chance, and step into the realm
                  where nothing is predictable and everything is legendary.
                  Dare to play. Dare to stay. Welcome to Synapse&apos;26. 🔥
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </div>
  );
}
