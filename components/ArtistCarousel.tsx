"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const artistData = [
  {
    day: "DAY 01",
    tag: "HEART",
    artist: "ADITYA GADHAVI",
    description: "THE VOICE THAT CARRIES GUJARAT'S SOUL AND STORIES, READY TO ECHO ACROSS THE NIGHT.",
    image: "/images_home/part3-image.png",
    hexColor: "#FE431F",
  },
  {
    day: "DAY 02",
    tag: "SOUL",
    artist: "MOHIT CHAUHAN",
    description: "A LEGENDARY VOICE THAT HAS DEFINED ROMANCE AND SOUL IN INDIAN MUSIC FOR DECADES.",
    image: "/images_home/MohitChauhan.jpg",
    hexColor: "#317D5F",
  },
  {
    day: "DAY 03",
    tag: "VIBE",
    artist: "SHAAN",
    description: "THE MOST VERSATILE VOICE THAT BRINGS UNMATCHED ENERGY AND JOY TO EVERY PERFORMANCE.",
    image: "/images_home/Shaan.jpg",
    hexColor: "#0A7CC1",
  },
  {
    day: "DAY 04",
    tag: "BASS",
    artist: "DJ SARTEK",
    description: "THE MAN WHO HAS BEEN ROCKING THE DANCE FLOORS ACROSS THE GLOBE WITH HIS INFECTIOUS BEATS.",
    image: "/images_home/DJSartek.jpg",
    hexColor: "#DDB100",
  },
];

export default function ArtistCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-black">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Adjusted height to be more responsive and ensuring center alignment */}
        <div className="relative w-full max-w-6xl h-[min(600px,80vh)] px-4">
          {artistData.map((data, index) => {
            return (
              <Card
                key={index}
                data={data}
                index={index}
                total={artistData.length}
                progress={scrollYProgress}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface CardProps {
  data: typeof artistData[0];
  index: number;
  total: number;
  progress: any;
}

const Card = ({ data, index, total, progress }: CardProps) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const sectionSize = 1 / total;

  const startFocus = index * sectionSize;
  const nextStartFocus = (index + 1) * sectionSize;

  const getSlant = (idx: number) => {
    if (idx === 0) return 0;
    const slants = [0, -35, 30, -25, 20];
    return slants[idx % slants.length];
  };

  const slant = getSlant(index);
  const zIndex = 10 + index;

  // X-Range: Synchronized train movement
  const xRange = [
    startFocus - sectionSize,
    startFocus,
    nextStartFocus - sectionSize,
    nextStartFocus
  ];

  const xValues = isFirst
    ? ["0%", "0%", "0%", "-120%"]
    : isLast
      ? ["120%", "0%", "0%", "0%"]
      : ["120%", "0%", "0%", "-120%"];

  const x = useTransform(progress, xRange, xValues);

  // Rotation: Straighten by 40% of the way to center
  const rotateRange = [
    startFocus - sectionSize,
    startFocus - (sectionSize * 0.6), // 40% Entry reached
    startFocus,
    nextStartFocus
  ];
  const rotateValues = [slant, 0, 0, 0];
  const rotate = useTransform(progress, rotateRange, rotateValues);

  // Y Position: The "lift" only happens when exiting
  const yRange = [
    nextStartFocus - sectionSize,
    nextStartFocus
  ];
  const yValues = isLast
    ? ["0px", "0px"]
    : ["0px", "-60px"];
  const y = useTransform(progress, yRange, yValues);

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        opacity: 1,
        backgroundColor: data.hexColor,
        zIndex,
        transformOrigin: "center center",
      }}
      className="absolute inset-0 w-full h-full rounded-[16px] overflow-hidden shadow-2xl"
    >
      <div className="relative w-full h-full p-8 md:p-12 flex flex-col text-white font-mono uppercase italic-none">
        {/* Vertical Text - Left Side */}
        <div className="absolute left-6 md:left-8 top-10 flex flex-col justify-between h-[calc(100%-80px)] pointer-events-none">
          <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-lg tracking-[0.2em] font-black">
            {data.day}
          </span>
          <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-lg tracking-[0.3em] font-black opacity-60">
            {data.tag}
          </span>
        </div>

        {/* Top Info Area - Fixed height or shrink prevention ensures alignment */}
        <div className="ml-16 md:ml-20 mb-6 shrink-0">
          <h2 className="text-3xl md:text-5xl font-black font-jqka tracking-tighter mb-1 leading-none">
            {data.artist}
          </h2>
          <p className="text-[10px] md:text-xs max-w-xl opacity-80 font-jqka font-bold leading-tight tracking-tight">
            {data.description}
          </p>
        </div>

        {/* Central Inset Image Area - Flex-1 ensures it fills exactly the remaining space */}
        <div className="relative flex-1 min-h-0 mb-2 ml-16 md:ml-20 mr-2 md:mr-4 rounded-[16px] overflow-hidden shadow-2xl border border-white/10 bg-black/20">
          <img
            src={data.image}
            alt={data.artist}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </motion.div>
  );
};
