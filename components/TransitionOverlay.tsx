"use client";

import { motion } from "framer-motion";
import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";

type Phase = "idle" | "delay" | "enter" | "exit";

const images = [
    "/image_loader/2.png",
    "/image_loader/3.png",
    "/image_loader/4.png",
    "/image_loader/1.png",
];

export default function TransitionOverlay() {
    const { isTransitioning, isFirstLoad } = useNavigationState();
    const [phase, setPhase] = useState<Phase>("idle");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Memoized phase transition handler to avoid unnecessary re-renders
    const handlePhaseTransition = useCallback((newPhase: Phase, delay: number = 0) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        if (delay > 0) {
            timeoutRef.current = setTimeout(() => setPhase(newPhase), delay);
        } else {
            setPhase(newPhase);
        }
    }, []);

    useEffect(() => {
        if (isTransitioning) {
            // Start sequence: idle -> delay -> enter
            handlePhaseTransition("delay");
            handlePhaseTransition("enter", 300);
        } else if (phase !== "idle") {
            // End sequence: enter -> exit -> idle
            handlePhaseTransition("exit");
            handlePhaseTransition("idle", 3200);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [isTransitioning, handlePhaseTransition]); // Removed 'phase' from deps to prevent loop

    /* ---------------- POSITIONS ---------------- */
    const entryFromCorners = [
        { x: "-100vw", y: "-100vh", rotate: -25 },
        { x: "100vw", y: "-100vh", rotate: 25 },
        { x: "-100vw", y: "100vh", rotate: 25 },
        { x: "100vw", y: "100vh", rotate: -25 },
    ];

    const exitWithDoors = [
        { x: "-50vw", y: "0vh", rotate: 0 },
        { x: "50vw", y: "0vh", rotate: 0 },
        { x: "-50vw", y: "0vh", rotate: 0 },
        { x: "50vw", y: "0vh", rotate: 0 },
    ];

    const isHidden = phase === "idle" || (isFirstLoad && !isTransitioning);

    return (
        <motion.div
            className={`fixed inset-0 pointer-events-none overflow-hidden ${isHidden ? "z-[-1] opacity-0" : "z-[9999] opacity-100"}`}
            aria-hidden={isHidden}
        >
            {/* LOADING TEXT - Only visible during enter phase */}
            <div className={`absolute inset-0 flex items-center justify-center z-50 pointer-events-none mix-blend-difference transition-opacity duration-300 ${phase === "enter" ? "opacity-100" : "opacity-0"}`}>
                <h1 className="text-[#E5E5E5] text-xl md:text-2xl font-joker lowercase tracking-widest animate-pulse">
                    loading...
                </h1>
            </div>

            {/* BLACK BASE */}
            <div className={`absolute inset-0 bg-black z-0 ${phase === "exit" ? "hidden" : "block"}`} />

            {/* CARDS */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20">
                {images.map((src, i) => (
                    <motion.div
                        key={i}
                        className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
                        initial={entryFromCorners[i]}
                        animate={
                            phase === "enter"
                                ? { x: 0, y: 0, rotate: 0 }
                                : phase === "exit"
                                    ? exitWithDoors[i]
                                    : entryFromCorners[i]
                        }
                        transition={{
                            duration: phase === "enter" ? 1.6 : (phase === "exit" ? 3 : 0),
                            delay: phase === "enter" ? i * 0.25 : 0,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <Image
                            src={src}
                            alt=""
                            fill
                            sizes="50vw"
                            className="object-fill transform origin-center w-[50dvh] h-[50vw] rotate-90 md:w-full md:h-full md:rotate-0"
                            priority={i < 2}
                            loading={i < 2 ? "eager" : "lazy"}
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
