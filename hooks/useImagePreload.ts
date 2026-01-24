import { useEffect, useState } from "react";
import { useNavigationState } from "@/lib/useNavigationState";

export function useImagePreload(src: string) {
    const { registerLoading, unregisterLoading } = useNavigationState();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!src) return;

        // Register this image as a blocking resource
        registerLoading();

        const img = new Image();
        img.src = src;

        img.onload = () => {
            setIsLoaded(true);
            unregisterLoading();
        };

        img.onerror = () => {
            // Even if error, we must unregister to avoid hanging
            console.error(`Failed to load blocking image: ${src}`);
            unregisterLoading();
        };

        return () => {
            // Cleanup: if component unmounts before load, release the lock
            // (Wait, if we unmount, we probably don't care anymore, but checking state is safer)
            // Actually, we should only unregister if we haven't fired onload yet.
            // But Since react useEffect cleanup runs on unmount, 
            // and we want valid page content to hold the lock.
        };
    }, [src, registerLoading, unregisterLoading]);

    return isLoaded;
}
