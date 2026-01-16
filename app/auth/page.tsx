"use client";

import type React from "react";
import { useState } from "react";
import LoginBox from "@/components/LoginBox";
import RegisterBox from "@/components/RegisterBox";
import OtpBox from "@/components/OtpBox";
import ForgotPasswordBox from "@/components/ForgotPasswordBox";
import Link from "next/link";
import Image from "next/image";

type View = "login" | "register" | "otp" | "forgot";

export default function AuthFlipPage() {
  const [view, setView] = useState<View>("login");
  const [pendingEmail, setPendingEmail] = useState<string>("");
  const [otpType, setOtpType] = useState<"signup" | "recovery">("signup");

  const handleGoToOtp = (
    email: string,
    type: "signup" | "recovery" = "signup"
  ) => {
    setPendingEmail(email);
    setOtpType(type);
    setView("otp");
  };

  return (
    <div className="flex min-h-[100dvh]">
      {/* Left Side - Joker Card Image (shared) */}
      <div className="fixed hidden md:flex md:w-1/2 h-full bg-[#1a1a1a]">
        {/* Dice Logo */}
        <div className="absolute top-8 left-8 z-10">
          <div className="relative w-16 h-16">
            <Link href="/">
              <Image
                src="/Synapse Logo.png"
                alt="Synapse Logo"
                fill
                className="object-contain"
                priority
              />
            </Link>
          </div>
        </div>

        {/* Joker Card Background Image */}
        <Image
          src="/joker.jpg"
          alt="Joker Card"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-black pointer-events-none" />
      </div>

      {/* Right Side - Flip Container */}
      <div className="flex max-h-[100dvh] w-full md:w-1/2 md:ml-auto items-center justify-center bg-[#050505] px-6 py-12">
        <div className="w-full max-w-[582px] [perspective:1200px] flex items-center justify-center min-h-[600px]">
          <div
            className={`
              relative w-full
              transition-transform duration-700
              [transform-style:preserve-3d]
              ${
                view === "login" || view === "otp"
                  ? "[transform:rotateY(0deg)]"
                  : "[transform:rotateY(180deg)]"
              }
            `}
          >
            {/* FRONT: Login + OTP */}
            <div
              className={`[backface-visibility:hidden] flex items-center justify-center ${
                view === "login" || view === "otp"
                  ? "relative"
                  : "absolute inset-0"
              }`}
            >
              {view === "login" && (
                <LoginBox
                  goRegister={() => setView("register")}
                  goForgot={() => setView("forgot")}
                />
              )}
              {view === "otp" && (
                <OtpBox
                  email={pendingEmail}
                  otpType={otpType}
                  goLogin={() => setView("login")}
                />
              )}
            </div>

            {/* BACK: Register + Forgot */}
            <div
              className={`[backface-visibility:hidden] [transform:rotateY(180deg)] flex items-center justify-center ${
                view === "register" || view === "forgot"
                  ? "relative"
                  : "absolute inset-0"
              }`}
            >
              {view === "register" && (
                <RegisterBox
                  goLogin={() => setView("login")}
                  goOtp={(email: string) => handleGoToOtp(email, "signup")}
                />
              )}
              {view === "forgot" && (
                <ForgotPasswordBox
                  goLogin={() => setView("login")}
                  goRegister={() => setView("register")}
                  goOtp={(email: string) => handleGoToOtp(email, "recovery")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
