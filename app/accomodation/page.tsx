"use client";

import React from "react";
import { AccommodationComponent } from "@/components/Accomodation";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Image from "next/image";


export default function AccomodationPage() {
  // Manual transition end moved to global TransitionProvider
  // const { endTransition } = useNavigationState();
  // useEffect(() => { endTransition(); }, []);
  return (
    <div>
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      <header className="relative flex flex-row items-center justify-between w-full overflow-x-clip overflow-y-visible mb-20 px-2">
        {/* LEFT IMAGE */}
        <Image
          src="/accomodation-top.png"
          alt=""
          width={360}
          height={260}
          priority
          className="
            relative
            w-[110px] min-[435px]:w-[140px] sm:w-[190px] md:w-[260px] lg:w-[320px]
            translate-x-1/4 -translate-y-1/2
            transition-all duration-300 ease-out
        "
          sizes="(max-width: 425px) 90px, (max-width: 640px) 140px, (max-width: 1024px) 260px, 320px"
        />

        {/* CENTER IMAGE */}
        <Image
          src="/accomodation-top.png"
          alt=""
          width={360}
          height={260}
          priority
          className="
            relative
            w-[130px] min-[435px]:w-[170px] sm:w-[240px] md:w-[320px] lg:w-[350px]
            translate-y-1/4
            transition-all duration-300 ease-out
        "
          sizes="(max-width: 425px) 110px, (max-width: 640px) 170px, (max-width: 1024px) 320px, 350px"
        />

        {/* RIGHT IMAGE */}
        <Image
          src="/accomodation-top.png"
          alt=""
          width={360}
          height={260}
          priority
          className="
            relative
            w-[110px] min-[435px]:w-[140px] sm:w-[190px] md:w-[260px] lg:w-[320px]
            -translate-x-1/4 -translate-y-1/3
            transition-all duration-300 ease-out
        "
          sizes="(max-width: 425px) 90px, (max-width: 640px) 140px, (max-width: 1024px) 260px, 320px"
        />
      </header>

      <AccommodationComponent />
      <Footer />
    </div>
  );
}
