"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";

function UpdatePasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExchangingCode, setIsExchangingCode] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Check if we have a valid session (code exchange already done by /auth/callback)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          console.error("Session check error:", error);
          setError(
            "Session expired or invalid. Please request a new password reset link."
          );
        }
      } catch (err: any) {
        console.error("Session check exception:", err);
        setError("Failed to verify session. Please try again.");
      } finally {
        setIsExchangingCode(false);
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      // Check if we have a session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error(
          "Session expired. Please request a new password reset link."
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess("Password updated successfully! Redirecting to login...");

      // Sign out and redirect to login
      await supabase.auth.signOut();
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while exchanging code
  if (isExchangingCode) {
    return (
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="text-white">
          <svg
            className="animate-spin h-12 w-12 mx-auto mb-4"
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
          <p className="text-lg font-poppins">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-joker lowercase text-white tracking-wider">
          SET YOUR NEW
          <br />
          PASSWORD
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-md text-red-400 text-sm text-center">
          {error}
          {error.includes("expired") && (
            <div className="mt-2">
              <Link href="/auth" className="underline hover:text-red-300">
                Go back to request a new link
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-md text-green-400 text-sm text-center">
          {success}
        </div>
      )}

      {/* Form - only show if no critical error */}
      {!error?.includes("expired") && !error?.includes("No reset code") && (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* New Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-4 py-3 bg-transparent border border-white rounded-md text-white font-poppins placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-12 disabled:opacity-50"
              disabled={isLoading || !!success}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
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
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-3 bg-transparent border border-white rounded-md text-white font-poppins placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50 pr-12 disabled:opacity-50"
              disabled={isLoading || !!success}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
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

          {/* Update Password Button */}
          <button
            className="w-full bg-white text-black hover:bg-gray-100 font-jqka text-2xl h-12 rounded-md transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            type="submit"
            disabled={isLoading || !!success}
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
              "Update Password"
            )}
          </button>

          {/* Back to login link */}
          <p className="text-center">
            <Link
              href="/auth"
              className="text-white/80 text-sm underline hover:text-white"
            >
              Back to login
            </Link>
          </p>
        </form>
      )}

      {/* Back to login if error */}
      {(error?.includes("expired") || error?.includes("No reset code")) && (
        <p className="text-center mt-6">
          <Link
            href="/auth"
            className="text-white bg-white/10 px-6 py-3 rounded-md hover:bg-white/20 transition-colors"
          >
            Back to login
          </Link>
        </p>
      )}
    </div>
  );
}

import { useNavigationState } from "@/lib/useNavigationState";

export default function UpdatePasswordPage() {
  const { startTransition } = useNavigationState();
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Joker Card Image */}
      <div className="fixed hidden md:flex md:w-1/2 h-full bg-[#1a1a1a]">
        <div className="absolute top-8 left-8 z-10">
          <div className="relative w-16 h-16">
            <Link href="/" onClick={() => startTransition()}>
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

        <Image
          src="/joker.jpg"
          alt="Joker Card"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-r from-transparent to-black pointer-events-none" />
      </div>

      {/* Right Side - Update Password Form */}
      <div className="flex min-h-screen w-full md:w-1/2 md:ml-auto items-center justify-center bg-[#050505] px-6 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md text-center">
              <svg
                className="animate-spin h-12 w-12 mx-auto text-white"
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
            </div>
          }
        >
          <UpdatePasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
