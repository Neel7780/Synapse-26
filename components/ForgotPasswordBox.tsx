"use client";

import { useState } from "react";

interface ForgotPasswordBoxProps {
  goLogin: () => void;
  goRegister: () => void;
  goOtp?: (email: string) => void;
}

export default function ForgotPasswordBox({
  goLogin,
  goRegister,
}: ForgotPasswordBoxProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess("Password reset email sent! Please check your inbox.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 mb-29">
        <h1 className="text-3xl md:text-4xl font-joker lowercase text-white tracking-wider">
          RESET YOUR
          <br />
          PASSWORD
        </h1>
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

      {/* Reset Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        {/* Email Input */}
        <input
          type="email"
          placeholder="E.g. rsharma@gmail.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          className="w-full px-4 py-3 bg-transparent border border-white rounded-md text-white font-poppins placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
          disabled={isLoading}
          required
        />

        {/* Get OTP Button */}
        <button
          className="w-full bg-white text-black hover:bg-gray-100 font-jqka text-2xl h-12 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            "Send Reset Link"
          )}
        </button>

        {/* Sign Up Link */}
        <p className="text-center font-sans text-white text-sm">
          Don&apos;t have an account?{" "}
          <button
            onClick={goRegister}
            type="button"
            className="text-red-500 hover:text-red-400 font-semibold cursor-pointer"
            disabled={isLoading}
          >
            Sign up
          </button>
        </p>

        {/* Back to login link */}
        <p className="text-center">
          <button
            onClick={goLogin}
            type="button"
            className="text-white/80 text-sm underline hover:text-white cursor-pointer disabled:opacity-50"
            disabled={isLoading}
          >
            Back to login
          </button>
        </p>
      </form>
    </div>
  );
}
