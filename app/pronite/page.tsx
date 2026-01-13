'use client';

import React from 'react';
import ProniteHero from '@/components/ProniteHero';
import ArtistCarousel from '@/components/ArtistCarousel';
import ProniteGallery from '@/components/ProniteGallery';
import Footer from '@/components/ui/Footer';
import { Navbar, NavbarButton } from '@/components/ui/Resizable-navbar';
import NavigationPanel from '@/components/ui/NavigationPanel';

export default function PronitePage() {
    return (
        <main className="bg-black text-white selection:bg-red-600 selection:text-white">
            <Navbar visible={true}>
                <NavigationPanel />
            </Navbar>

            {/* Hero Section */}
            <ProniteHero />

            {/* Stacked Carousel Section */}
            <section className="bg-black py-20">
                <ArtistCarousel />
            </section>

            {/* Quote Section */}
            <section className="bg-black py-32 px-4 border-y border-white/5">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-[clamp(1.5rem,4vw,3.5rem)] font-jqka font-medium leading-[1.4] uppercase tracking-tight">
                        Synapse is a living celebration of music, art, and creativity, brought to life through performances, people, and passion.
                    </h2>
                </div>
            </section>

            {/* Gallery Section */}
            <ProniteGallery />

            {/* Registration Section */}
            <section className="bg-black py-40 px-4 text-center">
                <h1 className="text-[clamp(3.5rem,15vw,10rem)] font-joker leading-none mb-4 uppercase">
                    Join the <br /> Celebration
                </h1>
                <p className="font-jqka text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
                    One night. Endless energy. Unforgettable memories. <br />
                    A moment you'll wish you were part of.
                </p>

                <div className="flex justify-center">
                    <NavbarButton href="/auth" variant="register">
                        REGISTER
                    </NavbarButton>
                </div>
            </section>

            <Footer />
        </main>
    );
}
