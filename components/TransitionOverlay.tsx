"use client";

import { motion } from "framer-motion";
import { useNavigationState } from "@/lib/useNavigationState";
import { useEffect, useState, useRef, useLayoutEffect } from "react";

type Phase = "idle" | "delay" | "enter" | "exit";

const images = [
    "/image_loader/2.png",
    "/image_loader/3.png",
    "/image_loader/4.png",
    "/image_loader/1.png",
];

export default function TransitionOverlay() {
    const { isTransitioning, isFirstLoad } = useNavigationState();

    /* ---------------- PHASE ---------------- */
    const [phase, setPhase] = useState<Phase>("idle");

    /* ---------------- CELL MEASUREMENT ---------------- */
    const cellRef = useRef<HTMLDivElement | null>(null);
    const [scaleX, setScaleX] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    /* ---------------- PHASE CONTROL ---------------- */
    useEffect(() => {
        if (isTransitioning) {
            setPhase("delay");
            const t = setTimeout(() => setPhase("enter"), 300);
            return () => clearTimeout(t);
        } else {
            if (phase !== "idle") {
                setPhase("exit");
                const t = setTimeout(() => setPhase("idle"), 3200);
                return () => clearTimeout(t);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransitioning]);

    /* ---------------- SCALE CALCULATION ---------------- */
    useLayoutEffect(() => {
        const computeScale = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (!mobile || !cellRef.current) {
                setScaleX(1);
                return;
            }

            const { width, height } =
                cellRef.current.getBoundingClientRect();

            if (width > 0 && height > 0) {
                setScaleX(height / width);
            }
        };

        computeScale();
        window.addEventListener("resize", computeScale);
        window.addEventListener("orientationchange", computeScale);

        return () => {
            window.removeEventListener("resize", computeScale);
            window.removeEventListener("orientationchange", computeScale);
        };
    }, []);

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

    const isHidden =
        phase === "idle" || (isFirstLoad && !isTransitioning);

    return (
        <motion.div
            className={`fixed inset-0 pointer-events-none overflow-hidden ${isHidden
                ? "z-[-1] opacity-0"
                : "z-[9999] opacity-100"
                }`}
            aria-hidden={isHidden}
        >
            {/* LOADING TEXT */}
            <div
                className={`
                    absolute z-50 pointer-events-none transition-opacity duration-300
                    inset-0 flex items-center justify-center
                    [text-shadow:5px_5px_2px_#000000]
                    ${phase === "enter" ? "opacity-100" : "opacity-0"}
                `}
            >
                <h1
                    className="
                        text-[#F2E8C4] font-black
                        text-4xl md:text-6xl lg:text-8xl 
                        font-joker tracking-[0.25em]
                        animate-[pulse_3s_cubic-bezier(0.4,0,0.6,0.5)_infinite]
                    "
                >
                    loading...
                </h1>
            </div>

            {/* BLACK BASE */}
            <div
                className={`absolute inset-0 bg-black z-0 ${phase === "exit" || phase === "idle"
                    ? "opacity-0"
                    : "opacity-100"
                    }`}
            />

            {/* CARDS GRID */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 z-20">
                {images.map((src, i) => (
                    <motion.div
                        key={i}
                        ref={i === 0 ? cellRef : null}
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
                            duration:
                                phase === "enter"
                                    ? 1.6
                                    : phase === "exit"
                                        ? 3
                                        : 0,
                            delay:
                                phase === "enter"
                                    ? i * 0.35
                                    : 0,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                    >
                        <Image
                            src={src}
                            alt=""
                            className="
                                object-fill origin-center
                                w-[50dvh] h-[50vw]
                                md:w-full md:h-full md:rotate-0
                            "
                            style={
                                isMobile
                                    ? {
                                        transform: `rotate(90deg) scaleX(${scaleX})`,
                                    }
                                    : undefined
                            }
                        />
                    </motion.div>
                ))}
            </div>

            {/* EXIT DOORS */}
            <div
                className={`absolute inset-0 z-10 flex ${phase === "exit" ? "block" : "hidden"
                    }`}
            >
                <motion.div
                    className="w-1/2 h-full bg-black"
                    initial={{ x: 0 }}
                    animate={{ x: "-100%" }}
                    transition={{
                        duration: 3,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                />
                <motion.div
                    className="w-1/2 h-full bg-black"
                    initial={{ x: 0 }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 3,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                />
            </div>
        </motion.div>
    );
}
