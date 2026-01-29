"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

// Fallback/Initial data type matching the transformed Supabase data
interface CarouselArtist {
  day: string;
  tag: string;
  artist: string;
  description: string;
  image: string;
  hexColor: string;
}

const COLORS = ["#FE431F", "#317D5F", "#0A7CC1", "#DDB100"];

export default function ArtistCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [artists, setArtists] = useState<CarouselArtist[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize scroll with a default or safe ref. 
  // We'll update layout when data loads.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const fetchArtists = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("artist")
        .select(`
          name,
          bio,
          genre,
          artist_image_url,
          concert (
            concert_date
          )
        `);

      if (error) {
        console.error("Error fetching artists:", error);
        setLoading(false);
        return;
      }

      if (data && data.length > 0) {
        // Sort by date
        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.concert?.concert_date || "");
          const dateB = new Date(b.concert?.concert_date || "");
          return dateA.getTime() - dateB.getTime();
        });

        const transformedData: CarouselArtist[] = sortedData.map((item, index) => {
          // Calculate Day X relative to Feb 26, 2026
          let dayLabel = "TBA";

          if (item.concert?.concert_date) {
            // Hardcoded date mapping to remove all time constraints
            const dateStr = item.concert.concert_date.split('T')[0];

            if (dateStr === "2026-02-26") {
              dayLabel = "DAY 01";
            } else if (dateStr === "2026-02-27") {
              dayLabel = "DAY 02";
            } else if (dateStr === "2026-02-28") {
              dayLabel = "DAY 03";
            } else if (dateStr === "2026-03-01") {
              dayLabel = "DAY 04";
            } else if (dateStr < "2026-02-26") {
              dayLabel = "PRE-SYNAPSE";
            }
          }

          return {
            day: dayLabel,
            tag: item.genre || "MUSIC",
            artist: item.name,
            description: item.bio || "",
            image: item.artist_image_url || "/images_home/HallofFame.jpeg",
            hexColor: COLORS[index % COLORS.length]
          };
        });

        setArtists(transformedData);
      } else {
        // Empty state - Single TBA card
        const tbaArtist: CarouselArtist = {
          day: "TBA",
          tag: "COMING SOON",
          artist: "To be announced",
          description: "Stay tuned for the reveal!",
          image: "", // Empty string will signal fallback
          hexColor: COLORS[0],
        };
        setArtists([tbaArtist]);
      }
      setLoading(false);
    };

    fetchArtists();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-black"
      style={{ height: loading ? "100vh" : `${Math.max(artists.length * 100, 100)}vh` }}
    >
      {loading ? (
        <div className="sticky top-0 h-screen w-full flex items-center justify-center text-white font-jqka text-2xl">
          LOADING ARTISTS...
        </div>
      ) : artists.length === 0 ? (
        <div className="sticky top-0 h-screen w-full flex items-center justify-center text-white font-jqka">
          NO ARTISTS FOUND
        </div>
      ) : (
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="relative w-full max-w-6xl h-[min(600px,80vh)] mx-4">
            {artists.map((data, index) => {
              return (
                <Card
                  key={index}
                  data={data}
                  index={index}
                  total={artists.length}
                  progress={scrollYProgress}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface CardProps {
  data: CarouselArtist;
  index: number;
  total: number;
  progress: MotionValue<number>;
}

const Card = ({ data, index, total, progress }: CardProps) => {
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const sectionSize = 1 / total;

  const startFocus = index * sectionSize;
  const nextStartFocus = (index + 1) * sectionSize;

  const getSlant = (idx: number) => {
    return 0;
  };

  const slant = getSlant(index);

  // Dynamic Z-Index: 
  // Right side (Future): Descending order (Total - Index) so next card is on top of global stack
  // Left side (Past): Ascending order (Index) so recent exited card is on top of old exited cards
  // Active: Boosted to ensure it's above everything
  const zRight = total - index + 10;
  const zLeft = index + 10;
  const zActive = 100;

  // Pivot Z-index around the "center" focus point
  const zIndexRaw = useTransform(
    progress,
    [startFocus - 0.05, startFocus, startFocus + 0.05],
    [zRight, zActive, zLeft]
  );

  // Round to integer for valid CSS z-index
  const zIndex = useTransform(zIndexRaw, (z) => Math.round(z));

  // X-Range: Synchronized train movement
  const xRange = [
    startFocus - sectionSize,
    startFocus,
    nextStartFocus - sectionSize,
    nextStartFocus
  ];

  // X-Range: Percentage of card width + gap to keep space between them
  const xValues = isFirst
    ? ["0%", "0%", "0%", "-105%"]
    : isLast
      ? ["105%", "0%", "0%", "0%"]
      : ["105%", "0%", "0%", "-105%"];

  const x = useTransform(progress, xRange, xValues);

  // Opacity: Ensure card is only visible when it's the active one or part of the transition
  // We use a small buffer (0.05) to allow it to be seen while entering/exiting
  const opacityValues = isFirst
    ? [1, 1, 1, 1]
    : isLast
      ? [1, 1, 1, 1]
      : [1, 1, 1, 1];

  const opacityRange = [
    startFocus - sectionSize,
    startFocus - sectionSize + 0.05,
    nextStartFocus - 0.05,
    nextStartFocus
  ];

  const opacity = useTransform(progress, opacityRange, opacityValues);

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

  // For single item, override animations to stay static
  if (total === 1) {
    return (
      <div
        className="absolute inset-0 w-full h-full rounded-[16px] overflow-hidden shadow-2xl"
        style={{
          backgroundColor: data.hexColor,
          zIndex: 10,
        }}
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
            <p className="text-sm md:text-lg max-w-xl opacity-80 font-jqka font-bold leading-tight tracking-tight mt-4">
              {data.description}
            </p>
          </div>

          {/* Central Inset Image Area - Flex-1 ensures it fills exactly the remaining space */}
          <div className="relative flex-1 min-h-0 mb-2 ml-16 md:ml-20 mr-2 md:mr-4 rounded-[16px] overflow-hidden shadow-2xl border border-white/10 bg-black/20">
            {data.image ? (
              <Image
                src={data.image}
                alt={data.artist}
                fill
                priority={false}
                loading="eager"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                <span className="font-joker text-white text-3xl md:text-5xl text-center opacity-50 px-4">
                  To be announced
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{
        x,
        y,
        rotate,
        opacity,
        backgroundColor: data.hexColor,
        zIndex,
        transformOrigin: "center center",
      }}
      className="absolute inset-0 w-full h-full rounded-[16px] overflow-hidden shadow-2xl"
    >
      <div className="relative w-full h-full p-8 md:p-12 flex flex-col text-white font-mono italic-none">
        {/* Vertical Text - Left Side */}
        <div className="absolute left-6 md:left-8 top-10 flex flex-col justify-between h-[calc(100%-80px)] pointer-events-none">
          <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-2xl tracking-[0.2em] font-black">
            {data.day}
          </span>
          <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-2xl tracking-[0.3em] font-black opacity-60">
            {data.tag}
          </span>
        </div>

        {/* Top Info Area - Fixed height or shrink prevention ensures alignment */}
        <div className="ml-16 md:ml-20 mb-6 shrink-0">
          <h2 className="text-3xl md:text-5xl font-normal font-jqka tracking-[0.1em] mb-1 leading-none">
            {data.artist}
          </h2>
          <p className="text-sm md:text-lg max-w-xl opacity-80 font-jqka font-bold leading-tight tracking-[0.1em] mt-4">
            {data.description}
          </p>
        </div>

        {/* Central Inset Image Area - Flex-1 ensures it fills exactly the remaining space */}
        <div className="relative flex-1 min-h-0 mb-2 ml-16 md:ml-20 mr-2 md:mr-4 rounded-[16px] overflow-hidden shadow-2xl border border-white/10 bg-black/20">
          {data.image ? (
            <Image
              src={data.image}
              alt={data.artist}
              fill
              priority={false}
              loading="eager"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900">
              <span className="font-joker text-white text-3xl md:text-5xl text-center opacity-50 px-4">
                To be announced
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};