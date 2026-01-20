"use client";

import React, { memo } from "react";
import Image from "next/image";
import Link from "next/link";

const ContactFooter: React.FC = memo(function ContactFooter() {
  return (
    <footer
      id="contact"
      className="relative w-full h-full bg-black text-white font-sans overflow-hidden"
    >
      <Image
        src="/FooterFirework.png"
        alt=""
        fill
        sizes="100vw"
        loading="lazy"
        className="object-cover pointer-events-none"
        aria-hidden="true"
      />

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

        <div className="px-4 md:px-[20px] pt-6 pb-4 md:pt-5 md:pb-2.5 flex flex-col flex-1">
          <div className="flex sm:flex-row items-center justify-between mb-4 md:mb-10 md:mt-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-0">
              Contact us
            </h2>
            <Image
              src="/Synapse Logo.png"
              alt="Synapse Logo"
              width={50}
              height={50}
              className="w-10 h-10 sm:w-12 sm:h-12"
              loading="lazy"
            />
          </div>

          <p className="sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-4">Reach Us Out At</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8 md:mb-7 text-sm sm:text-base md:text-lg">
            <address className="leading-relaxed sm:leading-loose not-italic">
              <div className="mb-2">
                <span className="font-semibold">Heet Shah:</span>
                <Link 
                  href="tel:+919512101868" 
                  className="ml-1 hover:text-indigo-300 transition-colors duration-200"
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
                  className="ml-1 hover:text-indigo-300 transition-colors duration-200"
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
                  className="block hover:text-indigo-300 transition-colors duration-200"
                >
                  synapse.thefest@dau.ac.in
                </Link>
              </div>
            </address>
          </div>

          <nav 
            className="flex flex-wrap justify-center bottom-0 gap-4 sm:gap-6 md:gap-8 lg:gap-10 mt-auto pb-6 sm:pb-4 md:pb-2.5"
            aria-label="Social media links"
          >
            <Link
              href="https://www.instagram.com/synapsedaiict"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-sm sm:text-base md:text-lg font-bold tracking-widest hover:text-[#667eea] hover:-translate-y-0.5 transition-all duration-300 ease-in-out px-2 py-1"
              aria-label="Follow us on Instagram"
            >
              INSTAGRAM
            </Link>
            <Link
              href="https://www.youtube.com/@SynapseDAIICT"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white no-underline text-sm sm:text-base md:text-lg font-bold tracking-widest hover:text-[#667eea] hover:-translate-y-0.5 transition-all duration-300 ease-in-out px-2 py-1"
              aria-label="Subscribe to our YouTube channel"
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
