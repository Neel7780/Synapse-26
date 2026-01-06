"use client";

import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";

export default function About() {
  return (
    <>
      {/* NAVBAR (same as Events page) */}
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      {/* MAIN AREA */}
      <main className="w-screen bg-black text-white overflow-x-hidden">
        {/* MAIN CONTENT */}
        <section className="flex flex-col md:flex-row">
          {/* LEFT ART – narrow */}
          <div className="w-full md:w-[30%] flex items-end p-10 justify-center md:justify-start">
            <img
              src="/about-art.png"
              alt="Decorative cards"
              className="h-[1000px] w-[745px]"
            />
          </div>

          {/* RIGHT TEXT – zyada width */}
          <div className="w-full md:w-[70%] flex flex-col justify-center items-start px-6 py-[60px] md:px-10 md:py-20 lg:pr-[120px]">
            {/* ABOUT US HEADING (Joker) */}
            <h1 className="font-joker font-normal text-[140px] leading-[100%] tracking-normal mb-8 w-full text-right">
              about us
            </h1>

            {/* CONTENT (JQKAs Wild) */}
            <div className="font-jqka text-left w-full">
              <p className="text-[21px] leading-[39px] tracking-[0.04em] text-[#e5e5e5] mb-5">
                Step into the twisted wonderland of Synapse’26, Gujarat’s most
                electrifying and unforgettable annual cultural festival! Curated by
                the bold and brilliant Synapse Committee, this four-day spectacle is
                where chaos meets creativity and rules are meant to be bent.
              </p>

              <p className="text-[21px] leading-[39px] tracking-[0.04em] text-[#e5e5e5] mb-5">
                From [dates], Synapse’26 unveils The Joker’s Realm — a world where
                laughter hides secrets, madness fuels art, and unpredictability is
                the only constant. Expect three explosive concert nights with
                artists who’ll shake your reality, a riotous stand-up comedy night,
                and 25+ high-energy events designed to test your talent, nerve, and
                wit.
              </p>

              <p className="text-[21px] leading-[39px] tracking-[0.04em] text-[#e5e5e5] mb-5">
                This isn’t just a fest — it’s a game of minds and moments. From
                jaw-dropping performances and immersive experiences to thrilling
                competitions and surprise twists at every turn, The Joker’s Realm
                invites you to embrace the beautiful chaos.
              </p>

              <p className="text-[21px] leading-[39px] tracking-[0.04em] text-[#e5e5e5] mb-5">
                Whether you’re a performer craving the spotlight, a strategist
                chasing victory, or a free spirit seeking unforgettable vibes —
                Synapse’26 is your wild card.
              </p>

              <p className="text-[21px] leading-[39px] tracking-[0.04em] text-white mt-6 font-medium mb-0">
                So shuffle the deck, take your chance, and step into the realm where
                nothing is predictable and everything is legendary.
                <br />
                <br />
                Dare to play. Dare to stay. Welcome to Synapse’26. 🔥
              </p>
            </div>
          </div>
        </section>
        {/* FOOTER (same as Events page) */}
        <Footer />
      </main>
    </>
  );
}
