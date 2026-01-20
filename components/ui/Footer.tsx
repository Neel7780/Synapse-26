"use client";

import React, { memo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ContactFooter: React.FC = memo(function ContactFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!footerRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Title animation - slide in from left with character split
      if (titleRef.current) {
        const text = titleRef.current.textContent || "";
        titleRef.current.innerHTML = "";

        text.split("").forEach((char) => {
          const span = document.createElement("span");
          span.className = "inline-block footer-char";
          span.textContent = char === " " ? "\u00A0" : char;
          titleRef.current?.appendChild(span);
        });

        gsap.fromTo(
          ".footer-char",
          {
            opacity: 0,
            y: 50,
            rotateX: -90,
          },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.03,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      // Logo animation - scale and rotate in
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          {
            opacity: 0,
            scale: 0,
            rotation: -180,
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }

      // Content animation - staggered fade in from bottom
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll("address, p");

        gsap.fromTo(
          elements,
          {
            opacity: 0,
            y: 30,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: footerRef.current,
              start: "top 70%",
              once: true,
            },
          }
        );
      }

      // Social links animation - slide in from bottom with bounce
      if (socialRef.current) {
        const links = socialRef.current.querySelectorAll("a");

        gsap.fromTo(
          links,
          {
            opacity: 0,
            y: 40,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: socialRef.current,
              start: "top 90%",
              once: true,
            },
          }
        );

        // Hover animations for social links
        links.forEach((link) => {
          link.addEventListener("mouseenter", () => {
            gsap.to(link, {
              scale: 1.1,
              y: -5,
              color: "#EB0000",
              duration: 0.3,
              ease: "power2.out",
            });
          });

          link.addEventListener("mouseleave", () => {
            gsap.to(link, {
              scale: 1,
              y: 0,
              color: "#ffffff",
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Parallax effect on background
      gsap.to(".footer-bg", {
        yPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative w-full h-full bg-black text-white font-sans overflow-hidden"
    >
      <div className="footer-bg absolute inset-0">
      <Image
        src="/FooterFirework.png"
          alt=""
          fill
          sizes="100vw"
          loading="lazy"
          className="object-cover pointer-events-none"
          aria-hidden="true"
        />
      </div>

      <div className="absolute inset-0 bg-black/20 z-10" aria-hidden="true" />

      <div className="relative z-20 w-full min-h-[calc(100svh-40px)] flex flex-col">
        <div className="w-full">
          <Image
            src="/subtract.svg"
            alt=""
            width={1920}
            height={400}
            className="w-full top-0 h-auto object-contain"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        <div ref={contentRef} className="px-4 md:px-[20px] pt-6 pb-4 md:pt-5 md:pb-2.5 flex flex-col flex-1">
          <div className="flex sm:flex-row items-center justify-between mb-4 md:mb-10 md:mt-14">
            <h2
              ref={titleRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-0"
              style={{ perspective: "1000px" }}
            >
              Contact us
            </h2>
            <div ref={logoRef}>
            <Image
              src="/Synapse Logo.png"
                alt="Synapse Logo"
              width={50}
              height={50}
              className="w-10 h-10 sm:w-12 sm:h-12"
                loading="lazy"
            />
            </div>
          </div>

          <p className="sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-4">Reach Us Out At</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8 md:mb-7 text-sm sm:text-base md:text-lg">
            <address className="leading-relaxed sm:leading-loose not-italic">
              <div className="mb-2">
                <span className="font-semibold">Heet Shah:</span>
                <Link
                  href="tel:+919512101868"
                  className="ml-1 hover:text-red-500 transition-colors duration-200"
                  aria-label="Call Heet Shah"
                >
                  +91 95121 01868
                </Link>
                <span className="block text-sm text-white/70">(Public Relation Head)</span>
              </div>
              <div>
                <span className="font-semibold">Ved Dhanani:</span>
                <Link
                  href="tel:+917435921242"
                  className="ml-1 hover:text-red-500 transition-colors duration-200"
                  aria-label="Call Ved Dhanani"
                >
                  +91 74359 21242
                </Link>
                <span className="block text-sm text-white/70">(Events Head)</span>
              </div>
            </address>

            <address className="text-left lg:text-right lg:pl-6 xl:pl-10 leading-relaxed sm:leading-loose not-italic">
              <p>DAU-campus (formerly DA-IICT), near Reliance Cross Rd,</p>
              <p>Gandhinagar, Gujarat 382007, India</p>
              <div className="flex flex-row lg:justify-end gap-[10px] mt-4 md:mt-2.5">
                <span>Email:</span>
                <Link
                  href="mailto:synapse.thefest@dau.ac.in"
                  className="block hover:text-red-500 transition-colors duration-200"
                >
                  synapse.thefest@dau.ac.in
                </Link>
              </div>
            </address>
          </div>

          <nav
            ref={socialRef}
            className="flex flex-wrap justify-center bottom-0 gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-auto pb-6 sm:pb-4 md:pb-2.5"
            aria-label="Social media links"
          >
            <Link
              href="https://www.instagram.com/synapsedaiict"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-sm sm:text-base md:text-lg font-bold tracking-widest px-2 py-1 cursor-hover"
              aria-label="Follow us on Instagram"
              data-cursor-magnetic
            >
              INSTAGRAM
            </Link>
            <Link
              href="https://www.youtube.com/@SynapseDAIICT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-sm sm:text-base md:text-lg font-bold tracking-widest px-2 py-1 cursor-hover"
              aria-label="Subscribe to our YouTube channel"
              data-cursor-magnetic
            >
              YOUTUBE
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
});

export default ContactFooter;
