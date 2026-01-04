"use client"

import Image from "next/image"
import Link from "next/link"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/joker.jpg" alt="Joker Cards Background" fill className="object-cover" priority />
        {/* Dice Logo Overlay */}
        <div className="absolute top-8 left-8">
          <svg
            width="60"
            height="60"
            viewBox="0 0 60 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <rect x="15" y="15" width="30" height="30" rx="4" stroke="currentColor" strokeWidth="3" fill="none" />
            <circle cx="22" cy="22" r="3" fill="currentColor" />
            <circle cx="38" cy="22" r="3" fill="currentColor" />
            <circle cx="22" cy="38" r="3" fill="currentColor" />
            <circle cx="38" cy="38" r="3" fill="currentColor" />
            <circle cx="30" cy="30" r="3" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* Right Side - Reset Password Form */}
      <div className="w-full lg:w-1/2 bg-black flex items-center justify-center p-8">
        <div className="w-full max-w-[582px] space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 mb-29">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider font-card">
              RESET YOUR
              <br />
              PASSWORD
            </h1>
          </div>

          {/* Reset Password Form */}
          <div className="space-y-6 mt-6">
            {/* Email Input */}
            <input
              type="email"
              placeholder="E.g. rsharma@gmail.com"
              className="w-full px-4 py-3 bg-transparent border border-white rounded-md text-white font-card placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
            />

            {/* Get OTP Button */}
            <button className="w-full bg-white text-black hover:bg-gray-100 font-semibold text-lg h-12 rounded-md transition-colors">
            <Link href="/otp" />
              Get OTP
            </button>

            {/* Sign Up Link */}
            <p className="text-center font-card text-white text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-red-500 hover:text-red-400 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
