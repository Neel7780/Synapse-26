"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect, useState } from "react";

type Phase = "idle" | "delay" | "enter" | "exit";

const images = [
    "/image_loader/2.png",
    "/image_loader/3.png",
    "/image_loader/4.png",
    "/image_loader/1.png",
];

export default function TransitionOverlay() {
    const { isTransitioning, isFirstLoad } = useNavigationState();

    // Start in 'idle' so it's hidden but mounted
    const [phase, setPhase] = useState<Phase>("idle");

    /* ---------------- PHASE CONTROL ---------------- */
    useEffect(() => {
        if (isTransitioning) {
            // Start sequence: idle -> delay -> enter
            setPhase("delay");
            const t = setTimeout(() => setPhase("enter"), 300);
            return () => clearTimeout(t);
        } else {
            // End sequence: enter -> exit -> idle
            // Only trigger exit if we were actually active (not already idle)
            if (phase !== "idle") {
                setPhase("exit");
                const t = setTimeout(() => setPhase("idle"), 3200); // Wait for exit animation
                return () => clearTimeout(t);
            }
        }
    }, [isTransitioning]);

    /* ---------------- POSITIONS ---------------- */
    const entryFromCorners = [
        { x: "-100vw", y: "-100vh", rotate: -45 },
        { x: "100vw", y: "-100vh", rotate: 45 },
        { x: "-100vw", y: "100vh", rotate: 45 },
        { x: "100vw", y: "100vh", rotate: -45 },
    ];

    const exitWithDoors = [
        { x: "-50vw", y: "0vh", rotate: 0 },
        { x: "50vw", y: "0vh", rotate: 0 },
        { x: "-50vw", y: "0vh", rotate: 0 },
        { x: "50vw", y: "0vh", rotate: 0 },
    ];

    // During 'idle' or 'delay', cards should be at their initial positions (ready to enter)
    // During 'enter', they move to center
    // During 'exit', they move to doors

    // Visibility:
    // If phase === 'idle', we hide the whole container visually but keep it in DOM.
    // We use z-index to send it to back and display:none or opacity-0 to hide.
    // To ensure images don't lose decode state, we prefer opacity-0 or z-[-1].
    // Note: If we use display:none, some browsers might dump the texture. Opacity 0 is safer.

    const isHidden = phase === "idle" || (isFirstLoad && !isTransitioning);

    return (
        <motion.div
            className={`fixed inset-0 pointer-events-none overflow-hidden ${isHidden ? "z-[-1] opacity-0" : "z-[9999] opacity-100"}`}
            aria-hidden={isHidden}
        >
            {/* LOADING TEXT - Only visible during enter phase */}
            <div
                className={`
    absolute z-50 pointer-events-none transition-opacity duration-300
    inset-0 flex items-center justify-center font-black
    lg:inset-auto lg:bottom-8 lg:right-8 [text-shadow:0_2px_6px_rgba(0,0,0,0.85)]
    ${phase === "enter" ? "opacity-100" : "opacity-0"}
  `}
            >
                <h1 className="text-[#E5E5E5] text-2xl md:text-4xl lg:text-3xl font-joker lowercase tracking-widest animate-pulse">
                    loading...
                </h1>
            </div>


            {/* BLACK BASE - Visible during delay, enter, and exit (not idle) */}
            <div className={`absolute inset-0 bg-black z-0 transition-opacity duration-0 ${phase === "exit" || phase === "idle" ? "opacity-0" : "opacity-100"}`} />
            {/* Wait: The black base logic was: `phase !== "exit"`. 
                If phase is 'delay', we need black base? Yes. 
                If phase is 'enter', we need black base? Yes.
                If phase is 'exit', we REMOVE black base so we can see the doors closing over the page? 
                Actually, usually 'exit' phase implies the overlay is revealing the new page? 
                Let's stick to previous logic: `phase !== "exit"` meant black base is ON.
                So in 'delay' and 'enter', opacity 1. In 'exit', opacity 0.
            */}
            <div className={`absolute inset-0 bg-black z-0 ${phase === "exit" ? "hidden" : "block"}`} />


            {/* CARDS */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20">
                {images.map((src, i) => (
                    <motion.div
                        key={i}
                        className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
                        // Force initial state when idle or delay so they are ready
                        initial={entryFromCorners[i]}
                        animate={
                            phase === "enter"
                                ? { x: 0, y: 0, rotate: 0 }
                                : phase === "exit"
                                    ? exitWithDoors[i]
                                    : entryFromCorners[i] // Reset to corners when idle/delay
                        }
                        transition={{
                            duration: phase === "enter" ? 1.6 : (phase === "exit" ? 3 : 0), // Instant reset if not entering/exiting
                            delay: phase === "enter" ? i * 0.35 : 0,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <img
                            src={src}
                            alt=""
                            className="object-fill transform origin-center w-[50dvh] h-[50vw] rotate-90 md:w-full md:h-full md:rotate-0"
                        />
                    </motion.div>
                ))}
            </div>

            {/* DOORS */}
            <div className={`absolute inset-0 z-10 flex ${phase === "exit" ? "block" : "hidden"}`}>
                <motion.div
                    className="w-1/2 h-full bg-black"
                    initial={{ x: 0 }}
                    animate={phase === "exit" ? { x: "-100%" } : { x: 0 }}
                    transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.div
                    className="w-1/2 h-full bg-black"
                    initial={{ x: 0 }}
                    animate={phase === "exit" ? { x: "100%" } : { x: 0 }}
                    transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>
        </motion.div>
    );
}
