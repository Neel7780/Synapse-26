"use client";

import { useState, useEffect } from 'react';

type ImageType = 'team' | 'sponsor';

interface Dimensions {
    width: number;
    height: number;
}

export function useDynamicImageSize(type: ImageType): Dimensions {
    // Default to smallest size to prevent layout shifts on mobile first, 
    // or a reasonable default. 
    // For SSR safety, we start with 0 or a static default and update on mount.
    const [size, setSize] = useState<Dimensions>({ width: 0, height: 0 });

    useEffect(() => {
        const calculateSize = () => {
            const width = window.innerWidth;

            if (type === 'team') {
                // Teams Page Logic
                // mobile: w-36 (144px), desktop: w-52 (208px)
                if (width >= 768) {
                    setSize({ width: 208, height: 208 });
                } else {
                    setSize({ width: 144, height: 144 });
                }
            } else if (type === 'sponsor') {
                // Sponsors Page Logic
                // base: 180x135, sm: 220x150, md: 260x170
                if (width >= 768) {
                    setSize({ width: 260, height: 170 });
                } else if (width >= 640) {
                    setSize({ width: 220, height: 150 });
                } else {
                    setSize({ width: 180, height: 135 });
                }
            }
        };

        // Initial calculation
        calculateSize();

        // Event listener
        window.addEventListener('resize', calculateSize);

        return () => window.removeEventListener('resize', calculateSize);
    }, [type]);

    return size;
}
