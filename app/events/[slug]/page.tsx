"use client";

import { useParams, notFound } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/ui/Resizable-navbar";
import Footer from "@/components/ui/Footer";
import { EVENT_PAGES } from "./eventcontent";
import EventCards from "./EventCards";
import NavigationPanel from "@/components/ui/NavigationPanel";

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const page = EVENT_PAGES[slug];

  if (!page) return notFound();

  return (
    <main className="bg-black text-white min-h-[100dvh] overflow-x-hidden">

      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>


      {/* TRIANGLE HEADER */}
      <header className="relative w-full h-[55dvh] min-h-[520px]">
        <Image
          src="/images_events/upper.png"
          alt=""
          width={360}
          height={260}
          priority
          className="absolute top-[6%] left-[6%] w-[180px] sm:w-[260px]"
        />
        <Image
          src="/images_events/upper.png"
          alt=""
          width={360}
          height={260}
          priority
          className="absolute top-[32%] left-1/2 -translate-x-1/2 w-[220px] sm:w-[320px]"
        />
        <Image
          src="/images_events/upper.png"
          alt=""
          width={360}
          height={260}
          priority
          className="absolute top-[6%] right-[6%] w-[180px] sm:w-[260px]"
        />
      </header>

      {/* TITLE */}
      <section className="relative -mt-[50px] mb-20 text-center">
        <h1
          className="font-joker lowercase tracking-[0.12em]
                       text-3xl sm:text-5xl lg:text-7xl"
        >
          {page.title}
        </h1>
      </section>

      <EventCards cards={page.cards} />

      <Footer />
    </main>
  );
}
