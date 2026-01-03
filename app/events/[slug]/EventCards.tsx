"use client";

import { useState } from "react";
import Image from "next/image";
import type { EventCard } from "./eventcontent";

export default function EventCards({ cards }: { cards: EventCard[] }) {
    const [active, setActive] = useState<EventCard | null>(null);

    return (
        <>
            {/* EVENTS GRID */}
            <section className="px-4 sm:px-10 lg:px-24  pb-32">
                <div className="flex justify-center gap-10 flex-wrap">
                    {cards.map((card, idx) => (
                        <article
                            key={idx}
                            className="bg-[#111] w-[500px] rounded-sm overflow-hidden flex flex-col"
                        >
                            {/* IMAGE */}
                            <div className="relative h-[320px]">
                                <Image
                                    src={card.image}
                                    alt={card.name}
                                    fill
                                    sizes="(max-width: 640px) 100vw, 500px"
                                    className="object-cover"
                                />
                            </div>

                            {/* CONTENT */}
                            <div className="p-5 flex flex-col gap-3 flex-1">
                                <h2 className="font-adventor text-[40px] leading-tight">
                                    {card.name}
                                </h2>

                                <p className="text-sm text-[#c0c0c0] leading-relaxed">
                                    {card.description.map((line, i) => (
                                        <span key={i} className="block">{line}</span>
                                    ))}
                                </p>
                            </div>

                            {/* FOOTER */}
                            <div className="p-5 pt-0">
                                <button
                                    onClick={() => setActive(card)}
                                    className="
                    w-full h-[52px]
                    bg-white text-black
                    flex items-center justify-center gap-2
                    hover:bg-[#b41c32] hover:text-white
                    transition-all duration-150 rounded-sm cursor-pointer
                  "
                                >
                                    Register
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* MODAL (EXACT ORIGINAL BEHAVIOR) */}
            {active && (
                <div
                    className="fixed inset-0 bg-black/70 z-[1000]
                     flex items-center justify-center"
                    onClick={() => setActive(null)}
                >
                    <div
                        className="bg-[#111] text-white p-6 rounded-md
                       w-[90%] max-w-[480px] relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CLOSE */}
                        <button
                            onClick={() => setActive(null)}
                            className="absolute top-3 right-4 text-xl cursor-pointer"
                        >
                            ×
                        </button>

                        {/* TITLE */}
                        <h2 className="font-adventor text-[28px] mb-2">
                            {active.name}
                        </h2>

                        {/* PRICE */}
                        <p className="text-[#c0c0c0] mb-3">
                            {active.price}
                        </p>

                        {/* RULES */}
                        <ul className="list-disc pl-5 text-sm mb-6 space-y-1">
                            {active.rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>

                        {/* ACTIONS */}
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 border border-white/30 rounded"
                                onClick={() => setActive(null)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 bg-[#b41c32] rounded cursor-pointer"
                                onClick={() => {
                                    alert("Payment Gateway to be integrated");
                                    setActive(null);
                                }}
                            >
                                Proceed to Pay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
