"use client";

import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function MerchPage() {
  const products = [
    {
      slug: "synapse-tee-1",
      name: "Synapse Exclusive Tee",
      price: 500,
      thumbnail: "/images/Rectangle 90.png",
    },
    {
      slug: "synapse-tee-2",
      name: "Synapse Exclusive Tee",
      price: 500,
      thumbnail: "/images/Rectangle 91.png",
    },
    {
      slug: "synapse-tee-3",
      name: "Synapse Exclusive Tee",
      price: 500,
      thumbnail: "/images/Rectangle 90-2.png",
    },
    {
      slug: "synapse-tee-4",
      name: "Synapse Exclusive Tee",
      price: 500,
      thumbnail: "/images/Rectangle 91-2.png",
    },
  ];

  return (
    <div className="w-full bg-black text-white min-h-screen">

      {/* HERO */}
      <div className="relative w-full h-[460px] md:h-[520px] overflow-hidden">
        <Navbar />

        <img
          src="/images/merch-her.png"
          className="absolute top-0 left-0 w-full h-full object-cover object-center"
          alt="Merch Hero"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95" />

        <img
          src="/images/group 27.png"
          alt="Wear the Realm"
          className="absolute z-30 left-[6%] bottom-[18%] w-[180px] md:w-[500px] h-auto"
        />
      </div>

      {/* MERCH TITLE */}
      <div className="w-full flex justify-center mt-10 md:mt-14 mb-25">
        <img
          src="/images/MERCH.png"
          className="w-[clamp(260px,60vw,640px)]"
          alt="MERCHANDISE"
        />
      </div>

      {/* PRODUCT GRID */}
      <div className="w-full px-6 mt-12 md:mt-16 grid grid-cols-2 gap-y-14 gap-x-6 justify-items-center">

        {products.map((product, i) => (
          <div
            key={i}
            className="flex flex-col items-center"
          >
            {/* IMAGE */}
            <img
              src={product.thumbnail}
              className="w-[150px] md:w-[200px] rounded-sm object-cover"
              alt={product.name}
            />

            {/* NAME + PRICE */}
            <div className="w-full flex justify-between items-start mt-3 px-1">
              <p
                className="text-white/90 text-[12px] leading-tight w-[70%]"
                style={{ fontFamily: "JackassWild" }}
              >
                {product.name.split(" ").slice(0, 1).join(" ")}’26 <br />
                {product.name.split(" ").slice(1).join(" ")}
              </p>

              <p className="text-white text-[12px] font-semibold">
                ₹ {product.price}
              </p>
            </div>

            {/* BUY NOW — ONLY THIS NAVIGATES */}
            <Link href={`/merchandise/${product.slug}`}>
              <button
                className="
                  mt-4 w-[170px] md:w-[200px]
                  border border-white 
                  py-2 rounded-sm text-[13px]
                  hover:bg-white hover:text-black
                  transition-all duration-200
                "
                style={{ fontFamily: "JackassWild" }}
              >
                Buy Now
              </button>
            </Link>
          </div>
        ))}

      </div>

      {/* FOOTER */}
      <div className="mt-20">
        <Footer />
      </div>
    </div>
  );
}