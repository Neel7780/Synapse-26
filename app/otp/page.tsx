"use client"

import type React from "react"

import { useState, useRef, type KeyboardEvent, type ClipboardEvent } from "react"
import Image from "next/image"

export default function OTPPage() {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0]
    }

    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = [...otp]
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char
      }
    })
    setOtp(newOtp)

    const lastIndex = Math.min(pastedData.length, 5)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] OTP submitted:", otp.join(""))
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Joker Card Image */}
      <div className="relative hidden w-1/2 lg:block">
        <Image src="/joker.jpg" alt="Joker Card" fill className="object-cover" priority />
        {/* Dice Logo */}
        <div className="absolute left-8 top-8">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M30 5L50 15V35L30 45L10 35V15L30 5Z" fill="white" stroke="white" strokeWidth="2" />
            <circle cx="30" cy="22" r="3" fill="black" />
            <circle cx="22" cy="30" r="3" fill="black" />
            <circle cx="38" cy="30" r="3" fill="black" />
            <circle cx="30" cy="38" r="3" fill="black" />
          </svg>
        </div>
      </div>

      {/* Right Side - OTP Form */}
      <div className="flex w-full items-center justify-center bg-[#050505] px-8 lg:w-1/2">
        <div className="w-full max-w-[542px]">
          <h1 className="font-card mb-12 text-center text-5xl leading-tight tracking-wide text-white">
            THE CARDS ARE DEALT
            <br />
            JOIN IN
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instructions */}
            <div className="mb-8 text-center">
              <p className="font-roboto text-sm text-white/80">
                Enter the code from the SMS sent
                <br />
                to the email
              </p>
              <p className="font-roboto mt-1 text-sm text-white/80">XXXXXX781@gmail.com</p>
            </div>

            {/* OTP Input Boxes */}
            <div className="mb-6 flex justify-center gap-[18px]">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-[95px] w-[68px] rounded border border-white/20 bg-transparent text-center font-card text-3xl text-white transition-colors focus:border-white focus:outline-none"
                />
              ))}
            </div>

            {/* Resend Code Link */}
            <div className="mb-8 text-center">
              <button type="button" className="font-roboto text-sm text-white underline hover:text-white/80">
                Send the code again
              </button>
            </div>

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full rounded bg-white py-4 font-card text-lg font-semibold text-black transition-colors hover:bg-white/90"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
