"use client"

import { useState } from "react"

interface RegisterBoxProps {
  goLogin: () => void
  goOtp: () => void
}

export default function RegisterBox({ goLogin, goOtp }: RegisterBoxProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Header - Font increased */}
      <div className="text-center space-y-1 font-joker">
        <h1 className="text-3xl md:text-[40px] mb-6 font-bold text-white tracking-wider">
          the cards are dealt
        </h1>
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
          join in
        </h2>
      </div>

      {/* Registration Form - Spacing kept tight (p-5, space-y-3) */}
      <div className="space-y-2 border border-white/20 p-5 rounded-lg">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="E.g. Aditya"
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
          />
          <input
            type="text"
            placeholder="E.g. Sharma"
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
          />
        </div>

        {/* Phone Number */}
        <div className="flex gap-2">
          <select className="w-24 px-2 py-2 bg-transparent border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-base">
            <option value="91" className="bg-black">
              +91
            </option>
            <option value="1" className="bg-black">
              +1
            </option>
            <option value="44" className="bg-black">
              +44
            </option>
          </select>
          <input
            type="tel"
            placeholder="12345 67890"
            className="flex-1 px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 w-full focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
          />
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="DOB: DD/MM/YYYY"
              className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-8 text-base"
            />
            {/* SVG Icon */}
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <select className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-base">
            <option value="" className="bg-black">
              Gender
            </option>
            <option value="male" className="bg-black">
              Male
            </option>
            <option value="female" className="bg-black">
              Female
            </option>
            <option value="other" className="bg-black">
              Other
            </option>
          </select>
        </div>

        {/* College Name */}
        <input
          type="text"
          placeholder="College Name"
          className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="E.g. rsharma@gmail.com"
          className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base"
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-8 text-base"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          >
            {showPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-8 text-base"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          >
            {showConfirmPassword ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
          </button>
        </div>

        {/* Get OTP Button - Font increased to text-2xl */}
        <button
          className="w-full bg-white text-black hover:bg-gray-100 text-2xl h-10 rounded-md transition-colors cursor-pointer font-jqka mt-2"
          type="button"
          onClick={goOtp}
        >
          Get OTP
        </button>

        {/* Login Link - Font increased to text-sm */}
        <p className="text-center text-white text-sm font-sans">
          If you already have an account?{" "}
          <button
            onClick={goLogin}
            className="text-red-500 hover:text-red-400 font-poppins font-semibold cursor-pointer"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  )
}