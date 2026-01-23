"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationState } from "@/lib/useNavigationState";

export default function InitialLoader({ onComplete, onExitStart }: { onComplete?: () => void, onExitStart?: () => void }) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const [minTimeElapsed, setMinTimeElapsed] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const { loadingCount } = useNavigationState();

    // Track minimum display time
    useEffect(() => {
        const timer = setTimeout(() => {
            setMinTimeElapsed(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    // Check if all images in the document are loaded
    const checkImagesLoaded = useCallback(() => {
        const images = document.querySelectorAll('img');
        if (images.length === 0) {
            setImagesLoaded(true);
            return;
        }

        // Only check if complete. If naturalHeight is 0 it means broken image, but we shouldn't wait forever.
        const allLoaded = Array.from(images).every((img) => img.complete);
        if (allLoaded) {
            setImagesLoaded(true);
        }
    }, []);

    // Monitor images loading
    useEffect(() => {
        // Initial check
        checkImagesLoaded();

        // Set up interval to check for new images and their load status
        const interval = setInterval(() => {
            checkImagesLoaded();
        }, 100);

        // Also listen to load events
        const handleLoad = () => checkImagesLoaded();
        window.addEventListener('load', handleLoad);

        // Fallback timeout for images - 7 seconds is generous enough
        const imageFallbackTimer = setTimeout(() => {
            setImagesLoaded(true);
        }, 7000);

        return () => {
            clearInterval(interval);
            clearTimeout(imageFallbackTimer);
            window.removeEventListener('load', handleLoad);
        };
    }, [checkImagesLoaded]);

    // Global Force Exit Safety Valve
    // If something goes wrong with state/images, force exit after 12 seconds max
    useEffect(() => {
        const safetyTimer = setTimeout(() => {
            if (!isExiting) {
                // Force all conditions to true
                setMinTimeElapsed(true);
                setImagesLoaded(true);
                // We can't force loadingCount to 0 directly here properly without hacking,
                // but we can just trigger the exit logic if we modify the exit effect
                // OR we just manually trigger exit here:
                setIsExiting(true);
                onExitStart?.();

                const hideTimer = setTimeout(() => {
                    setIsVisible(false);
                    onComplete?.();
                }, 1200);
                return () => clearTimeout(hideTimer);
            }
        }, 12000);

        return () => clearTimeout(safetyTimer);
    }, [isExiting, onExitStart, onComplete]);

    // Check if we can exit (min time passed AND no active loading AND images loaded)
    useEffect(() => {
        if (minTimeElapsed && loadingCount === 0 && imagesLoaded && !isExiting) {
            setIsExiting(true);
            onExitStart?.();

            // Fully hide after exit animation completes
            const hideTimer = setTimeout(() => {
                setIsVisible(false);
                onComplete?.();
            }, 1200);

            return () => clearTimeout(hideTimer);
        }
    }, [minTimeElapsed, loadingCount, imagesLoaded, isExiting, onComplete, onExitStart]);

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 1 }}
                animate={isExiting ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
                transition={{
                    duration: isExiting ? 1 : 0.3,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center ${isExiting ? "pointer-events-none" : ""}`}
            >
                <motion.div
                    className="flex flex-col items-center gap-6"
                    animate={isExiting ? { y: -30, opacity: 0 } : { y: 0, opacity: 1 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                >
                    {/* Pulsing SYNAPSE text - continuous animation */}
                    <motion.div
                        className="flex overflow-hidden"
                        animate={{
                            opacity: [0.7, 1, 0.7],
                            scale: [0.98, 1, 0.98],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        {"SYNAPSE".split("").map((letter, i) => (
                            <span
                                key={i}
                                className="text-3xl md:text-5xl font-joker text-white tracking-[0.3em]"
                            >
                                {letter}
                            </span>
                        ))}
                    </motion.div>

                    {/* Animated underline - pulsing glow */}
                    <motion.div
                        animate={{
                            opacity: [0.5, 1, 0.5],
                            scaleX: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="h-0.5 w-32 md:w-48 bg-gradient-to-r from-transparent via-red-600 to-transparent origin-center"
                    />

                    {/* Three dots loading animation */}
                    <div className="flex gap-3 mt-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-600"
                                animate={{
                                    y: [0, -12, 0],
                                    opacity: [0.5, 1, 0.5],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.15,
                                    ease: "easeInOut",
                                }}
                            />
                        ))}
                    </div>

                    {/* Loading text - pulsing */}
                    <motion.p
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="text-white/50 font-jqka text-xs md:text-sm tracking-[0.4em] uppercase mt-2"
                    >
                        Loading
                    </motion.p>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
