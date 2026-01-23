"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InitialLoader() {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Hide loader after a short delay to allow page to render
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed inset-0 z-[9998] bg-black flex items-center justify-center"
                >
                    {/* Joker-themed loader */}
                    <div className="flex flex-col items-center gap-6">
                        {/* Card spinning animation */}
                        <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{
                                duration: 1.2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="w-16 h-24 md:w-20 md:h-28 relative"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* Card front */}
                            <div
                                className="absolute inset-0 rounded-lg bg-gradient-to-br from-red-600 to-red-800 border-2 border-white/20 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                                style={{ backfaceVisibility: "hidden" }}
                            >
                                <div className="absolute inset-2 border border-white/30 rounded flex items-center justify-center">
                                    <span className="text-white font-joker text-2xl md:text-3xl">S</span>
                                </div>
                            </div>
                            {/* Card back */}
                            <div
                                className="absolute inset-0 rounded-lg bg-gradient-to-br from-zinc-800 to-black border-2 border-white/20"
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                }}
                            >
                                <div className="absolute inset-2 border border-white/10 rounded">
                                    <div className="w-full h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.03)_4px,rgba(255,255,255,0.03)_8px)]" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Loading text */}
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="text-white/70 font-jqka text-sm tracking-[0.3em] uppercase"
                        >
                            Loading
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
