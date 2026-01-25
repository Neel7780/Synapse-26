"use client";

import type React from "react";
import {
  useState,
  useRef,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface OtpBoxProps {
  email: string;
  otpType?: "signup" | "recovery";
  goLogin: () => void;
}

export default function OtpBox({
  email,
  otpType = "signup",
  goLogin,
}: OtpBoxProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError(null);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          token: otpCode,
          type: otpType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setSuccess("Email verified successfully! Redirecting...");

      // Redirect based on verification type
      setTimeout(() => {
        if (otpType === "recovery") {
          // For password recovery, they'll be redirected to update password page
          router.push("/auth/update-password");
        } else {
          // For signup verification, redirect to user profile (user stays logged in)
          const next = searchParams.get("next");
          const redirect = searchParams.get("redirect");
          router.push(next || redirect || "/user-profile");
        }
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during verification");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setSuccess(null);
    setIsResending(true);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type: otpType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setSuccess("Verification code resent successfully!");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to resend verification code");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="font-joker mb-12 text-center text-4xl leading-tight tracking-wide text-white">
        the cards are dealt
        <br />
        join in
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Instructions */}
        <div className="mb-8 text-center">
          <p className="font-poppins text-sm text-white/80">
            Enter the code from the email sent
            <br />
            to{" "}
            <span className="text-white font-medium">
              {email || "your email"}
            </span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-400 text-sm text-center">
            {success}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="mb-6 flex justify-center gap-[18px]">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              disabled={isLoading}
              className="h-[60px] w-[35px] md:w-[45px] lg:h-[95px] lg:w-[68px] rounded border border-white/70 bg-transparent text-center font-card text-3xl text-white transition-colors focus:border-white focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        {/* Resend Code Link */}
        <div className="mb-8 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={isLoading || isResending}
            className="font-poppins text-sm text-white underline hover:text-white/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? "Sending..." : "Send the code again"}
          </button>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded bg-white py-4 font-jqka text-2xl cursor-pointer text-black transition-colors hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <svg
              className="animate-spin h-6 w-6 text-black"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            "Continue"
          )}
        </button>

        {/* Back to login link */}
        <p className="mt-4 text-center">
          <button
            onClick={goLogin}
            disabled={isLoading}
            type="button"
            className="text-white/80 text-sm underline hover:text-white cursor-pointer disabled:opacity-50"
          >
            Back to login
          </button>
        </p>
      </form>
    </div>
  );
}
