"use client";

import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import Image from "next/image";

export default function About() {
  return (
    <>
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* MAIN AREA */}
      <main className="w-screen bg-black text-white overflow-x-hidden">
        {/* MAIN CONTENT */}
        <section className="flex flex-col md:flex-row">
          {/* LEFT ART – narrow */}
          <div className="w-full md:w-[30%] hidden md:flex items-end p-10 justify-center md:justify-start">
            <Image
              src="/about-art.png"
              alt="Decorative cards"
              className="h-[90%]"
            />
          </div>

          {/* RIGHT TEXT – zyada width */}
          <div className="w-full lg:w-[70%] flex flex-col justify-center items-start px-6 py-15 md:px-12 lg:py-24 lg:pr-[120px]">
            {/* ABOUT US HEADING (Joker) */}
            {/* Responsive Text: 
            - Mobile: 5xl (Large but fits)
            - Tablet: 7xl
            - Desktop: 140px (Original massive size)
            - Alignment: Center on mobile, Right on desktop 
        */}
            <h1 className="font-joker font-normal text-5xl md:text-8xl xl:text-[140px] leading-none tracking-normal mb-8 w-full text-center lg:text-right">
              about us
            </h1>

            {/* CONTENT (JQKAs Wild) */}
            <div className="font-jqka text-left w-full">
              {/* Wrapper to apply styles to all paragraphs to keep code clean */}
              <div className="space-y-6 text-[#e5e5e5] text-lg md:text-xl lg:text-2xl leading-relaxed lg:leading-[39px] tracking-wide">
                <p>
                  Step into the twisted wonderland of Synapse’26, Gujarat’s most
                  electrifying and unforgettable annual cultural festival!
                  Curated by the bold and brilliant Synapse Committee, this
                  four-day spectacle is where chaos meets creativity and rules
                  are meant to be bent.
                </p>

                <p>
                  From 26th February to 1st March, Synapse’26 unveils The Joker’s Realm — a world where
                  laughter hides secrets, madness fuels art, and unpredictability is
                  the only constant. Expect three explosive concert nights with
                  artists who’ll shake your reality, a riotous stand-up comedy night,
                  and 25+ high-energy events designed to test your talent, nerve, and
                  wit.
                </p>

                <p>
                  This isn’t just a fest — it’s a game of minds and moments.
                  From jaw-dropping performances and immersive experiences to
                  thrilling competitions and surprise twists at every turn, The
                  Joker’s Realm invites you to embrace the beautiful chaos.
                </p>

                <p>
                  Whether you’re a performer craving the spotlight, a strategist
                  chasing victory, or a free spirit seeking unforgettable vibes
                  — Synapse’26 is your wild card.
                </p>

                <p className="text-white mt-8 font-medium">
                  So shuffle the deck, take your chance, and step into the realm
                  where nothing is predictable and everything is legendary.
                  <br className="hidden md:block" />
                  <br className="hidden md:block" />
                  <span className="block mt-4 md:mt-0">
                    Dare to play. Dare to stay. Welcome to Synapse’26. 🔥
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
}
