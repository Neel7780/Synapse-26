"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Calendar, Clock, MapPin, Users, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useEventBySlug } from "@/hooks/useEvents";
import { FormattedFee } from "@/types/events";
import { useNavigationState } from "@/lib/useNavigationState";

export default function EventPage() {
    const params = useParams();
    const router = useRouter();
    const { startTransition } = useNavigationState();

    // derived synchronously
    const slug = params?.slug as string;
    const eventNameSlug = params?.eventName as string;

    // Fetch event from backend using Supabase
    const { event, fees, loading, error } = useEventBySlug(slug, eventNameSlug);

    // State for selected fee type (default to first available)
    const [selectedFeeIndex, setSelectedFeeIndex] = useState(0);

    // Sort fees: Solo -> Duet -> Group
    const sortedFees = useMemo(() => {
        if (!fees || fees.length === 0) return [];
        const order = ["solo", "duet", "group"];
        return [...fees].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    }, [fees]);

    // Reset selection when fees change
    useEffect(() => {
        if (sortedFees.length > 0) {
            setSelectedFeeIndex(0);
        }
    }, [sortedFees.length]);

    // Handle errors
    if (error || (!loading && !event)) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-joker">
                <AlertCircle className="w-16 h-16 text-red-600 mb-4" />
                <h1 className="text-4xl text-red-600 mb-4">Error</h1>
                <p className="text-xl font-roboto">{error || "Event not found"}</p>
                <Button onClick={() => router.back()} className="mt-6 rounded-none font-jqka bg-red-600 hover:bg-red-700">
                    Go Back
                </Button>
            </div>
        );
    }

    // Show minimal loading or just render with available data
    if (!event) {
        return null;
    }

    const currentFee: FormattedFee | null = sortedFees.length > 0 ? sortedFees[selectedFeeIndex] : null;

    // Parse event date and time
    // Force IST interpretation by stripping any existing timezone and appending +05:30
    const parseDateAsIST = (dateStr: string) => {
        if (!dateStr) return null;
        const cleanDateStr = dateStr.replace('Z', '').replace(/\+\d{2}:\d{2}$/, '').replace(' ', 'T');
        return new Date(`${cleanDateStr}+05:30`);
    };

    const eventDateTime = event.event_date ? parseDateAsIST(event.event_date) : null;
    const eventDate = eventDateTime
        ? eventDateTime.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
        : "TBD";
    const eventTime = eventDateTime
        ? eventDateTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })
        : "TBD";

    // Description lines
    const descriptionLines = event.description
        ? event.description.split('\n').filter(line => line.trim())
        : ['Event details coming soon.'];

    return (
        <main className="bg-black text-white min-h-screen overflow-x-hidden font-roboto">


            {/* HERO SECTION */}
            <div className="relative w-full pb-10 flex flex-col items-center group">
                {/* Image Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] overflow-hidden"
                >
                    <Image
                        // src={event.event_picture || "/images_events/default.png"}
                        src={"/images_events/default.png"}
                        alt={event.event_name}
                        fill
                        className="object-cover object-top"
                        priority={false}
                        loading="eager"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-150 bg-gradient-to-t from-black to-transparent" />
                </motion.div>

                {/* Event Title */}
                <motion.h1
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "backOut" }}
                    className="font-joker text-3xl sm:text-5xl md:text-8xl leading-none text-white mt-[-20px] md:mt-[-40px] lg:mt-[-70px] relative z-10 drop-shadow-2xl text-center lowercase tracking-widest pointer-events-none whitespace-nowrap"
                >
                    {event.event_name}
                </motion.h1>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-20 py-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

                {/* LEFT COLUMN: DESCRIPTION & REGISTRATION */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="space-y-12"
                >
                    {/* About Section */}
                    <section>
                        <h2 className="text-3xl md:text-4xl text-red-600 mb-6 font-semibold">
                            About the event
                        </h2>
                        <div className="text-gray-300 leading-relaxed text-base md:text-lg whitespace-pre-wrap font-light opacity-90 font-roboto">
                            {descriptionLines.map((line, i) => (
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
                            <span>Date: {eventDate}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Clock className="text-red-600 w-6 h-6" />
                            <span>Time: {eventTime}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <MapPin className="text-red-600 w-6 h-6" />
                            <span>Venue: {event.venue || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <Users className="text-red-600 w-6 h-6" />
                            <span>Team: {currentFee?.type === 'solo' ? 'Solo' : currentFee?.type === 'duet' ? 'Duet' : 'Group'}</span>
                        </div>
                    </div>

                    {/* Registration Section */}
                    <section className="mt-10">
                        {sortedFees.length > 0 ? (
                            <div className="flex flex-col gap-8">
                                <div className="flex flex-wrap items-center gap-4">
                                    <span className="text-red-600 text-xl md:text-2xl font-normal">Select Team:</span>
                                    {/* Toggle Group */}
                                    <div className="flex bg-white rounded-full relative p-0 overflow-hidden">
                                        {sortedFees.map((fee, index) => {
                                            const isActive = selectedFeeIndex === index;
                                            return (
                                                <button
                                                    key={fee.fee_id}
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
                                                        {fee.type === 'solo' ? 'Solo' : fee.type === 'duet' ? 'Duet' : 'Group'}
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
                                    onClick={() => {
                                        if (!currentFee) return;
                                        // Start loading animation first
                                        startTransition();
                                        const queryParams = new URLSearchParams({
                                            fee_id: String(currentFee.fee_id || 0),
                                            type: currentFee.type,
                                            price: String(currentFee.price),
                                            min: String(currentFee.min_members || 1),
                                            max: String(currentFee.max_members || 1),
                                            qr_code: currentFee.qr_code || "",
                                            event_id: String(currentFee.event_id || 0),
                                            is_dau_free: String(event.is_dau_free || false),
                                        });
                                        router.push(`/events/${slug}/${eventNameSlug}/register?${queryParams.toString()}`);
                                    }}
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
                </motion.div>

                {/* RIGHT COLUMN: RULES CARD */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full"
                >
                    <div className="border border-red-600 rounded-[30px] p-8 md:p-12 relative bg-black shadow-[0_0_20px_rgba(220,38,38,0.1)]">
                        <h2 className="text-4xl md:text-5xl font-normal text-white text-center mb-8 font-poppins">
                            Rules
                        </h2>

                        <ul className="space-y-4 mb-10 text-gray-300 text-lg font-light leading-relaxed list-disc pl-5 font-roboto">
                            <li>Participants must carry their own instruments, props, or tracks if required.</li>
                            <li>Failure to adhere to the rules may result in disqualification.</li>
                            <li>The judges&apos; and committee&apos;s decision will be final and binding.</li>
                            <li>For event specific details see the rule book.</li>
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
                </motion.div>

            </div>

            <Footer />
        </main>
    );
}
