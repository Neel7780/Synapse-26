"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { memo, useMemo } from "react";

type Product = {
  slug: string;
  name: string;
  price: number;
  thumbnail: string;
};

const PRODUCTS: Product[] = [
  {
    slug: "synapse-tee-1",
    name: "Synapse Exclusive Tee",
    price: 400,
    thumbnail: "/images_merch/Tshirt.jpeg",
  },
];

// Memoized product card component
const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const [firstWord, ...restWords] = product.name.split(" ");
  
  return (
    <div className="flex flex-col items-center w-full max-w-[280px]">
      {/* IMAGE */}
      <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden">
        <Image
          src={product.thumbnail}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 280px, 280px"
          className="object-cover"
          loading="lazy"
        />
      </div>

      {/* NAME + PRICE */}
      <div className="w-full flex justify-between items-start mt-3 px-1">
        <p className="text-white/90 text-lg sm:text-xl leading-snug w-[70%] font-jqka">
          {firstWord}&apos;26 <br />
          {restWords.join(" ")}
        </p>

        <p className="text-white text-lg sm:text-xl font-jqka">
          ₹ {product.price}
        </p>
      </div>

      {/* BUY NOW */}
      <Link 
        href={`/merchandise/${product.slug}`} 
        className="w-full mt-4"
        prefetch={false}
      >
        <button
          className="
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
  );
});

export default function MerchPage() {
  const gridClasses = useMemo(() => {
    const len = PRODUCTS.length;
    if (len === 1) return "grid-cols-1 place-items-center";
    if (len === 2) return "grid-cols-1 sm:grid-cols-2";
    if (len === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }, []);

  return (
    <div className="w-full bg-black text-white min-h-[100dvh]">
      {/* HERO */}
      <div className="relative w-full h-[clamp(320px,55dvh,520px)] overflow-hidden">
        <Navbar visible={true}>
          <NavigationPanel />
        </Navbar>

        <Image
          src="/images_merch/merch-her.png"
          alt="Merchandise collection"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95" />

        <div className="absolute z-30 left-[6%] bottom-[12%] w-[clamp(140px,35vw,520px)] h-auto">
          <Image
            src="/images_merch/Group 27.png"
            alt="Wear the Realm"
            width={520}
            height={200}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>

      {/* MERCH TITLE */}
      <div className="w-full flex justify-center mt-10 md:mt-14 mb-16">
        <Image
          src="/images_merch/MERCH.png"
          alt="MERCHANDISE"
          width={640}
          height={200}
          className="w-[clamp(220px,55vw,640px)] h-auto"
          loading="lazy"
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
          ${gridClasses}
        `}
      >
        {PRODUCTS.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
