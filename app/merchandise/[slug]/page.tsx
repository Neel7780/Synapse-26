"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";

const PRODUCTS = [
  {
    slug: "synapse-tee-1",
    name: "Synapse’26 Exclusive Tee",
    price: 500,
    image: "/images_merch/Rectangle 90.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    note: "* Merch should be collected from the help desk on the day of fest.",
    features: [
      "100% Preshrunk Cotton",
      "6.0 OZ. Garment Dyed-Fabric",
      "Relaxed Unisex T-shirt",
      "Screen Printed",
    ],
  },
  {
    slug: "synapse-tee-2",
    name: "Synapse’26 Exclusive Hoodie",
    price: 500,
    image: "/images_merch/Rectangle 91.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    note: "* Merch should be collected from the help desk on the day of fest.",
    features: [
      "100% Preshrunk Cotton",
      "6.0 OZ. Garment Dyed-Fabric",
      "Relaxed Unisex T-shirt",
      "Screen Printed",
    ],
  },
  {
    slug: "synapse-tee-3",
    name: "Synapse’26 Exclusive Cap",
    price: 500,
    image: "/images_merch/Rectangle 90-2.png",
    sizes: ["S", "M", "L", "XL"],
    note: "* Merch should be collected from the help desk on the day of fest.",
    features: [
      "100% Preshrunk Cotton",
      "6.0 OZ. Garment Dyed-Fabric",
      "Relaxed Unisex T-shirt",
      "Screen Printed",
    ],
  },
  {
    slug: "synapse-tee-4",
    name: "Synapse’26 Exclusive Tee",
    price: 500,
    image: "/images_merch/Rectangle 91-2.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    note: "* Merch should be collected from the help desk on the day of fest.",
    features: [
      "100% Preshrunk Cotton",
      "6.0 OZ. Garment Dyed-Fabric",
      "Relaxed Unisex T-shirt",
      "Screen Printed",
    ],
  },
];

export default function ProductPage() {
  const { slug } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const product = PRODUCTS.find((p) => p.slug === slug);
  if (!product) return null;

  // placeholder thumbnails (same image for now)
  const images = [product.image, product.image, product.image];

    return (
        <div className="w-full bg-black text-white min-h-[100dvh] pt-20">

      {/* BREADCRUMB */}
      <div className="text-sm px-4 md:px-6 mb-4 flex items-center gap-2 flex-wrap">
        <Link
          href="/"
          className="text-white/60 hover:text-red-500 transition-colors font-Inter"
        >
          Home
        </Link>
        <span className="text-red-500 font-Inter">{">"}</span>
        <Link
          href="/merchandise"
          className="text-white/60 hover:text-red-500 transition-colors font-Inter"
        >
          Merchandise
        </Link>
        <span className="text-red-500 font-Inter">{">"}</span>
        <span className="text-red-500 font-Inter break-all line-clamp-1">
          {product.name}
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-col lg:flex-row gap-10 md:gap-16 px-4 md:px-16 mt-4 md:mt-8 mb-12">
        {/* LEFT IMAGE AREA */}
        {/* Mobile: Image Top, Thumbnails Bottom (Horizontal) */}
        {/* Desktop: Thumbnails Left, Image Right (Vertical) */}
        <div className="flex flex-col md:flex-row gap-6 lg:w-1/2 items-center justify-center md:items-start">
          {/* THUMBNAILS CONTAINER */}
          {/* Order 2 on Mobile (Bottom), Order 1 on Desktop (Left) */}
          <div
            className="
        order-2 md:order-1 
        flex flex-row md:flex-col 
        gap-3 md:gap-4 
        w-full md:w-auto 
        justify-center 
        overflow-x-auto md:overflow-visible 
        pb-2 md:pb-0 
        scrollbar-hide
    "
          >
            {images.map((img, i) => {
              const isActive = activeImage === i;
              return (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`
                        flex-shrink-0
                        w-14 h-14 md:w-16 md:h-16 p-1
                        border rounded-md overflow-hidden transition-all duration-200
                        ${
                          isActive
                            ? "border-white opacity-100 ring-1 ring-white/50"
                            : "border-white/20 opacity-60 hover:opacity-100 hover:border-white/50"
                        }
                    `}
                >
                  <img
                    src={img}
                    className="w-full h-full object-cover"
                    alt={`Thumbnail ${i + 1}`}
                  />
                </button>
              );
            })}
          </div>

          {/* MAIN IMAGE */}
          {/* Order 1 on Mobile (Top), Order 2 on Desktop (Right) */}
          <div className="order-1 md:order-2 w-full flex justify-center">
            {/* Sizing Constraints:
            - max-w-[350px]: Keeps it contained on mobile
            - md:max-w-[450px]: Allows growth on tablet/desktop
            - aspect-[4/5]: consistent merchandise shape
        */}
            <div className="relative w-full max-w-[350px] md:max-w-[450px] aspect-[4/5] bg-white/5 rounded-lg overflow-hidden border border-white/10 shadow-2xl mx-auto">
              <img
                src={images[activeImage]}
                className="w-full h-full object-cover"
                alt="Main Product"
              />
            </div>
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div className="w-full lg:w-1/2 space-y-6">
          {/* TITLE & PRICE */}
          <div>
            <h1 className="text-3xl md:text-5xl leading-tight font-jqka mb-2">
              {product.name}
            </h1>
            <p className="text-green-400 text-2xl md:text-3xl font-medium">
              ₹ {product.price}
            </p>
          </div>

          {/* SIZES */}
          <div>
            <p className="text-sm text-white/60 mb-2 font-Inter uppercase tracking-wider">
              Select Size
            </p>
            <div className="flex gap-3 flex-wrap">
              {product.sizes.map((s) => {
                const isSelected = selectedSize === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`
                                    px-4 py-2 border cursor-pointer transition-all duration-200 min-w-[3rem]
                                    ${
                                      isSelected
                                        ? "bg-white text-black border-white"
                                        : "border-white/30 text-white hover:border-white"
                                    }
                                `}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUANTITY */}
          <div>
            <p className="text-sm text-white/60 mb-2 font-Inter uppercase tracking-wider">
              Quantity
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 border border-white/30 hover:border-white hover:bg-white hover:text-black transition flex items-center justify-center text-xl"
              >
                −
              </button>
              <span className="w-8 text-center text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 border border-white/30 hover:border-white hover:bg-white hover:text-black transition flex items-center justify-center text-xl"
              >
                +
              </button>
            </div>
          </div>

          {/* BUY BUTTON */}
          <button
            className="
                    mt-8
                    w-full sm:max-w-[280px]
                    border border-white
                    py-4 text-2xl
                    font-jqka
                    bg-white text-black md:bg-transparent md:text-white
                    md:hover:bg-white md:hover:text-black
                    transition-all duration-300
                    cursor-pointer
                "
            onClick={() => {
              alert("Payment Gateway yet not connected");
            }}
          >
            Buy Now
          </button>

          {/* DIVIDER */}
          <div className="w-full h-[1px] bg-white/10 my-6"></div>

          {/* NOTES & FEATURES */}
          <div className="space-y-4">
            {product.note && (
              <p className="text-sm text-blue-300 bg-blue-500/10 p-3 rounded border border-blue-500/20 inline-block">
                Note: {product.note}
              </p>
            )}

            <div>
              <h3 className="text-white font-Inter mb-2 uppercase tracking-wider text-sm">
                Product Details
              </h3>
              <ul className="text-sm md:text-base text-white/70 leading-relaxed space-y-1">
                {product.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-white/30">•</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
