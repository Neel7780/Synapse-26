"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    id: number;
    tier: string;
}

export default function SponsorNavigation({ categories }: { categories: Category[] }) {
    const [activeId, setActiveId] = useState<string>("");

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            // Visibility Logic
            // Visibility Logic
            const heroThreshold = window.innerHeight * 0.5; // Hide when in hero section (approx 80vh)
            const footer = document.getElementById("contact");

            let isFooterInView = false;
            // Check if footer is visible in the viewport
            if (footer) {
                const rect = footer.getBoundingClientRect();
                // If the top of the footer is within the viewport height, it's visible
                // We add a small buffer (e.g., 50px) to start hiding slightly before it hits
                if (rect.top < window.innerHeight - 50) {
                    isFooterInView = true;
                }
            }

            // Show only if we are past the hero and not yet at the footer
            const shouldShow = scrollPosition > heroThreshold && !isFooterInView;
            setIsVisible(shouldShow);

            const sections = categories.map((cat) => document.getElementById(cat.tier));
            const activeScrollTrigger = scrollPosition + 250;

            let current = "";
            sections.forEach((section) => {
                if (section && section.offsetTop <= activeScrollTrigger) {
                    current = section.id;
                }
            });
            setActiveId(current);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Initial check
        return () => window.removeEventListener("scroll", handleScroll);
    }, [categories]);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Sticky header offset
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    if (categories.length === 0) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                    transition={{ duration: 0.5 }}
                    className="hidden xl:flex fixed left-8 top-1/3 z-30 flex-col gap-5"
                >
                    {categories.map((border) => (
                        <button
                            key={border.id}
                            onClick={() => scrollToSection(border.tier)}
                            className="group flex items-center gap-4 focus:outline-none"
                        >
                            <div
                                className={`
                    h-px transition-all duration-300
                    ${activeId === border.tier ? "w-8 bg-pink-500" : "w-4 bg-gray-600 group-hover:w-6 group-hover:bg-gray-400"}
                  `}
                            />
                            <span
                                className={`
                    text-xs uppercase tracking-widest transition-colors duration-300
                    ${activeId === border.tier ? "text-white font-bold" : "text-gray-500 group-hover:text-gray-300"}
                  `}
                            >
                                {border.tier}
                            </span>
                        </button>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
