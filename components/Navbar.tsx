"use client";

import { useState } from "react";
import MenuOverlay from "./MenuOverlay";
import Link from "next/link";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            {/* NAVBAR */}
            <div className="fixed top-0 left-0 w-full flex justify-between items-center px-6 py-6 z-50">

                {/* LOGO */}
                <Link href="/">
                    <img
                        src="/images/logo.png"
                        alt="Logo"
                        className="w-[32px] md:w-[48px] cursor-pointer"
                    />
                </Link>

                {/* MENU ICON */}
                <button onClick={() => setMenuOpen(true)} className="space-y-2">
                    <div className="w-8 h-[3px] bg-white rounded"></div>
                    <div className="w-8 h-[3px] bg-white rounded"></div>
                    <div className="w-8 h-[3px] bg-white rounded"></div>
                </button>
            </div>

            {/* OVERLAY MENU */}
            {menuOpen && <MenuOverlay closeMenu={() => setMenuOpen(false)} />}
        </>
    );
}