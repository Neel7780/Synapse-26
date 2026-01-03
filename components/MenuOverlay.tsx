"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";

const MENU_ITEMS = [
    { label: "PRONIGHT", href: "/pronight" },
    { label: "events", href: "/events" },
    { label: "team", href: "/team" },
    { label: "sponsors", href: "/sponsors" },
    { label: "merchandise", href: "/merchandise" },
    { label: "accommodation", href: "/accommodation" },
    { label: "profile", href: "/profile" },
    { label: "terms and condition", href: "/terms" },
    { label: "contact us", href: "/contact" },
];

const listVariants: Variants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.08,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" },
    },
};

export default function MenuOverlay({ closeMenu }: { closeMenu: () => void }) {
    return (
        <div className="fixed inset-0 bg-black z-[200]">

            {/* CLOSE */}
            <button
                onClick={closeMenu}
                className="absolute top-6 right-6 text-white text-3xl"
            >
                ✕
            </button>

            {/* LOGO */}
            <img
                src="/images/logo.png"
                className="absolute top-6 left-6 w-[42px]"
                alt="logo"
            />

            {/* MENU */}
            <motion.div
                className="mt-32 px-14 flex flex-col gap-7"
                variants={listVariants}
                initial="hidden"
                animate="visible"
            >
                {MENU_ITEMS.map((item) => (
                    <motion.div key={item.label} variants={itemVariants}>
                        <Link
                            href={item.href}
                            onClick={closeMenu}
                            className="group flex items-center justify-between w-full"
                        >
                            {/* TEXT */}
                            <span
                                className="
                  font-[Joker]
                  text-[42px]
                  leading-[52px]
                  text-white
                  transition-colors
                  group-hover:text-red-500
                "
                            >
                                {item.label}
                            </span>

                            {/* ARROW */}
                            <img
                                src="/images/white-arrow.png"
                                className="w-[26px] group-hover:hidden"
                            />
                            <img
                                src="/images/red-arrow.png"
                                className="w-[26px] hidden group-hover:block"
                            />
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {/* SOCIALS */}
            <div className="absolute bottom-10 right-10 flex gap-5">
                <img src="/images/insta.png" className="w-[26px]" />
                <img src="/images/youtube.png" className="w-[26px]" />
                <img src="/images/fb.png" className="w-[26px]" />
            </div>
        </div>
    );
}