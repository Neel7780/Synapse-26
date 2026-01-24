"use client";


import Image from "next/image";

export default function HeroSection() {
  return (
    <>
      <div className="relative w-full min-h-[80dvh] overflow-hidden">


        <Image
          src="/images_sponsor/image 29.png"
          width={500}
          height={500}
          alt="Sponsors Hero"
          priority={false}
          loading="eager"
          className="absolute top-0 left-0 w-full h-[80dvh] object-cover object-bottom"
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
