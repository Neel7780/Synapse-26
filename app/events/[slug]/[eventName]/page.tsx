"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNavigationState } from "@/lib/useNavigationState";
import Image from "next/image";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { EVENT_PAGES, EventCard } from "../eventcontent";

export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    // derived synchronously
    const slug = params?.slug as string;
    const eventNameSlug = params?.eventName as string;

    // Manual Transition Control moved to global provider
    // const { endTransition } = useNavigationState();

    // useEffect(() => {
    //     endTransition();
    // }, []);

    // Direct lookup
    let event: EventCard | null = null;
    let error: string | null = null;

    if (slug && eventNameSlug) {
        const categoryData = EVENT_PAGES[slug];
        if (!categoryData) {
            error = "Category not found.";
        } else {
            const foundEvent = categoryData.cards.find(card =>
                card.name.toLowerCase().replace(/\s+/g, "-") === eventNameSlug
            );
            if (!foundEvent) {
                error = "Event not found.";
            } else {
                event = foundEvent;
            }
        }
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-joker">
                <h1 className="text-4xl text-red-500 mb-4">Error</h1>
                <p className="text-xl font-poppins">{error || "Event not found"}</p>
                <Button onClick={() => router.back()} className="mt-6">
                    Go Back
                </Button>
            </div>
        );
    }

    return (
        <main className="bg-black text-white min-h-screen overflow-x-hidden font-poppins">
            <Navbar visible={true}>
                <NavigationPanel />
            </Navbar>

            {/* HEADER IMAGE / BACKGROUND */}
            <div className="relative w-full h-[60dvh] flex items-center justify-center">
                <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="relative z-10 text-center px-4 mt-10">
                    <h1 className="font-joker lowercase text-5xl md:text-7xl lg:text-9xl tracking-wider text-white mb-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] animate-fadeIn">
                        {event.name}
                    </h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">

                {/* LEFT COLUMN: DESCRIPTION & DETAILS */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-4xl font-poppins mb-6 text-[#b41c32] tracking-wide">
                            About Event
                        </h2>
                        <div className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap font-poppins">
                            {event.description.map((line, i) => (
                                <p key={i} className="mb-3">{line}</p>
                            ))}
                        </div>
                    </section>

                    {/* RULES SECTION */}
                    <section>
                        <h2 className="text-4xl font-poppins mb-6 text-[#b41c32] tracking-wide">
                            Rules
                        </h2>
                        <ul className="list-disc pl-5 text-gray-300 space-y-3 mb-8 text-lg">
                            {event.rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>

                        {event.rulebook && (
                            <a
                                href={event.rulebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/20 rounded-sm transition-all text-white font-jqka cursor-pointer tracking-widest uppercase text-sm hover:border-[#b41c32] group"
                            >
                                <span>View Rulebook</span>
                                <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </a>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: REGISTRATION CARD */}
                <div className="lg:col-span-1">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-8 sticky top-24 shadow-2xl shadow-black/50">
                        <h3 className="text-3xl font-poppins mb-8 text-center tracking-wide">
                            Registration
                        </h3>

                        <div className="space-y-8 mb-6">
                            {event.fees && event.fees.length > 0 ? (
                                event.fees.map((fee, index) => (
                                    <div key={index} className="flex flex-col border border-white/10 rounded-lg p-5 bg-white/5 hover:bg-white/[0.07] transition-colors">
                                        <div className="flex justify-between items-baseline mb-2">
                                            <span className="capitalize font-bold text-gray-200 text-lg font-poppins tracking-wide">
                                                {fee.type}
                                            </span>
                                            <span className="text-2xl font-bold text-[#b41c32] font-poppins">₹{fee.price}</span>
                                        </div>

                                        {/* Min/Max Logic: Only show for Group (or non-solo/non-duet) */}
                                        {fee.type !== 'solo' && fee.type !== 'duet' && (
                                            <div className="text-sm text-gray-400 mb-4">
                                                Team Size: <span className="text-gray-200">{fee.min_members}-{fee.max_members}</span> members
                                            </div>
                                        )}

                                        <Button
                                            className="w-full mt-2 py-3 text-lg font-jqka tracking-widest uppercase bg-[#b41c32] hover:bg-[#901628] transition-all cursor-pointer rounded-sm shadow-[0_0_15px_rgba(180,28,50,0.3)] hover:shadow-[0_0_25px_rgba(180,28,50,0.5)]"
                                            onClick={() => {
                                                const params = new URLSearchParams({
                                                    fee_id: String(fee.fee_id || 0),
                                                    type: fee.type,
                                                    price: String(fee.price),
                                                    min: String(fee.min_members || 1),
                                                    max: String(fee.max_members || 1),
                                                    qr_url: fee.qr_url || "",
                                                    event_id: String(fee.event_id || 0),
                                                });
                                                router.push(`/events/${slug}/${eventNameSlug}/register?${params.toString()}`);
                                            }}
                                        >
                                            Register
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                // Fallback if fees array missing
                                <div className="text-center">
                                    <div className="text-gray-400 font-jqka text-xl mb-4">{event.price}</div>
                                    <Button
                                        className="w-full py-4 text-xl font-jqka tracking-widest uppercase bg-[#b41c32] hover:bg-[#901628] transition-all cursor-pointer rounded-sm shadow-[0_0_20px_rgba(180,28,50,0.3)]"
                                        onClick={() => alert("Registration Coming Soon!")}
                                    >
                                        Register Now
                                    </Button>
                                </div>
                            )}
                        </div>

                        <p className="text-[10px] text-center text-gray-600 mt-6 uppercase tracking-wider font-mono">
                            * Non-refundable registration fee
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
