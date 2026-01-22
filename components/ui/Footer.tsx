"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react";

export default function Footer() {
  return (
    <footer id="contact" className="relative w-full bg-[linear-gradient(165deg,#990000_0%,#000000_65%)] text-white overflow-hidden pt-6 pb-6 flex flex-col justify-between min-h-screen md:min-h-0">
      <div className="px-6 md:px-16 w-full flex flex-col flex-grow">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight uppercase">Contact us</h1>
          <Image
            src="/Synapse Logo.png"
            alt="Synapse Logo"
            width={64}
            height={64}
            className="w-12 h-12 md:w-20 md:h-20 object-contain"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 w-full mb-8 md:mb-14">
          {/* Left Column: Contacts */}
          <div className="flex flex-col gap-6 md:gap-8">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-wide text-gray-200 uppercase">Reach Us Out At</h2>

            <div className="flex flex-col gap-4 md:gap-6 text-lg md:text-xl">
              <div className="flex flex-col">
                <p className="font-medium text-white">
                  Heet Shah: <Link href="tel:+919512101868" className="hover:text-blue-400 transition-colors">+91 95121 01868</Link>
                </p>
                <p className="text-gray-400 text-sm md:text-base mt-1">(Public Relation Head)</p>
              </div>

              <div className="flex flex-col">
                <p className="font-medium text-white">
                  Ved Dhanani: <Link href="tel:+917435921242" className="hover:text-blue-400 transition-colors">+91 74359 21242</Link>
                </p>
                <p className="text-gray-400 text-sm md:text-base mt-1">(Events Head)</p>
              </div>
            </div>
          </div>

          {/* Right Column: Address & Socials */}
          <div className="flex flex-col gap-6 md:gap-8 md:text-right items-start md:items-end justify-end">
            <div className="text-lg md:text-xl leading-relaxed md:max-w-xl text-gray-300">
              <p>DAU-campus (formerly DA-IICT), near Reliance Cross Rd,</p>
              <p>Gandhinagar, Gujarat 382007, India</p>
            </div>

            <div className="flex flex-col gap-1 md:items-end">
              <span className="text-lg md:text-xl text-gray-400">Email:</span>
              <Link
                href="mailto:synapse.thefest@dau.ac.in"
                className="text-lg md:text-xl hover:text-blue-400 transition-colors text-white"
              >
                synapse.thefest@dau.ac.in
              </Link>
            </div>

            <div className="flex gap-6 mt-2">
              <Link
                href="https://www.instagram.com/synapsedaiict?igsh=MXUwYzc5ZGE4N2NhZA=="
                target="_blank"
                className="hover:scale-110 transition-transform duration-200"
              >
                <IconBrandInstagram size={32} strokeWidth={2} />
              </Link>
              <Link
                href="http://www.youtube.com/@SynapseDAIICT"
                target="_blank"
                className="hover:scale-110 transition-transform duration-200"
              >
                <IconBrandYoutube size={32} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Text */}
      <div className="w-full flex justify-center mt-auto leading-none overflow-hidden px-4 md:px-10">
        <h1
          className="font-jqka w-full flex justify-between items-end select-none leading-[0.75] translate-y-[2%]"
          style={{
            fontSize: '22vw',
            backgroundImage: "url('/footer.png')",
            backgroundSize: '100% auto', // Make sure it covers horizontally but respects aspect vertically
            backgroundPosition: 'center 85%', // Move image up/down to catch the "meat" of it in the text
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextStroke: '2px #ff0000',
          }}
        >
          {"SYNAPSE".split("").map((char, index) => (
            <span key={index}>{char}</span>
          ))}
        </h1>
      </div>
    </footer>
  );
}