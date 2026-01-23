"use client";

import { useState, useRef } from "react";

interface RegisterBoxProps {
  goLogin: () => void;
  goOtp: (email: string) => void;
}

export default function RegisterBox({ goLogin, goOtp }: RegisterBoxProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    countryCode: "91",
    phone: "",
    dob: "",
    gender: "",
    college: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const dobRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6)
      return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.countryCode + formData.phone,
          college: formData.college,
          gender: formData.gender,
          dob: formData.dob,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Move to OTP verification screen
      goOtp(formData.email);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during registration");
      }
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {/* Registration Form - Spacing kept tight (p-5, space-y-3) */}
      <form
        onSubmit={handleSubmit}
        className="space-y-2 border border-white/20 p-5 rounded-lg"
      >
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="E.g. Aditya"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="E.g. Sharma"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
            disabled={isLoading}
          />
        </div>

        {/* Phone Number */}
        <div className="flex gap-2">
          <select
            value={formData.countryCode}
            onChange={(e) => handleChange("countryCode", e.target.value)}
            className="w-24 px-2 py-2 bg-transparent border border-white/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
            disabled={isLoading}
          >
            <option value="91" className="bg-black text-white">
              +91
            </option>
            <option value="1" className="bg-black text-white">
              +1
            </option>
            <option value="44" className="bg-black text-white">
              +44
            </option>
          </select>
          <input
            type="tel"
            placeholder="12345 67890"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="flex-1 px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 w-full focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
            disabled={isLoading}
          />
        </div>

        {/* Date of Birth and Gender */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <input
              ref={dobRef}
              type={formData.dob ? "date" : "text"}
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              placeholder="DOB: DD/MM/YYYY"
              value={formData.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
              className={`w-full px-3 py-2 bg-transparent border border-white/30 rounded-md
      placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50
      pr-7 text-sm disabled:opacity-50 [color-scheme:dark]
      ${formData.dob ? "text-white text-left" : "text-gray-500 text-left"}
    `}
              disabled={isLoading}
            />

            {/* Calendar icon — ALWAYS visible */}
            <svg
              onClick={() => {
                if (dobRef.current) {
                  dobRef.current.type = "date";
                  dobRef.current.focus();
                  if ("showPicker" in dobRef.current) {
                    (dobRef.current as HTMLInputElement & {
                      showPicker: () => void;
                    }).showPicker();
                  }
                }
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5
      text-gray-500 cursor-pointer hover:text-white transition-colors"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <select
            value={formData.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className={`w-full px-3 py-2 bg-transparent border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50 ${formData.gender ? "text-white" : "text-gray-500"
              }`}
            disabled={isLoading}
          >
            <option value="" className="bg-black text-gray-500">
              Gender
            </option>
            <option value="male" className="bg-black text-white">
              Male
            </option>
            <option value="female" className="bg-black text-white">
              Female
            </option>
            <option value="other" className="bg-black text-white">
              Other
            </option>
          </select>
        </div>

        {/* College Name */}
        <input
          type="text"
          placeholder="College Name"
          value={formData.college}
          onChange={(e) => handleChange("college", e.target.value)}
          className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
          disabled={isLoading}
        />

        {/* Email */}
        <input
          type="email"
          placeholder="E.g. rsharma@gmail.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 text-base disabled:opacity-50"
          disabled={isLoading}
          required
        />

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-8 text-base disabled:opacity-50"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            disabled={isLoading}
          >
            {showPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            className="w-full px-3 py-2 bg-transparent border border-white/30 rounded-md text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-8 text-base disabled:opacity-50"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            disabled={isLoading}
          >
            {showConfirmPassword ? (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Get OTP Button - Font increased to text-2xl */}
        <button
          className="w-full bg-white text-black hover:bg-gray-100 text-2xl h-10 rounded-md transition-colors cursor-pointer font-jqka mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          type="submit"
          disabled={isLoading}
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
            "Get OTP"
          )}
        </button>

        {/* Login Link - Font increased to text-sm */}
        <p className="text-center text-white text-sm font-sans">
          If you already have an account?{" "}
          <button
            onClick={goLogin}
            className="text-red-500 hover:text-red-400 font-poppins font-semibold cursor-pointer"
            disabled={isLoading}
            type="button"
          >
            Log In
          </button>
        </p>
      </form>
    </div>
  );
}
