"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useNavigationState } from "@/lib/useNavigationState";

// Pages where navbar should not be rendered
const EXCLUDED_PATHS = ["/admin", "/auth", "/coordinator"];

export default function GlobalNavbar() {
    const { isNavbarVisible, setNavbarVisible } = useNavigationState();
    const pathname = usePathname();
    const prevPathRef = useRef<string | null>(null);

    // Check if current path should exclude navbar
    const isExcludedPath = EXCLUDED_PATHS.some(path => pathname?.startsWith(path));
    const isHomePage = pathname === "/";

    // When navigating FROM home page TO another page, ensure navbar is visible
    // Use a slight delay to avoid race conditions with GSAP animations on home page
    useEffect(() => {
        const wasHomePage = prevPathRef.current === "/";
        const navigatedAway = wasHomePage && !isHomePage && !isExcludedPath;

        // Update previous path reference
        prevPathRef.current = pathname;

        // If we just navigated away from home to a valid page, show navbar
        if (navigatedAway) {
            // Small delay to ensure GSAP cleanup has completed
            const timer = setTimeout(() => {
                setNavbarVisible(true);
            }, 100);
            return () => clearTimeout(timer);
        }

        // If we're on a non-home, non-excluded page and navbar is hidden, show it
        // This handles direct navigation to pages (not from home)
        if (!isHomePage && !isExcludedPath && !isNavbarVisible) {
            setNavbarVisible(true);
        }
    }, [pathname, isHomePage, isExcludedPath, isNavbarVisible, setNavbarVisible]);

    // Don't render navbar on excluded paths
    if (isExcludedPath) return null;

    return (
        <Navbar visible={isNavbarVisible}>
            <NavigationPanel />
        </Navbar>
    );
}
