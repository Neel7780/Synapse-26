"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";
import gsap from "gsap";

interface CountdownTimerProps {
  targetDate: Date;
}

// Animated flip digit component
const FlipDigit = memo(function FlipDigit({
  value,
  prevValue,
}: {
  value: string;
  prevValue: string;
}) {
  const digitRef = useRef<HTMLDivElement>(null);
  const topHalfRef = useRef<HTMLDivElement>(null);
  const bottomHalfRef = useRef<HTMLDivElement>(null);
  const flipTopRef = useRef<HTMLDivElement>(null);
  const flipBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value === prevValue) return;
    if (!digitRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    // Flip animation
    const tl = gsap.timeline();

    // Reset flip elements
    gsap.set(flipTopRef.current, { rotateX: 0, zIndex: 2 });
    gsap.set(flipBottomRef.current, { rotateX: 90, zIndex: 1 });

    // Animate top half flipping down
    tl.to(flipTopRef.current, {
      rotateX: -90,
      duration: 0.3,
      ease: "power2.in",
    })
      // Animate bottom half flipping up
      .to(
        flipBottomRef.current,
        {
          rotateX: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        "-=0.1"
      );

    // Add a subtle scale pulse
    gsap.fromTo(
      digitRef.current,
      { scale: 1.05 },
      { scale: 1, duration: 0.3, ease: "power2.out" }
    );
  }, [value, prevValue]);

  return (
    <div
      ref={digitRef}
      className="relative w-[1.2em] h-[1.6em] text-center perspective-[200px]"
      style={{ perspective: "200px" }}
    >
      {/* Static top half (shows new value) */}
      <div
        ref={topHalfRef}
        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-white/10 to-white/5 rounded-t-md"
      >
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 font-joker tabular-nums">
          {value}
        </span>
      </div>

      {/* Static bottom half (shows new value) */}
      <div
        ref={bottomHalfRef}
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-t from-white/10 to-white/5 rounded-b-md"
      >
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-joker tabular-nums">
          {value}
        </span>
      </div>

      {/* Flipping top half (shows old value, flips down) */}
      <div
        ref={flipTopRef}
        className="absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-gradient-to-b from-red-900/30 to-red-800/20 rounded-t-md origin-bottom"
        style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
      >
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 font-joker tabular-nums">
          {prevValue}
        </span>
      </div>

      {/* Flipping bottom half (shows new value, flips up) */}
      <div
        ref={flipBottomRef}
        className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-gradient-to-t from-red-900/30 to-red-800/20 rounded-b-md origin-top"
        style={{
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          transform: "rotateX(90deg)",
        }}
      >
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-joker tabular-nums">
          {value}
        </span>
      </div>

      {/* Center line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-black/30 z-10" />
    </div>
  );
});

// Memoized time unit component with flip animation
const TimeUnit = memo(function TimeUnit({
  value,
  prevValue,
  label,
  showSeparator,
}: {
  value: number;
  prevValue: number;
  label: string;
  showSeparator: boolean;
}) {
  const valueStr = value.toString().padStart(2, "0");
  const prevValueStr = prevValue.toString().padStart(2, "0");

  return (
    <div className="relative flex flex-col gap-2 items-center">
      <div className="flex gap-0.5 text-[clamp(1.4rem,4.5vw,2.4rem)]">
        <FlipDigit value={valueStr[0]} prevValue={prevValueStr[0]} />
        <FlipDigit value={valueStr[1]} prevValue={prevValueStr[1]} />
      </div>
      <div className="font-joker opacity-85 text-[clamp(0.65rem,2vw,1rem)] uppercase tracking-wider">
        {label}
      </div>
      {showSeparator && (
        <span
          className="absolute left-full translate-x-[100%] top-[0.3em] font-joker leading-none text-[clamp(1.4rem,4.5vw,2.4rem)] text-red-500"
          aria-hidden="true"
        >
          :
        </span>
      )}
    </div>
  );
});

export const CountdownTimer = memo(function CountdownTimer({
  targetDate,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [prevTimeLeft, setPrevTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef(targetDate.getTime());
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimatedRef = useRef(false);

  // Update target time ref when prop changes
  useEffect(() => {
    targetTimeRef.current = targetDate.getTime();
  }, [targetDate]);

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const difference = targetTimeRef.current - now;

    setPrevTimeLeft(timeLeft);

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [timeLeft]);

  // Entrance animation
  useEffect(() => {
    if (!containerRef.current || hasAnimatedRef.current) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    hasAnimatedRef.current = true;

    const units = containerRef.current.querySelectorAll(".time-unit");

    gsap.fromTo(
      units,
      {
        opacity: 0,
        y: 30,
        scale: 0.8,
        rotateX: -45,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)",
        delay: 0.5,
      }
    );
  }, []);

  useEffect(() => {
    calculateTimeLeft();
    intervalRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pause timer when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      } else {
        calculateTimeLeft();
        intervalRef.current = setInterval(calculateTimeLeft, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [calculateTimeLeft]);

  const timeUnits = [
    { label: "Days", value: timeLeft.days, prevValue: prevTimeLeft.days },
    { label: "Hours", value: timeLeft.hours, prevValue: prevTimeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes, prevValue: prevTimeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds, prevValue: prevTimeLeft.seconds },
  ];

  return (
    <div
      ref={containerRef}
      className="countdown absolute left-1/2 -translate-x-1/2 bottom-[90px] sm:bottom-[clamp(40px,7vw,55px)] min-[450px]:left-[clamp(20px,5vw,50px)] min-[450px]:translate-x-0 flex gap-[clamp(16px,5vw,40px)]"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      style={{ perspective: "1000px" }}
    >
      {timeUnits.map((unit, index) => (
        <div key={unit.label} className="time-unit">
          <TimeUnit
            value={unit.value}
            prevValue={unit.prevValue}
            label={unit.label}
            showSeparator={index !== timeUnits.length - 1}
          />
        </div>
      ))}
    </div>
  );
});
