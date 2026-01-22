"use client";

import Image from "next/image";
import Footer from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Product = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  description: string;
};

const PRODUCTS: Product[] = [
  {
    slug: "synapse-tee-1",
    name: "Synapse Exclusive Tee",
    price: 499,
    images: ["/images_merch/Tshirt.jpeg", "/images_merch/Tshirt2.jpeg"],
    description: "Premium high-quality cotton tee featuring the limited edition Synapse '26 graphics. Designed for comfort and style in the realm of DA-IICT."
  },
  {
    slug: "synapse-tee-2",
    name: "Synapse Signature Tee",
    price: 449,
    images: ["/images_merch/Tshirt2.jpeg", "/images_merch/Tshirt.jpeg"],
    description: "Experience the vibe with our Signature collection. Minimalist design with a focus on premium fabric and long-lasting durability."
  },
];

const ProductSection = ({ product }: { product: Product }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setActiveIdx((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setActiveIdx((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(".product-visuals", {
        opacity: 0,
        x: -50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      });

      gsap.from(".product-info", {
        opacity: 0,
        x: 50,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className="showcase-section max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 mb-32 lg:mb-48">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">

        {/* LEFT: MAIN IMAGE + THUMBNAILS + NAVIGATION */}
        <div className="product-visuals w-full lg:w-[42%] space-y-5">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl group">
            <Image
              key={product.images[activeIdx]}
              src={product.images[activeIdx]}
              alt={`${product.name} view ${activeIdx + 1}`}
              fill
              className="object-cover transition-all duration-700 hover:scale-105"
              priority
            />

            {/* NAVIGATION BUTTONS */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/40 border border-white/10 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* THUMBNAILS */}
          {product.images.length > 1 && (
            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start">
              {product.images.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveIdx(i)}
                  className={`relative w-16 sm:w-20 aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all duration-300 ${activeIdx === i ? 'border-red-600 scale-105 shadow-[0_0_12px_rgba(220,38,38,0.4)]' : 'border-transparent opacity-40 hover:opacity-100 hover:border-white/20'}`}
                >
                  <Image src={img} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: DETAILS */}
        <div className="product-info w-full lg:w-[58%] space-y-8 pt-2">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-jqka tracking-tight text-white leading-tight uppercase">
              {product.name}
            </h2>
            <div className="h-1 w-20 bg-red-600 rounded-full" />
          </div>

          <div className="space-y-6">
            <div className="flex items-baseline gap-4">
              <p className="text-4xl font-jqka text-red-500">₹ {product.price}</p>
              <p className="text-white/20 line-through text-lg italic">₹ {product.price + 200}</p>
            </div>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed font-light">
              {product.description}
            </p>
          </div>

          {/* SPECIFICATIONS */}
          <div className="space-y-5 pt-6 border-t border-white/5">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30 font-black">Technical Specs</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-white/70">
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span className="text-sm">Premium 180 GSM Cotton</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span className="text-sm">Eco-Friendly Silk Screen</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span className="text-sm">Pre-Shrunk Material</span>
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                <span className="text-sm">Oversized Fit Aesthetic</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button className="group relative w-full overflow-hidden bg-white/90 hover:bg-white px-8 py-4 rounded-xl transition-all active:scale-[0.98]">
              <span className="relative z-10 text-black font-bold text-lg tracking-[0.2em] uppercase transition-colors">
                To be Purchased from <br />Desk on day of Event
              </span>
              <div className="absolute inset-0 bg-red-600 transform translate-y-full transition-transform duration-300 group-hover:translate-y-0" />
            </button>
            <p className="text-white/20 text-center mt-3 text-[10px] tracking-[0.3em] uppercase">Limited quantity Drop '26</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MerchPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Title Animation
      gsap.fromTo(".merch-title",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.5)" }
      );

      // Hero Text/Decorations
      gsap.fromTo(".hero-decor",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.5, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full bg-black text-white min-h-[100dvh]">
      {/* HERO SECTION */}
      <div className="relative w-full h-[clamp(320px,50dvh,480px)] overflow-hidden">
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

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />

        <div className="hero-decor absolute z-30 left-[6%] bottom-[12%] w-[clamp(140px,35vw,520px)] h-auto">
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

      {/* MERCH TITLE IMAGE */}
      <div className="w-full flex justify-center mt-12 mb-24">
        <div className="merch-title">
          <Image
            src="/images_merch/MERCH.png"
            alt="MERCHANDISE"
            width={640}
            height={200}
            className="w-[clamp(200px,50vw,580px)] h-auto"
            loading="lazy"
          />
        </div>
      </div>

      {/* ALL PRODUCTS LISTED VERTICALLY */}
      <div className="pb-24">
        {PRODUCTS.map((product) => (
          <ProductSection key={product.slug} product={product} />
        ))}
      </div>

      <Footer />
    </div>
  );
}
