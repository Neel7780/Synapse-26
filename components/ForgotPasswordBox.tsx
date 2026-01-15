"use client"

interface ForgotPasswordBoxProps {
  goLogin: () => void
  goRegister: () => void
  goOtp: () => void
}

export default function ForgotPasswordBox({ goLogin, goRegister, goOtp }: ForgotPasswordBoxProps) {
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

      {/* Reset Password Form */}
      <div className="space-y-6 mt-6">
        {/* Email Input */}
        <input
          type="email"
          placeholder="E.g. rsharma@gmail.com"
          className="w-full px-4 py-3 bg-transparent border border-white rounded-md text-white font-poppins placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
        />

        {/* Get OTP Button */}
        <button
          className="w-full bg-white text-black hover:bg-gray-100 font-jqka text-2xl h-12 rounded-md transition-colors cursor-pointer"
          type="button"
          onClick={goOtp}
        >
          Get OTP
        </button>

        {/* Sign Up Link */}
        <p className="text-center font-sans text-white text-sm">
          Don&apos;t have an account?{" "}
          <button
            onClick={goRegister}
            className="text-red-500 hover:text-red-400 font-semibold cursor-pointer"
          >
            Sign up
          </button>
        </p>

        {/* Back to login link */}
        <p className="text-center">
          <button
            onClick={goLogin}
            className="text-white/80 text-sm underline hover:text-white cursor-pointer"
          >
            Back to login
          </button>
        </p>
      </div>
    </div>
  )
}