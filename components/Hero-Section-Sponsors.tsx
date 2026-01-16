"use client";

import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Image from "next/image";

export default function HeroSection() {
  return (
    <>
      <div className="relative w-full h-[500px] md:h-[650px] overflow-hidden">
        <Navbar visible={true}>
          <NavigationPanel />
        </Navbar>

        <Image
          src="/images_sponsor/image 29.png"
          alt="Sponsors Hero"
          className="absolute top-0 left-0 w-full h-full object-cover object-top"
        />

        {/* gradient */}
        <div className="absolute bottom-0 left-0 w-full h-[220px] bg-linear-to-b from-transparent to-black" />
      </div>

      <Image
        src="/images_sponsor/Sponsors.png"
        alt="Sponsors Heading"
        width={420}
        height={100}
        className="w-[clamp(240px,60vw,420px)] h-auto mb-4"
      />
    </>
  );
}
