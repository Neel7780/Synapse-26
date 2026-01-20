"use client";

import { useEffect, useRef } from "react";
import { useNavigationState } from "@/lib/useNavigationState";
import TransitionOverlay from "./TransitionOverlay";

export default function TransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isTransitioning, endTransition, loadingCount } = useNavigationState();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Smart Loading Logic with proper cleanup
    useEffect(() => {
        if (!isTransitioning) return;

        const startTime = Date.now();
        const MIN_DURATION = 4000; // Minimum time to show loader
        const MAX_DURATION = 20000; // Fail-safe max time

        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Check constantly if we can dismiss
        intervalRef.current = setInterval(() => {
            const elapsed = Date.now() - startTime;

            // If we exceeded max duration, force close
            if (elapsed > MAX_DURATION) {
                endTransition();
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                return;
            }

            // Only close if:
            // 1. Min duration passed
            // 2. No active loading requests
            if (elapsed > MIN_DURATION && loadingCount === 0) {
                endTransition();
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            }
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isTransitioning, loadingCount, endTransition]);

    return (
        <>
            <TransitionOverlay />
            {children}
        </>
    );
}
