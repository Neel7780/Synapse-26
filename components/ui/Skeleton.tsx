"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
    className?: string;
    variant?: "text" | "rectangular" | "circular" | "card";
    width?: string | number;
    height?: string | number;
    animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
    className,
    variant = "rectangular",
    width,
    height,
    animation = "pulse",
}: SkeletonProps) {
    const baseStyles = "bg-white/10";
    
    const variantStyles = {
        text: "rounded h-4",
        rectangular: "rounded-md",
        circular: "rounded-full",
        card: "rounded-xl",
    };

    const animationStyles = {
        pulse: "animate-pulse",
        wave: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        none: "",
    };

    return (
        <div
            className={cn(
                baseStyles,
                variantStyles[variant],
                animationStyles[animation],
                className
            )}
            style={{
                width: typeof width === "number" ? `${width}px` : width,
                height: typeof height === "number" ? `${height}px` : height,
            }}
        />
    );
}

// Card skeleton for event cards
export function EventCardSkeleton() {
    return (
        <div className="flex flex-col gap-3">
            <Skeleton variant="card" className="aspect-[457/640] w-full" />
            <Skeleton variant="text" className="w-3/4 h-4" />
            <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
    );
}

// List skeleton for data tables
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/5">
                    <Skeleton variant="circular" width={40} height={40} />
                    <div className="flex-1 space-y-2">
                        <Skeleton variant="text" className="w-1/3" />
                        <Skeleton variant="text" className="w-1/2 h-3" />
                    </div>
                    <Skeleton variant="rectangular" width={80} height={32} />
                </div>
            ))}
        </div>
    );
}

// Page loading skeleton
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-black p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Skeleton variant="text" className="w-48 h-8" />
                <Skeleton variant="rectangular" width={120} height={40} />
            </div>
            
            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <EventCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
