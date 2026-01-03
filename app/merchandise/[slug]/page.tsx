"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const PRODUCTS = [
    {
        slug: "synapse-tee-1",
        name: "Synapse’26 Exclusive Tee",
        price: 500,
        image: "/images/Rectangle 90.png",
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
        image: "/images/Rectangle 91.png",
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
        image: "/images/Rectangle 90-2.png",
        sizes: ["S", "M", "L", "XL",],
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
        image: "/images/Rectangle 91-2.png",
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

    const product = PRODUCTS.find((p) => p.slug === slug);
    if (!product) return null;

    // placeholder thumbnails (same image for now)
    const images = [product.image, product.image, product.image];

    return (
        <div className="w-full bg-black text-white min-h-screen pt-24">
            <Navbar />

            {/* BREADCRUMB */}
            <div className="text-sm px-6 mb-2 flex gap-1 items-center mt-4 gap-2">
                <Link href="/" className="text-white/60 hover:text-red-500 transition-colors">Home</Link>
                <span className="text-red-500">{">"}</span>
                <Link href="/merchandise" className="text-white/60 hover:text-red-500 transition-colors">
                    Merchandise
                </Link>
                <span className="text-red-500">{">"}</span>
                <span className="text-red-500 font-medium">{product.name}</span>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex flex-col md:flex-row gap-16 px-6 md:px-16 mt-8">

                {/* LEFT IMAGE AREA */}
                <div className="flex gap-4 md:w-1/2 justify-center">

                    {/* THUMBNAILS */}
                    <div className="flex flex-col gap-4 mt-1">
                        {images.map((img, i) => {
                            const isActive = activeImage === i;

                            return (
                                <button
                                    key={i}
                                    onClick={() => setActiveImage(i)}
                                    className={`
                    w-16 h-16 p-1
                    border transition-all duration-200
                    ${isActive
                                            ? "border-white opacity-100"
                                            : "border-white/30 opacity-60 hover:opacity-100 hover:border-white"}
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
                    <img
                        src={images[activeImage]}
                        className="w-[300px] md:w-[420px] rounded-sm"
                    />
                </div>

                {/* RIGHT DETAILS */}
                <div className="md:w-1/2 space-y-6">

                    {/* TITLE – JackassWild */}
                    <h1
                        className="text-3xl md:text-4xl leading-tight"
                        style={{ fontFamily: "JackassWild" }}
                    >
                        {product.name}
                    </h1>

                    <p className="text-green-400 text-2xl">₹ {product.price}</p>

                    {/* SIZES */}
                    <div className="flex gap-2">
                        {product.sizes.map((s) => (
                            <div
                                key={s}
                                className="px-3 py-1 border border-white cursor-pointer hover:bg-white hover:text-black transition"
                            >
                                {s}
                            </div>
                        ))}
                    </div>

                    {/* QUANTITY */}
                    <div className="flex items-center gap-3 mt-4">
                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="w-8 h-8 border border-white hover:bg-white hover:text-black transition"
                        >
                            −
                        </button>
                        <span className="w-6 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="w-8 h-8 border border-white hover:bg-white hover:text-black transition"
                        >
                            +
                        </button>
                    </div>

                    {/* BUY BUTTON – JackassWild */}
                    <button
                        className="
    mt-6
    w-full max-w-[280px]
    border border-white
    py-3 text-lg
    hover:bg-white hover:text-black
    transition
    mx-auto md:mx-0
  "
                        style={{ fontFamily: "JackassWild" }}
                    >
                        Buy Now
                    </button>

                    {/* NOTES */}
                    <p className="text-sm text-blue-300">{product.note}</p>

                    {/* FEATURES */}
                    <ul className="text-sm text-white/80 leading-relaxed">
                        {product.features.map((f) => (
                            <li key={f}>- {f}</li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-16">
                <img src="/images/footer.png" className="w-full" />
            </div>
        </div>
    );
}