"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
    id: number;
    tier: string;
}

export default function SponsorNavigation({ categories }: { categories: Category[] }) {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const handleScroll = () => {
            const sections = categories.map((cat) => document.getElementById(cat.tier));
            const scrollPosition = window.scrollY + 200; // Offset for better triggering

            let current = "";
            sections.forEach((section) => {
                if (section && section.offsetTop <= scrollPosition) {
                    current = section.id;
                }
            });
            setActiveId(current);
        };

        window.addEventListener("scroll", handleScroll);
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
        <>
            {/* Desktop Sidebar Navigation */}
            <motion.nav
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="hidden xl:flex fixed left-8 top-1/3 z-40 flex-col gap-4"
            >
                {categories.map((border) => (
                    <button
                        key={border.id}
                        onClick={() => scrollToSection(border.tier)}
                        className="group flex items-center gap-3 focus:outline-none"
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

            {/* Mobile/Tablet Sticky Top Bar - Only shows when scrolling past hero */}
            {/* For simplicity we can just let mobile users scroll naturally, 
          or add a small sticky bar. Given "Teams" page doesn't have it, 
          keeping it clean for mobile might be better or a simple horizontal scroll. */}
        </>
    );
}
