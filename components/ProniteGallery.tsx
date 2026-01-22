"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const galleryImages = [
  "/images_halloffame/15.jpeg",
  "/images_halloffame/2.jpeg",
  "/images_halloffame/3.jpeg",
  "/images_halloffame/4.jpeg",
  "/images_halloffame/5.jpeg",
  "/images_halloffame/6.jpeg",
  "/images_halloffame/1.jpeg",
  "/images_halloffame/8.jpeg",
  "/images_halloffame/7.jpeg",
  "/images_halloffame/12.jpeg",
  "/images_halloffame/11.jpeg",
  "/images_halloffame/16.jpeg",
  "/images_halloffame/13.jpeg",
  "/images_halloffame/14.jpeg",
  "/images_halloffame/10.jpeg",
];

export default function ProniteGallery() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Create slow, alternating scroll offsets for different columns
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y4 = useTransform(scrollYProgress, [0, 1], [0, 800]);
  const y5 = useTransform(scrollYProgress, [0, 1], [0, 1200]);
  const y6 = useTransform(scrollYProgress, [0, 1], [0, 1600]);

  // Distribute images into columns
  const columns = [
    { images: [galleryImages[0], galleryImages[5], galleryImages[10], galleryImages[1]], y: y1 },
    { images: [galleryImages[2], galleryImages[7], galleryImages[12], galleryImages[3]], y: y2 },
    { images: [galleryImages[4], galleryImages[9], galleryImages[14], galleryImages[5]], y: y3 },
    { images: [galleryImages[6], galleryImages[11], galleryImages[0], galleryImages[7]], y: y4 },
    { images: [galleryImages[8], galleryImages[13], galleryImages[1], galleryImages[9]], y: y5 },
    { images: [galleryImages[10], galleryImages[14], galleryImages[2], galleryImages[6]], y: y6 },
    { images: [galleryImages[3], galleryImages[0], galleryImages[5], galleryImages[11]], y: y1 },
  ];

  return (
    <section ref={containerRef} className="relative w-full h-[140svh] bg-black overflow-hidden flex items-center justify-center">
      {/* Tilted Grid Container */}
      <div className="absolute inset-0 w-[280%] h-[300%] -left-[90%] -top-[80%] rotate-[-26deg] flex justify-start md:justify-center gap-x-4 md:gap-x-8 p-8 opacity-100 md:opacity-90">
        {columns.map((col, i) => (
          <motion.div
            key={i}
            style={{ y: col.y }}
            className="flex flex-col gap-y-0 w-[18%] md:w-[9%] shrink-0"
          >
            {col.images.map((src, idx) => (
              <div
                key={idx}
                className="relative w-full h-[850px] md:border-[6px] border-black shadow-2xl overflow-hidden -mb-56"
              >
                <img
                  src={src}
                  className="w-full h-full object-cover grayscale-0 md:grayscale-[0.8] md:hover:grayscale-0 transition-all duration-500"
                  alt="Festival Moment"
                />
              </div>
            ))}
          </motion.div>
        ))}
      </div>

      {/* Signature Banner - Exact Arrowhead Style */}
      <div className="absolute right-0 bottom-[20%] z-50">
        <div
          className="bg-white text-black py-8 pl-40 pr-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-end"
          style={{
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)",
          }}
        >
          <h2 className="text-[clamp(1.5rem,4vw,3.5rem)] font-jqka tracking-tighter leading-none text-right font-black uppercase italic">
            ARTISTS WHO RULED OUR
          </h2>
          <h1 className="text-[clamp(3rem,8vw,7rem)] font-jqka tracking-widest leading-none text-right font-black uppercase italic mt-1">
            NIGHTS
          </h1>
        </div>
      </div>

      {/* Vignette Overlay for Depth */}
      <div className="absolute inset-0 hidden opacity-100 md:block pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
    </section>
  );
}
