"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  return (
    <div className="min-h-screen flex bg-black">
      {/* Left Side - Image */}
      <div className="hidden md:flex w-1/2 relative bg-[#1a1a1a]">
        {/* Logo */}
        <div className="absolute top-6 left-6 z-10">
          <div className="relative w-14 h-14">
            <Image
              src="/Synapse Logo.png"
              alt="Synapse Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Background */}
        <Image
          src="/joker.jpg"
          alt="Joker Card"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-black" />
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-5">
          {/* Header */}
          <div className="text-center space-y-1 font-joker">
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
              the cards are dealt
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-wider">
              join in
            </h2>
          </div>

          {/* Form */}
          <div className="space-y-4 border border-white/20 p-6 rounded-lg">
            {/* Name */}
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="First name" />
              <input className="input" placeholder="Last name" />
            </div>

            {/* Phone */}
            <div className="flex gap-2">
              <select className="select w-28">
                <option className="bg-black">+91</option>
                <option className="bg-black">+1</option>
                <option className="bg-black">+44</option>
              </select>
              <input className="input flex-1" placeholder="Phone number" />
            </div>

            {/* DOB + Gender */}
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="DOB (DD/MM/YYYY)" />
              <select className="select">
                <option className="bg-black">Gender</option>
                <option className="bg-black">Male</option>
                <option className="bg-black">Female</option>
                <option className="bg-black">Other</option>
              </select>
            </div>

            {/* College */}
            <input className="input" placeholder="College / University" />

            {/* Email */}
            <input className="input" type="email" placeholder="Email address" />

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="eye-btn"
              >
                👁
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input pr-10"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="eye-btn"
              >
                👁
              </button>
            </div>

            {/* Button */}
            <button className="w-full h-11 bg-white text-black hover:bg-gray-100 text-xl rounded-md font-jqka">
              Get OTP
            </button>

            {/* Login */}
            <p className="text-center text-white text-sm">
              Already registered?{" "}
              <Link href="/login" className="text-red-500 font-semibold">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Shared styles */}
      <style jsx>{`
        .input {
          width: 100%;
          padding: 0.6rem 1rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 0.375rem;
          color: white;
          font-size: 0.95rem;
        }
        .select {
          padding: 0.6rem 0.75rem;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 0.375rem;
          color: white;
          font-size: 0.95rem;
        }
        .eye-btn {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.7);
        }
      `}</style>
    </div>
  )
}
