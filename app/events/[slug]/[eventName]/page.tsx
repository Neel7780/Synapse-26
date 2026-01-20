"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { EVENT_PAGES, EventCard } from "../eventcontent";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function EventPage() {
    const params = useParams();
    const router = useRouter();

    // derived synchronously
    const slug = params?.slug as string;
    const eventNameSlug = params?.eventName as string;

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

    // State for selected fee type (default to first available)
    const [selectedFeeIndex, setSelectedFeeIndex] = useState(0);

    // Initial check (if event exists but logic needs to run once)
    useEffect(() => {
        if (event && event.fees && event.fees.length > 0) {
            // Sort fees logic: Solo -> Duet -> Group
            const order = ["solo", "duet", "group"];
            event.fees.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
            setSelectedFeeIndex(0);
        }
    }, [event]);


    if (error || !event) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-joker">
                <h1 className="text-4xl text-red-600 mb-4">Error</h1>
                <p className="text-xl font-roboto">{error || "Event not found"}</p>
                <Button onClick={() => router.back()} className="mt-6 rounded-none font-jqka bg-red-600 hover:bg-red-700">
                    Go Back
                </Button>
            </div>
        );
    }

    const currentFee = event.fees && event.fees.length > 0 ? event.fees[selectedFeeIndex] : null;

    // Fake metadata since it's missing from content
    const eventDate = "26th Feb, 2026";
    const eventTime = "10:00 PM";
    const eventVenue = "OAT";

    return (
        <main className="bg-black text-white min-h-screen overflow-x-hidden font-roboto">
            <Navbar visible={true}>
                <NavigationPanel />
            </Navbar>

            {/* HERO SECTION */}
            <div className="relative w-full pb-10 flex flex-col items-center group">
                {/* Image Container */}
                <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden">
                    <Image
                        src={event.image}
                        alt={event.name}
                        fill
                        className="object-cover object-top"
                        priority
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
                </div>

                {/* Event Title */}
                <h1 className="font-joker text-5xl md:text-7xl lg:text-[150px] leading-none text-white mt-[-30px] md:mt-[-50px] lg:mt-[-80px] relative z-10 drop-shadow-2xl text-center lowercase tracking-widest pointer-events-none">
                    {event.name}
                </h1>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                {/* LEFT COLUMN: DESCRIPTION & REGISTRATION */}
                <div className="space-y-12">
                    {/* About Section */}
                    <section>
                        <h2 className="text-3xl md:text-4xl text-red-600 mb-6 font-semibold">
                            About the event
                        </h2>
                        <div className="text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-light opacity-90 font-roboto">
                            {event.description.map((line, i) => (
                                <p key={i} className="mb-4">{line}</p>
                            ))}
                        </div>
                    </section>

                    {/* Metadata Icons - Dynamic based on selection */}
                    <div
                        key={selectedFeeIndex}
                        className="grid gap-6 text-gray-200 text-base md:text-lg font-light font-roboto animate-in fade-in slide-in-from-left-4 duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <Calendar className="text-red-600 w-6 h-6" />
                            <span>Date: {currentFee?.date || event.date || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock className="text-red-600 w-6 h-6" />
                            <span>Time: {currentFee?.time || event.time || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPin className="text-red-600 w-6 h-6" />
                            <span>Venue: {currentFee?.venue || event.venue || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Users className="text-red-600 w-6 h-6" />
                            <span>Team: {currentFee?.type === 'solo' ? 'Single' : currentFee?.type === 'duet' ? 'Duo' : 'Group (2+)'}</span>
                        </div>
                    </div>

                    {/* Registration Section */}
                    <section className="mt-10">
                        {event.fees && event.fees.length > 0 ? (
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-red-600 text-xl md:text-2xl font-normal">Select Team:</span>
                                    {/* Toggle Group */}
                                    <div className="flex bg-white rounded-full relative p-0 overflow-hidden">
                                        {event.fees
                                            .sort((a, b) => {
                                                const order = ["solo", "duet", "group"];
                                                return order.indexOf(a.type) - order.indexOf(b.type);
                                            })
                                            .map((fee, index) => {
                                                const isActive = event.fees[selectedFeeIndex].type === fee.type;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => setSelectedFeeIndex(index)}
                                                        className={`relative px-6 py-2 text-base font-medium capitalize rounded-full transition-colors duration-300 z-10 ${isActive ? "text-white" : "text-black hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {isActive && (
                                                            <motion.div
                                                                layoutId="active-pill"
                                                                className="absolute inset-0 bg-red-600 rounded-full -z-10"
                                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            />
                                                        )}
                                                        <span className="relative z-20">
                                                            {fee.type === 'solo' ? 'Single' : fee.type}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-white text-xl md:text-2xl font-roboto">Registration Fees-</span>
                                    <div className="border border-blue-500 px-4 py-1 rounded-none text-blue-500 text-xl font-bold">
                                        ₹{currentFee?.price}
                                    </div>
                                </div>

                                <Button
                                    className="w-fit px-12 py-6 text-xl font-jqka tracking-[0.2em] uppercase bg-transparent border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 rounded-none mt-4 shadow-[0_0_15px_rgba(220,38,38,0.2)] cursor-pointer"
                                    onClick={() => alert(`Registering for ${currentFee?.type} - ₹${currentFee?.price}`)}
                                >
                                    REGISTER
                                </Button>
                            </div>
                        ) : (
                            <Button
                                className="w-fit px-12 py-6 text-xl font-jqka tracking-[0.2em] uppercase bg-red-600 hover:bg-red-700 text-white transition-all duration-300 rounded-none mt-4 cursor-pointer"
                                onClick={() => alert("Registration Coming Soon!")}
                            >
                                Register Now
                            </Button>
                        )}
                    </section>
                </div>

                {/* RIGHT COLUMN: RULES CARD */}
                <div className="w-full">
                    <div className="border border-red-600 rounded-[30px] p-8 md:p-12 relative bg-black shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                        <h2 className="text-4xl md:text-5xl font-normal text-white text-center mb-8 font-poppins">
                            Rules
                        </h2>

                        <ul className="space-y-4 mb-10 text-gray-300 text-lg font-light leading-relaxed list-disc pl-5 font-roboto">
                            {event.rules.map((rule, i) => (
                                <li key={i}>{rule}</li>
                            ))}
                        </ul>

                        {event.rulebook && (
                            <div className="flex justify-center">
                                <a
                                    href={event.rulebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-8 py-2 border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors text-lg tracking-wide rounded-none font-jqka uppercase"
                                >
                                    View Rule Book
                                </a>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <Footer />
        </main>
    );
}
