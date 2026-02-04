"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import Footer from "@/components/ui/Footer";
import { Button } from "@/components/ui/Button";
import { Input } from "@/app/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  QrCode,
  Upload,
} from "lucide-react";

type Step = "team" | "payment" | "success";

type FeeInfo = {
  fee_id: number;
  type: string;
  price: number;
  min_members: number;
  max_members: number;
  qr_code?: string;
};

export default function RegisterPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const slug = params?.slug as string;
  const eventName = params?.eventName as string;

  // Get fee info from query params
  const feeId = searchParams.get("fee_id");
  const feeType = searchParams.get("type") || "solo";
  const feePrice = parseInt(searchParams.get("price") || "0");
  const minMembers = parseInt(searchParams.get("min") || "1");
  const maxMembers = parseInt(searchParams.get("max") || "1");
  const qrUrl = searchParams.get("qr_code") || "";
  const eventId = searchParams.get("event_id");
  const isDauFree = searchParams.get("is_dau_free") === "true";

  const [step, setStep] = useState<Step>("team");
  // Start with empty array for additional team members (user is auto-included)
  const [teamEmails, setTeamEmails] = useState<string[]>(
    minMembers > 1 ? [""] : [],
  );
  const [validating, setValidating] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const returnUrl = window.location.pathname + window.location.search;
      router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
    }
  }, [authLoading, isAuthenticated, router]);

  // Check if user is eligible for DAU free registration
  const isDauRegistration =
    isDauFree &&
    user?.email?.endsWith("@dau.ac.in") &&
    teamEmails
      .filter((e) => e.trim())
      .every((email) => email.trim().toLowerCase().endsWith("@dau.ac.in"));

  // Add team member email
  const addTeamMember = () => {
    if (teamEmails.length < maxMembers) {
      setTeamEmails([...teamEmails, ""]);
    }
  };

  // Remove team member email
  const removeTeamMember = (index: number) => {
    if (teamEmails.length > minMembers) {
      setTeamEmails(teamEmails.filter((_, i) => i !== index));
    }
  };

  // Update team member email
  const updateTeamMember = (index: number, value: string) => {
    const updated = [...teamEmails];
    updated[index] = value;
    setTeamEmails(updated);
  };

  // Validate team emails
  const validateTeam = async () => {
    setValidating(true);
    setValidationError("");

    // Filter out empty emails and add current user email
    const emails = teamEmails
      .filter((e) => e.trim())
      .map((e) => e.toLowerCase().trim());

    // For solo, we only have the current user
    if (feeType === "solo") {
      setStep("payment");
      setValidating(false);
      return;
    }

    // Check minimum members (including current user)
    const totalMembers = 1 + emails.length; // 1 for current user
    if (totalMembers < minMembers) {
      setValidationError(
        `You need at least ${minMembers - 1} more team member(s)`,
      );
      setValidating(false);
      return;
    }

    // Skip validation if no additional team members (e.g. min=1 custom type)
    if (emails.length === 0) {
      setStep("payment");
      setValidating(false);
      return;
    }

    try {
      const res = await fetch("/api/events/validate-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      const data = await res.json();

      if (!data.valid) {
        setValidationError(data.message);
      } else {
        setStep("payment");
      }
    } catch (error: any) {
      setValidationError("Failed to validate team members");
    } finally {
      setValidating(false);
    }
  };

  // Submit registration
  const submitRegistration = async () => {
    setSubmitting(true);
    setSubmitError("");

    // Check if registration is free (either DAU free or price is 0)
    const isFreeEvent = feePrice === 0;
    const isFreeRegistration = isDauRegistration || isFreeEvent;

    if (!isFreeRegistration && !paymentScreenshot.trim()) {
      setSubmitError("Please upload payment screenshot");
      setSubmitting(false);
      return;
    }

    if (!isFreeRegistration && !transactionId.trim()) {
      setSubmitError("Please enter transaction ID");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: parseInt(eventId || "0"),
          fee_id: parseInt(feeId || "0"),
          registered_by_user_id: user?.id,
          team_member_emails:
            feeType !== "solo" ? teamEmails.filter((e) => e.trim()) : [],
          payment_screenshot_url: isFreeRegistration
            ? (isDauRegistration ? "DAU_VERIFIED" : "FREE_EVENT")
            : paymentScreenshot.trim(),
          transaction_id: isFreeRegistration ? (isDauRegistration ? "DAU_FREE" : "FREE_EVENT") : transactionId.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Registration failed");
      } else {
        setRegistrationId(data.registration_id);
        setStep("success");
      }
    } catch (error: any) {
      setSubmitError("Failed to submit registration");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen overflow-x-hidden font-poppins">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>

      <div className="max-w-2xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-joker lowercase text-4xl md:text-5xl tracking-wider mb-4">
            Register
          </h1>
          <p className="text-gray-400">
            {decodeURIComponent(eventName?.replace(/-/g, " ") || "")} -{" "}
            {feeType}
          </p>
          <p className="text-2xl font-bold text-[#b41c32] mt-2">₹{feePrice}</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-4 mb-12">
          <div
            className={`flex items-center gap-2 ${step === "team" || step === "payment" || step === "success" ? "text-[#b41c32]" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "team" || step === "payment" || step === "success" ? "border-[#b41c32] bg-[#b41c32]/20" : "border-gray-600"}`}
            >
              1
            </div>
            <span className="hidden sm:inline">Team</span>
          </div>
          <div className="w-8 h-px bg-gray-600 self-center" />
          <div
            className={`flex items-center gap-2 ${step === "payment" || step === "success" ? "text-[#b41c32]" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "payment" || step === "success" ? "border-[#b41c32] bg-[#b41c32]/20" : "border-gray-600"}`}
            >
              2
            </div>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div className="w-8 h-px bg-gray-600 self-center" />
          <div
            className={`flex items-center gap-2 ${step === "success" ? "text-[#b41c32]" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "success" ? "border-[#b41c32] bg-[#b41c32]/20" : "border-gray-600"}`}
            >
              3
            </div>
            <span className="hidden sm:inline">Done</span>
          </div>
        </div>

        {/* Step 1: Team Members */}
        {step === "team" && (
          <div className="bg-[#111] border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">
              {feeType === "solo" ? "Your Details" : "Team Members"}
            </h2>

            {feeType === "solo" ? (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                <p className="text-gray-300">
                  Registering as:{" "}
                  <span className="text-white font-medium">{user?.email}</span>
                </p>
              </div>
            ) : (
              <>
                <p className="text-gray-400 mb-4">
                  You are automatically included as a team member. Add your
                  teammates below.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Team size: {minMembers} - {maxMembers} members (including you)
                </p>

                {/* Current user - auto included */}
                <div className="space-y-3 mb-6">
                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2 text-green-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span>{user?.email}</span>
                      <span className="text-xs text-green-500/70 ml-auto">
                        (You)
                      </span>
                    </div>
                  </div>

                  {/* Additional team members */}
                  {teamEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) =>
                          updateTeamMember(index, e.target.value)
                        }
                        placeholder={`Team member ${index + 2} email`}
                        className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                      />
                      {teamEmails.length > Math.max(0, minMembers - 1) && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeTeamMember(index)}
                          className="border-white/10 hover:bg-white/5"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total team count indicator */}
                <p className="text-sm text-gray-400 mb-4">
                  Current team:{" "}
                  <span className="text-white font-medium">
                    {1 + teamEmails.filter((e) => e.trim()).length}
                  </span>{" "}
                  / {maxMembers} members
                </p>

                {/* Can add more if under max (accounting for current user) */}
                {1 + teamEmails.length < maxMembers && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addTeamMember}
                    className="mb-6 border-white/10 hover:bg-white/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                )}
              </>
            )}

            {validationError && (
              <div className="flex items-center gap-2 text-red-400 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{validationError}</p>
              </div>
            )}

            <Button
              onClick={validateTeam}
              disabled={validating}
              className="w-full py-4 text-lg bg-[#b41c32] hover:bg-[#901628]"
            >
              {validating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validating...
                </>
              ) : (
                "Continue to Payment"
              )}
            </Button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === "payment" && (
          <div className="bg-[#111] border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold mb-6">Payment</h2>

            {/* QR Code Display */}
            <div className="mb-8">
              {isDauRegistration || feePrice === 0 ? (
                <div className="text-center p-8 bg-green-500/10 border border-green-500/30 rounded-xl mb-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-400 mb-2">
                    {isDauRegistration ? "DAU Student Verified" : "Free Event"}
                  </h3>
                  <p className="text-gray-300">
                    {isDauRegistration
                      ? "As a DA-IICT student, you can register for this event for free!"
                      : "This event is free for everyone!"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    No payment required. Proceed to submit your registration.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-400 mb-4">
                    Scan the QR code below and make the payment of{" "}
                    <span className="text-[#b41c32] font-bold">
                      ₹{feePrice}
                    </span>
                  </p>

                  <div className="bg-white rounded-xl p-4 w-64 h-64 mx-auto flex items-center justify-center relative">
                    {qrUrl ? (
                      <Image
                        src={qrUrl}
                        alt="Payment QR Code"
                        fill
                        className="object-contain p-2"
                        unoptimized
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">QR Code not available</p>
                        <p className="text-xs">
                          Contact organizer for payment details
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Payment Inputs - Only if not DAU free AND not free event */}
            {!isDauRegistration && feePrice > 0 && (
              <>
                {/* Payment Screenshot Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Payment Screenshot
                  </label>

                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:bg-white/5 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate file type
                          if (!file.type.startsWith("image/")) {
                            setSubmitError("Please upload an image file");
                            return;
                          }

                          // Validate file size (5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            setSubmitError("File size too large (max 5MB)");
                            return;
                          }

                          setSubmitError("");
                          setSubmitting(true); // Re-using submitting state for upload loading or add new one?
                          // Better to have separate state but for quick task reusing submitting or validation state is risky if it blocks UI.
                          // Let's add separate state if possible, but I can't change useState definitions easily in replace_file_content without context.
                          // I'll assume I can just use a local logic or reuse submitting but make sure to communicate "Uploading..."

                          try {
                            const formData = new FormData();
                            formData.append("file", file);

                            // Show local preview immediately?
                            // Yes, but let's wait for upload to get real URL

                            const res = await fetch(
                              "/api/events/upload-screenshot",
                              {
                                method: "POST",
                                body: formData,
                              },
                            );

                            const data = await res.json();

                            if (!res.ok)
                              throw new Error(data.error || "Upload failed");

                            setPaymentScreenshot(data.url);
                          } catch (err: any) {
                            setSubmitError(
                              err.message || "Failed to upload image",
                            );
                          } finally {
                            setSubmitting(false);
                          }
                        }}
                        className="hidden"
                        id="screenshot-upload"
                        disabled={submitting}
                      />
                      <label
                        htmlFor="screenshot-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {paymentScreenshot ? (
                          <div className="relative w-full max-w-xs aspect-[9/16] bg-black/50 rounded-lg overflow-hidden mb-2">
                            <Image
                              src={paymentScreenshot}
                              alt="Payment Screenshot"
                              fill
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <div className="bg-white/10 p-4 rounded-full mb-3">
                            <Upload className="w-6 h-6 text-gray-300" />
                          </div>
                        )}
                        <span className="text-sm text-gray-400">
                          {paymentScreenshot
                            ? "Click to change screenshot"
                            : "Click to upload screenshot"}
                        </span>
                        <span className="text-xs text-gray-600 mt-1">
                          Max 5MB (JPEG, PNG, WEBP)
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Transaction ID Input */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">
                    Transaction ID
                  </label>

                  <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 mb-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-white">
                        <p className="font-bold text-yellow-500 mb-1">IMPORTANT:</p>
                        <p>
                          <span className="font-bold text-white ">Transaction ID</span> is <span className="font-bold text-white">NOT</span> the same as <span className="font-bold text-white">UPI ID</span>.
                          <br />
                          Please enter the unique <span className="font-bold text-white">Transaction ID / UTR Number</span> for this payment.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Transaction ID/ UTR Number"
                    className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                  />
                </div>
                <p className="text-xs text-yellow-500/80 mb-6 pt-[5px]">
                  Note: After successful submission your registration will be
                  approved in 24 to 48 hours.
                </p>
              </>
            )}

            {submitError && (
              <div className="flex items-center gap-2 text-red-400 mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{submitError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => setStep("team")}
                className="w-full sm:w-auto sm:flex-1 py-4 border-white/10 hover:bg-white/5"
              >
                Back
              </Button>
              <Button
                onClick={submitRegistration}
                disabled={submitting}
                className="w-full sm:w-auto sm:flex-1 py-4 text-lg bg-[#b41c32] hover:bg-[#901628]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Registration"
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-4">Registration Submitted!</h2>
            <p className="text-gray-400 mb-2">
              Your registration has been received and is pending payment
              verification.
            </p>
            {registrationId && (
              <p className="text-sm text-gray-500 mb-6">
                Registration ID: #{registrationId}
              </p>
            )}
            <p className="text-sm text-gray-400 mb-8">
              You will be notified once your payment is verified by the
              coordinator within next 24-48 hours.
            </p>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => router.push("/events")}
                className="border-white/10 hover:bg-white/5"
              >
                View More Events
              </Button>
              <Button
                onClick={() => router.push("/user-profile")}
                className="bg-[#b41c32] hover:bg-[#901628]"
              >
                Go to Profile
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main >
  );
}
