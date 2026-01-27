"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useNavigationState } from "@/lib/useNavigationState";
import TransitionOverlay from "@/components/TransitionOverlay";
import InitialLoader from "@/components/InitialLoader";

export default function TransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { endTransition, isTransitioning, loadingCount, isFirstLoad } =
        useNavigationState();

    // Track if we should show initial loader (only on direct page load, not from home)
    const [showInitialLoader, setShowInitialLoader] = useState(false);
    const [isLoaderComplete, setIsLoaderComplete] = useState(false);
    const [isExitStarted, setIsExitStarted] = useState(false);

    // Smart Loading Logic
    const startPathRef = useRef(pathname);

    // Check if this is a direct landing (not from home page intro)
    useEffect(() => {
        // Show initial loader only if:
        // 1. It's the first load
        // 2. Not on the home page (home has its own intro)
        // 3. Not already transitioning
        if (isFirstLoad && pathname !== "/" && !isTransitioning) {
            setShowInitialLoader(true);
        } else if (pathname === "/" || !isFirstLoad) {
            // Home page or returning user - no loader needed
            setIsLoaderComplete(true);
            setIsExitStarted(true);
        }
    }, [isFirstLoad, pathname, isTransitioning]);

    // Handle when exit animation starts - show content immediately
    const handleExitStart = useCallback(() => {
        setIsExitStarted(true);
    }, []);

    // Handle loader fully complete
    const handleLoaderComplete = useCallback(() => {
        setShowInitialLoader(false);
        setIsLoaderComplete(true);
    }, []);

    // Update startPath when transition starts
    useEffect(() => {
        if (isTransitioning) {
            startPathRef.current = pathname;
            // Reset back flag when a new transition starts (forward navigation)
            isBackRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isTransitioning]); // Don't include pathname here, we want the path AT START

    // Update startPathRef when not transitioning and pathname changes
    // This ensures the reference is fresh for the next transition
    useEffect(() => {
        if (!isTransitioning) {
            startPathRef.current = pathname;
        }
    }, [pathname, isTransitioning]);

    // Track back/forward navigation
    const isBackRef = useRef(false);

    useEffect(() => {
        const handlePopState = () => {
            isBackRef.current = true;
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => {
        if (!isTransitioning) return;

        const startTime = Date.now();
        // If it's a back navigation, skip the artificial delay (0ms). Otherwise default to 1.5s.
        const MIN_DURATION = isBackRef.current ? 0 : 4000;
        const MAX_DURATION = 90000; // Fail-safe max time

        // Check constantly if we can dismiss
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            // Safety check using window

            // If we exceeded max duration, force close
            if (elapsed > MAX_DURATION) {
                endTransition();
                isBackRef.current = false; // Reset
                clearInterval(interval);
                return;
            }

            // Only close if:
            // 1. Min duration passed
            // 2. No active loading requests
            // 3. Path has actually changed (Critical Fix)
            if (elapsed > MIN_DURATION && loadingCount === 0 && pathname !== startPathRef.current) {
                endTransition();
                isBackRef.current = false; // Reset
                clearInterval(interval);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [isTransitioning, loadingCount, endTransition, pathname]);

    return (
        <>
            <TransitionOverlay />
            {showInitialLoader && (
                <InitialLoader
                    onExitStart={handleExitStart}
                    onComplete={handleLoaderComplete}
                />
            )}
            <div
                style={{
                    opacity: isExitStarted ? 1 : 0,
                    transition: 'opacity 0.5s ease-out',
                }}
            >
                {children}
            </div>
        </>
    );
}

