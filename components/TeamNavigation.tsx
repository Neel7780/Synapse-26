"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TeamSection {
    id: string;
    label: string;
}

export default function TeamNavigation() {
    const [activeId, setActiveId] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    const sections: TeamSection[] = [
        { id: "leadership", label: "Leadership" },
        { id: "heads", label: "Heads" },
        { id: "core", label: "Core" },
        { id: "mentors", label: "Mentors" },
        { id: "web", label: "Web Team" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;

            // Visibility logic
            // Show only after hero section (roughly 65vh) and hide before footer
            const heroHeight = window.innerHeight * 0.8;
            const footer = document.getElementById("contact");

            let footerVisible = false;
            if (footer) {
                const rect = footer.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                    footerVisible = true;
                }
            }

            const shouldShow = scrollPosition > heroHeight && !footerVisible;
            setIsVisible(shouldShow);

            // Active section logic
            const currentPosition = scrollPosition + 250; // Offset for trigger
            let current = "";

            sections.forEach((section) => {
                const element = document.getElementById(section.id);
                if (element && element.offsetTop <= currentPosition) {
                    current = section.id;
                }
            });
            setActiveId(current);
        };

        window.addEventListener("scroll", handleScroll);
        // Initial check
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
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
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="group flex items-center gap-4 focus:outline-none"
                        >
                            <div
                                className={`
                                    h-px transition-all duration-300
                                    ${activeId === section.id ? "w-8 bg-pink-500" : "w-4 bg-gray-600 group-hover:w-6 group-hover:bg-gray-400"}
                                `}
                            />
                            <span
                                className={`
                                    text-xs uppercase tracking-widest transition-colors duration-300
                                    ${activeId === section.id ? "text-white font-bold" : "text-gray-500 group-hover:text-gray-300"}
                                `}
                            >
                                {section.label}
                            </span>
                        </button>
                    ))}
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
