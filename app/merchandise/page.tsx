"use client";

import Link from "next/link";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { memo, useMemo, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigationState } from "@/lib/useNavigationState";


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
  const { startTransition } = useNavigationState();

  const handleLinkClick = () => {
    startTransition();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* WRAPPER LINK FOR IMAGE */}
      <Link
        href={`/merchandise/${product.slug}`}
        className="block w-full"
        prefetch={false}
        onClick={handleLinkClick}
      >
        <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden group">
          <Image
            src={product.thumbnail}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      </Link>

      {/* NAME + PRICE */}
      <div className="w-full flex justify-between items-start mt-4 px-1">
        <Link
          href={`/merchandise/${product.slug}`}
          onClick={handleLinkClick}
          className="w-[70%]"
        >
          <p className="text-white/90 text-xl sm:text-2xl leading-snug font-jqka hover:text-red-500 transition-colors">
            {firstWord}&apos;26 <br />
            {restWords.join(" ")}
          </p>
        </Link>

        <p className="text-white text-xl sm:text-2xl font-jqka">
          ₹ {product.price}
        </p>
      </div>

      {/* BUY NOW */}
      <Link
        href={`/merchandise/${product.slug}`}
        className="w-full mt-5"
        prefetch={false}
        onClick={handleLinkClick}
      >
        <button
          className="
            w-full cursor-pointer
            border border-white
            py-3 md:py-3.5
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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Title Animation
      gsap.fromTo(".merch-title",
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: "back.out(1.5)"
        }
      );

      // Hero Text/Decorations
      gsap.fromTo(".hero-decor",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.5,
          ease: "power2.out"
        }
      );

      // Product Grid Animation
      gsap.fromTo(".product-item",
        {
          opacity: 0,
          y: 50,
          scale: 0.9
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".product-grid",
            start: "top 85%",
          }
        }
      );

    }, containerRef);

    return () => ctx.revert();
  }, []);

  const gridClasses = useMemo(() => {
    // ... (existing logic)
    const len = PRODUCTS.length;
    if (len === 1) return "grid-cols-1 place-items-center";
    if (len === 2) return "grid-cols-1 sm:grid-cols-2";
    if (len === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-black text-white min-h-[100dvh]">
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

        <div className="hero-decor absolute z-30 left-[6%] bottom-[12%] w-[clamp(140px,35vw,520px)] h-auto opacity-0">
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
        <div className="merch-title opacity-0">
          <Image
            src="/images_merch/MERCH.png"
            alt="MERCHANDISE"
            width={640}
            height={200}
            className="w-[clamp(220px,55vw,640px)] h-auto"
            loading="lazy"
          />
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div
        className={`
          product-grid
          w-full px-4 sm:px-10 lg:px-20
          grid
          gap-y-16
          gap-x-8
          justify-items-center
          mb-32
          ${gridClasses}
        `}
      >
        {PRODUCTS.map((product) => (
          <div key={product.slug} className="product-item opacity-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      <Footer />
    </div>
  );
}
