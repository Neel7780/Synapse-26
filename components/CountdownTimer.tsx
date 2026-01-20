"use client";

import { useEffect, useState, useRef, memo, useCallback } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}

// Memoized time unit component to prevent unnecessary re-renders
const TimeUnit = memo(function TimeUnit({
  value,
  label,
  showSeparator,
}: {
  value: number;
  label: string;
  showSeparator: boolean;
}) {
  return (
    <div className="relative flex flex-col gap-3 items-center">
      <div
        className="
          font-joker
          leading-none
          tabular-nums
          text-[clamp(1.4rem,4.5vw,2.4rem)]
        "
      >
        {value.toString().padStart(2, "0")}
      </div>
      <div
        className="
          font-joker
          opacity-85
          text-[clamp(0.65rem,2vw,1rem)]
        "
      >
        {label}
      </div>
      {showSeparator && (
        <span
          className="
            absolute
            left-full
            translate-x-[200%]
            font-joker
            leading-none
            text-[clamp(1.4rem,4.5vw,2.4rem)]
          "
          aria-hidden="true"
        >
          :
        </span>
      )}
    </div>
  );
});

export const CountdownTimer = memo(function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetTimeRef = useRef(targetDate.getTime());

  // Update target time ref when prop changes
  useEffect(() => {
    targetTimeRef.current = targetDate.getTime();
  }, [targetDate]);

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const difference = targetTimeRef.current - now;

    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    } else {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      // Clear interval when countdown is complete
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, []);

  useEffect(() => {
    calculateTimeLeft();
    intervalRef.current = setInterval(calculateTimeLeft, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [calculateTimeLeft]);

  // Pause timer when tab is not visible to save resources
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
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div
      className="
        countdown absolute
        left-1/2 -translate-x-1/2
        bottom-[90px]
        sm:bottom-[clamp(40px,7vw,55px)]
        min-[450px]:left-[clamp(20px,5vw,50px)]
        min-[450px]:translate-x-0
        flex
        gap-[clamp(12px,4vw,36px)]
      "
      role="timer"
      aria-live="polite"
      aria-atomic="true"
    >
      {timeUnits.map((unit, index) => (
        <TimeUnit
          key={unit.label}
          value={unit.value}
          label={unit.label}
          showSeparator={index !== timeUnits.length - 1}
        />
      ))}
    </div>
  );
});
