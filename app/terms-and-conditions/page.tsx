"use client";

import React from "react";
import Footer from "@/components/ui/Footer";
import Image from "next/image";

const TERMS_CONTENT = [
  {
    title: "No Refund Policy",
    points: [
      "Tickets purchased for CEP/OAT events and concerts are strictly non-refundable.",
      "In cases of mistaken double payments, refunds will only be considered after the completion of the fest.",
      "Proper documentation and proof of the double transaction will be required for processing.",
    ],
  },
  {
    title: "Behavioral Expectations",
    points: [
      "Synapse’26 is a safe and inclusive space for everyone.",
      "Any form of nuisance, harassment, or vandalism will not be tolerated.",
      "Attendees may face immediate removal and legal consequences.",
    ],
  },
  {
    title: "Entry and Identification",
    points: [
      "Entry to events requires a valid pass and government-issued photo ID. Attendees are responsible for safeguarding their passes and IDs throughout the festival.",
    ],
  },
  {
    title: "Cancellation Policy",
    points: [
      "If the number of participants registered does not meet the required criteria, the event will be cancelled and charges will be fully refunded.",
    ],
  },
  {
    title: "Payment Policy",
    points: [
      "All payments for Synapse&apos;26 events will be processed through the Razorpay payment gateway.",
      "Payments can be made using UPI, Debit Card, Credit Card, or Internet Banking.",
    ],
  },
  {
    title: "Liability",
    points: [
      "The Synapse Committee is not responsible for loss or damage to personal belongings. Attendees are advised to keep valuables secure.",
    ],
  },
];

const styles = {
  h3: "text-base sm:text-lg lg:text-[25px] mt-10 mb-8 font-medium term-title opacity-0",
  ul: "max-w-[1000px] ml-4 sm:ml-5 mb-4 list-disc list-inside",
  li: "text-sm sm:text-base lg:text-[25px] leading-relaxed text-[#dddddd] mb-2 term-point opacity-0",
};

import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Terms() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Animate Title
      if (titleRef.current) {
        gsap.fromTo(titleRef.current,
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
        );
      }

      // Animate Intro Text
      gsap.fromTo(".intro-text",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" }
      );

      // Animate Sections
      const sections = document.querySelectorAll(".term-section");
      sections.forEach((section, i) => {
        const title = section.querySelector(".term-title");
        const points = section.querySelectorAll(".term-point");

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          }
        });

        if (title) {
          tl.fromTo(title,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
          );
        }

        if (points.length) {
          tl.fromTo(points,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
            "-=0.4"
          );
        }
      });

      // Footer text
      gsap.fromTo(".footer-text",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".footer-text",
            start: "top 90%",
            toggleActions: "play none none reverse",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-screen min-h-[100dvh] overflow-x-hidden  text-white">


      <div className="fixed inset-0 z-0">
        <Image
          src="/termsbg.png"
          alt="Background"
          fill
          priority={false}
          loading="eager"
          className="object-contain object-center"
        />
      </div>
      <div className="fixed inset-0 z-0 bg-black/60" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 pt-28 pb-20 sm:px-6 lg:px-[120px] lg:pt-36">
        <h1 ref={titleRef} className="mb-12 sm:mb-16 lg:mb-20 text-3xl sm:text-5xl lg:text-[90px] text-center tracking-wide font-joker lowercase opacity-0">
          Terms & Conditions
        </h1>

        <p className="intro-text mb-10 sm:mb-14 lg:mb-16 max-w-[1000px] text-sm sm:text-base lg:text-[26px] leading-relaxed text-[#e6e6e6] font-poppins opacity-0">
          Welcome to Synapse’26! To ensure an enjoyable and hassle-free
          experience for all attendees, please carefully read and adhere to the
          following terms and conditions:
        </p>

        {TERMS_CONTENT.map((section, index) => (
          <div key={index} className="term-section">
            <h3 className={styles.h3}>
              {index + 1}. {section.title}
            </h3>

            <ul className={styles.ul}>
              {section.points.map((point, i) => (
                <li key={i} className={styles.li}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="footer-text mb-10 mt-10 sm:mb-14 lg:mb-16 sm:mt-14 lg:mt-16 max-w-[1000px] text-sm sm:text-base lg:text-[25px] leading-relaxed text-[#e6e6e6] opacity-0">
          By attending Synapse&apos;26, you agree to abide by these terms and
          conditions. Failure to comply may result in removal from the festival
          premises without any refund. We appreciate your cooperation in making
          Synapse&apos;26 a memorable and magical experience for everyone!
        </p>
      </div>
      <Footer />
    </div>
  );
}
