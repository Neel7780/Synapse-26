"use client";

import React from "react";

const galleryImages = [
  "/images_home/MohitChauhan.jpg",
  "/images_home/Shaan.jpg",
  "/images_home/NikhilDSouza.jpg",
  "/images_home/DJSartek.jpg",
  "/images_home/TeriMiko.jpg",
  "/images_home/RaviGupta.jpg",
  "/images_home/part3-image.png",
  "/images_home/RedHand2.jpeg",
  "/images_home/redcard4.png",
  "/images_home/AdityaGadhvi.jpeg",
  "/images_home/image_part3_2.png",
  "/images_home/Ace_Spades.png",
  "/images_home/Ace_Heart.png",
  "/images_home/Ace_Clubs.png",
  "/images_home/Ace_Diamond.png",
];

export default function ProniteGallery() {
  return (
    <section className="relative w-full h-[140svh] bg-black overflow-hidden flex items-center justify-center">
      {/* Tilted Grid Container */}
      <div className="absolute inset-0 w-[280%] h-[200%] -left-[90%] -top-[40%] rotate-[-26deg] flex flex-wrap gap-x-6 gap-y-0 p-8 opacity-90">
        {galleryImages.map((src, i) => (
          <div
            key={i}
            className="relative w-[18%] h-[850px] border-[6px] border-black shadow-2xl overflow-hidden -mb-56"
          >
            <img
              src={src}
              className="w-full h-full object-cover grayscale-[0.8] hover:grayscale-0 transition-all duration-500"
              alt="Festival Moment"
            />
          </div>
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
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]"></div>
    </section>
  );
}
