"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useNavigationState } from "@/lib/useNavigationState";
import TransitionOverlay from "@/components/TransitionOverlay";

export default function TransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { startTransition, endTransition, isFirstLoad, isTransitioning, loadingCount } =
        useNavigationState();

    // Smart Loading Logic
    const startPathRef = useRef(pathname);

    // Update startPath when transition starts
    useEffect(() => {
        if (isTransitioning) {
            startPathRef.current = pathname;
        }
    }, [isTransitioning]); // Don't include pathname here, we want the path AT START

    useEffect(() => {
        if (!isTransitioning) return;

        const startTime = Date.now();
        const MIN_DURATION = 4000; // Minimum time to show loader
        const MAX_DURATION = 90000; // Fail-safe max time

        // Check constantly if we can dismiss
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const currentPath = window.location.pathname; // Safety check using window or rely on hook prop

            // If we exceeded max duration, force close
            if (elapsed > MAX_DURATION) {
                endTransition();
                clearInterval(interval);
                return;
            }

            // Only close if:
            // 1. Min duration passed
            // 2. No active loading requests
            // 3. Path has actually changed (Critical Fix)
            if (elapsed > MIN_DURATION && loadingCount === 0 && pathname !== startPathRef.current) {
                endTransition();
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isTransitioning, loadingCount, endTransition, pathname]);

    return (
        <>
            <TransitionOverlay />
            {children}
        </>
    );
}
