'use client';

import React from 'react';

export default function ProniteHero() {
    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
            {/* Background Image Placeholder or Gradient */}
            <div
                className="absolute inset-0 z-0 opacity-60"
                style={{
                    backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url("/pronitemain.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                <h1 className="text-[clamp(3rem,12vw,8rem)] font-jqka leading-none mb-4 tracking-tighter">
                    artists who <br /> own the night
                </h1>
                <p className="text-[clamp(0.8rem,2vw,1.2rem)] font-jqka text-gray-300 tracking-[0.2em]">
                    Three nights. One stage. Infinite energy.
                </p>
            </div>

            {/* Decorative elements if any */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
                <span className="text-2xl">↓</span>
            </div>
        </section>
    );
}
