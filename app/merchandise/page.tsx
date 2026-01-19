"use client";

import Link from "next/link";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";

import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect } from "react";

export default function MerchPage() {
  const { startTransition } = useNavigationState();

  const products = [
    {
      slug: "synapse-tee-1",
      name: "Synapse Exclusive Tee",
      price: 400,
      thumbnail: "/images_merch/Tshirt.jpeg",
    },
  ];

  return (
    <div className="w-full bg-black text-white min-h-[100dvh]">

      {/* HERO */}
      <div className="relative w-full h-[clamp(320px,55dvh,520px)] overflow-hidden">
        <Navbar visible={true}>
          <NavigationPanel />
        </Navbar>

        <img
          src="/images_merch/merch-her.png"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Merch Hero"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95" />

        <img
          src="/images_merch/Group 27.png"
          alt="Wear the Realm"
          className="
      absolute z-30
      left-[6%] bottom-[12%]
      w-[clamp(140px,35vw,520px)]
      h-auto
    "
        />
      </div>

      {/* MERCH TITLE */}
      <div className="w-full flex justify-center mt-10 md:mt-14 mb-16">
        <img
          src="/images_merch/MERCH.png"
          className="w-[clamp(220px,55vw,640px)]"
          alt="MERCHANDISE"
        />
      </div>

      {/* PRODUCT GRID */}
      <div
        className={`
    w-full px-4 sm:px-6 md:px-10
    grid
    gap-y-14
    gap-x-6
    justify-items-center
    mb-28
    ${products.length === 1
            ? "grid-cols-1 place-items-center"
            : products.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : products.length === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }
  `}
      >
        {products.map((product, i) => (
          <div
            key={i}
            className="flex flex-col items-center w-full max-w-[280px]"
          >
            {/* IMAGE */}
            <img
              src={product.thumbnail}
              className="
      w-full
      aspect-[3/4]
      object-cover
      rounded-sm
    "
              alt={product.name}
            />

            {/* NAME + PRICE */}
            <div className="w-full flex justify-between items-start mt-3 px-1">
              <p
                className="
        text-white/90
         text-lg sm:text-xl
        leading-snug
        w-[70%]
        font-jqka
      "
              >
                {product.name.split(" ").slice(0, 1).join(" ")}'26 <br />
                {product.name.split(" ").slice(1).join(" ")}
              </p>

              <p
                className="
        text-white
        text-lg sm:text-xl
        font-jqka
      "
              >
                ₹ {product.price}
              </p>
            </div>

            {/* BUY NOW */}
            <Link href={`/merchandise/${product.slug}`} className="w-full" onClick={() => startTransition()}>
              <button
                className="
        mt-4
        w-full cursor-pointer
        border border-white
        py-2.5 md:py-3
        rounded-sm
        text-xl sm:text-2xl
        tracking-wide
        font-jqka
        hover:bg-white hover:text-black
        transition-all duration-200
      "
              >
                Buy Now
              </button>
            </Link>
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}