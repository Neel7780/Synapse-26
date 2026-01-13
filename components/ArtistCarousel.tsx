'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const artistData = [
    {
        day: "DAY 01",
        tag: "HEART",
        artist: "ADITYA GADHAVI",
        description: "THE VOICE THAT CARRIES GUJARAT'S SOUL AND STORIES, READY TO ECHO ACROSS THE NIGHT.",
        image: "/images_home/part3-image.png",
        hexColor: "#FE431F"
    },
    {
        day: "DAY 02",
        tag: "SOUL",
        artist: "MOHIT CHAUHAN",
        description: "A LEGENDARY VOICE THAT HAS DEFINED ROMANCE AND SOUL IN INDIAN MUSIC FOR DECADES.",
        image: "/images_home/MohitChauhan.jpg",
        hexColor: "#317D5F"
    },
    {
        day: "DAY 03",
        tag: "VIBE",
        artist: "SHAAN",
        description: "THE MOST VERSATILE VOICE THAT BRINGS UNMATCHED ENERGY AND JOY TO EVERY PERFORMANCE.",
        image: "/images_home/Shaan.jpg",
        hexColor: "#0A7CC1"
    },
    {
        day: "DAY 04",
        tag: "BASS",
        artist: "DJ SARTEK",
        description: "THE MAN WHO HAS BEEN ROCKING THE DANCE FLOORS ACROSS THE GLOBE WITH HIS INFECTIOUS BEATS.",
        image: "/images_home/DJSartek.jpg",
        hexColor: "#DDB100"
    }
];

export default function ArtistCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % artistData.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + artistData.length) % artistData.length);
    };

    return (
        <section className="relative bg-black py-20 overflow-hidden flex flex-col items-center">
            <div className="relative w-full max-w-6xl h-[600px] flex items-center justify-center px-4">
                {/* Navigation Buttons */}
                <button
                    onClick={prevSlide}
                    className="absolute left-0 md:left--1 z-50 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronLeft size={64} strokeWidth={1} />
                </button>

                <button
                    onClick={nextSlide}
                    className="absolute right-0 md:right--1 z-50 p-2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronRight size={64} strokeWidth={1} />
                </button>

                {/* Stacked Cards Container */}
                <div className="relative w-full max-w-5xl h-[550px]">
                    {artistData.map((data, index) => {
                        let offset = index - currentIndex;
                        // Handle circular wrapping for stacking effect
                        if (offset < 0) offset += artistData.length;

                        const isCenter = offset === 0;
                        const zIndex = artistData.length - offset;
                        const translateY = offset * 25; // Slightly more vertical separation
                        const scale = isCenter ? 1 : 0.95 - (offset * 0.02);
                        const opacity = isCenter ? 1 : 0.4 - (offset * 0.1);

                        return (
                            <div
                                key={index}
                                className={`absolute inset-0 w-full h-full rounded-[40px] overflow-hidden transition-all duration-700 ease-in-out`}
                                style={{
                                    backgroundColor: data.hexColor,
                                    transform: `translateY(${translateY}px) scale(${scale})`,
                                    zIndex: zIndex,
                                    opacity: Math.max(0, opacity),
                                    pointerEvents: isCenter ? 'auto' : 'none',
                                }}
                            >
                                {/* Card Content Layout */}
                                <div className="relative w-full h-full p-10 md:p-14 flex flex-col text-white font-mono uppercase italic-none">

                                    {/* Vertical Text - Left Side */}
                                    <div className="absolute left-8 top-12 flex flex-col justify-between h-[calc(100%-100px)] pointer-events-none">
                                        <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-xl tracking-[0.2em] font-black">{data.day}</span>
                                        <span className="[writing-mode:vertical-lr] rotate-180 font-jqka text-xl tracking-[0.3em] font-black">{data.tag}</span>
                                    </div>

                                    {/* Top Info Area */}
                                    <div className="ml-20 md:ml-24 mb-6">
                                        <h2 className="text-4xl md:text-5xl font-black font-jqka tracking-tighter mb-1 leading-none">
                                            {data.artist}
                                        </h2>
                                        <p className="text-[10px] md:text-sm max-w-2xl opacity-80 font-jqka font-bold leading-tight tracking-tight">
                                            {data.description}
                                        </p>
                                    </div>

                                    {/* Central Inset Image Area */}
                                    <div className="relative flex-1 mt-2 mb-4 ml-20 md:ml-24 mr-4 md:mr-8 h-[520px] rounded-[25px] overflow-hidden shadow-2xl border border-white/10">
                                        <img
                                            src={data.image}
                                            alt={data.artist}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pagination indicators */}
            <div className="flex gap-4 mt-12">
                {artistData.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-1.5 transition-all duration-500 rounded-full ${i === currentIndex ? 'w-16 bg-white' : 'w-8 bg-white/20 hover:bg-white/40'}`}
                    />
                ))}
            </div>
        </section>
    );
}
