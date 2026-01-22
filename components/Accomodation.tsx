"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Default fallback pricing if API fails
const DEFAULT_PRICING: Record<number, number> = {
  2: 2300,
  3: 2500,
  4: 2800,
};

// Default QR URL fallback
const DEFAULT_QR_URL = "";
// ... (rest of imports/constants)

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};


const generateFestivalDates = (exclude26Feb = false) => {
  const dates = [];

  for (let i = 26; i <= 28; i++) {
    if (exclude26Feb && i === 26) continue;

    dates.push({
      day: i,
      month: "Feb",
      date: new Date(2026, 1, i),
    });
  }

  dates.push({
    day: 1,
    month: "Mar",
    date: new Date(2026, 2, 1),
  });

  return dates;
};

const getAvailableDateRanges = (nights: number) => {
  const exclude26Feb = nights === 2 || nights === 3;
  const allDates = generateFestivalDates(exclude26Feb);

  const ranges = [];

  for (let i = 0; i <= allDates.length - nights; i++) {
    const rangeArray = allDates.slice(i, i + nights);
    const startDay = rangeArray[0].day;
    const endDay = rangeArray[nights - 1].day;
    const months = rangeArray.map((d) => d.month);

    let label = "";

    if (nights === 2) {
      const isSameMonth = months[0] === months[1];
      label = isSameMonth
        ? `${startDay} & ${endDay} ${months[0].toLowerCase()}`
        : `${startDay} ${months[0].toLowerCase()} & ${endDay} ${months[1].toLowerCase()}`;
    } else {
      const isSameMonth = months.every((m) => m === months[0]);
      label = isSameMonth
        ? `${rangeArray.map((d) => d.day).join("-")} ${months[0].toLowerCase()}`
        : rangeArray
          .map((d) => `${d.day} ${d.month.toLowerCase()}`)
          .join(" - ");
    }

    ranges.push({
      startIndex: i,
      endIndex: i + nights - 1,
      startDay,
      endDay,
      label,
      days: rangeArray.map((d) => d.day),
      startDate: rangeArray[0].date,
      endDate: rangeArray[nights - 1].date,
    });
  }

  return ranges;
};

type Step = "dates" | "payment" | "success";

type AccommodationPackage = {
  id: number;
  package_name: string;
  nights: number;
  price: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  qr_code?: string;
};

export function AccommodationComponent() {
  type Range = {
    startIndex: number;
    endIndex: number;
    startDay: number;
    endDay: number;
    label: string;
    days: number[];
    startDate: Date;
    endDate: Date;
  };

  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [step, setStep] = useState<Step>("dates");
  const [selectedNights, setSelectedNights] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);
  const [paymentScreenshot, setPaymentScreenshot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);

  // API-fetched state
  const [packages, setPackages] = useState<AccommodationPackage[]>([]);
  const [pricing, setPricing] = useState<Record<number, number>>(DEFAULT_PRICING);
  const [qrUrl, setQrUrl] = useState<string>(DEFAULT_QR_URL);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch accommodation data from APIs
  useEffect(() => {
    const fetchAccommodationData = async () => {
      try {
        // Fetch packages from accommodation_type table
        const packagesRes = await fetch("/api/accommodation/packages");

        // Process packages
        if (packagesRes.ok) {
          const packagesData = await packagesRes.json();
          if (packagesData.packages && packagesData.packages.length > 0) {
            setPackages(packagesData.packages);

            // Build pricing map from packages
            const newPricing: Record<number, number> = {};
            let foundQrUrl: string | null = null;

            packagesData.packages.forEach((pkg: AccommodationPackage) => {
              // Extract nights from package_name (e.g., "2 Nights", "3 Nights Package")
              const nightsMatch = pkg.package_name.match(/(\d+)\s*nights?/i);
              if (nightsMatch && pkg.price) {
                const nights = parseInt(nightsMatch[1], 10);
                newPricing[nights] = pkg.price;
              }

              // Get QR code URL from the first package that has one
              if (!foundQrUrl && pkg.qr_code) {
                foundQrUrl = pkg.qr_code;
              }
            });

            // Only update if we got valid pricing data
            if (Object.keys(newPricing).length > 0) {
              setPricing(newPricing);
            }

            // Update QR URL if found in packages
            if (foundQrUrl) {
              setQrUrl(foundQrUrl);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching accommodation data:", error);
        // Fall back to defaults (already set)
      } finally {
        setDataLoading(false);
      }
    };

    fetchAccommodationData();
  }, []);

  // Get available night options from pricing
  const availableNights = useMemo(() => {
    return Object.keys(pricing).map(n => parseInt(n, 10)).sort((a, b) => a - b);
  }, [pricing]);

  const availableRanges = useMemo(
    () => (selectedNights ? getAvailableDateRanges(selectedNights) : []),
    [selectedNights]
  );

  const totalPrice = useMemo(
    () =>
      selectedNights ? (pricing[selectedNights] || 0) : 0,
    [selectedNights, pricing]
  );

  const festivalRange = useMemo(() => {
    const dates = generateFestivalDates();
    if (!dates.length) return "";
    const start = dates[0];
    const end = dates[dates.length - 1];
    const year = end.date.getFullYear();
    return `${start.day} ${start.month} - ${end.day} ${end.month} ${year}`;
  }, []);

  const handleNightSelection = (nights: number) => {
    if (selectedNights === nights) {
      setSelectedNights(null);
      setSelectedRange(null);
    } else {
      setSelectedNights(nights);
      setSelectedRange(null);
    }
  };

  const handleRangeSelection = (range: Range) => {
    if (selectedRange?.startIndex === range.startIndex) {
      setSelectedRange(null);
    } else {
      setSelectedRange(range);
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedRange || !selectedNights) {
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      const returnUrl = window.location.pathname;
      router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
      return;
    }

    setStep("payment");
  };

  const handleSubmitBooking = async () => {
    if (!paymentScreenshot.trim()) {
      setSubmitError("Please enter the payment screenshot URL or transaction ID");
      return;
    }

    if (!selectedRange || !selectedNights || !user) {
      setSubmitError("Missing booking information");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/accommodation/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          check_in: selectedRange.startDate.toISOString().split('T')[0],
          check_out: selectedRange.endDate.toISOString().split('T')[0],
          nights: selectedNights,
          amount: totalPrice,
          payment_screenshot_url: paymentScreenshot.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || "Booking failed");
      } else {
        setBookingId(data.booking_id);
        setStep("success");
      }
    } catch (error: any) {
      setSubmitError("Failed to submit booking");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] bg-black text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white font-jqka">
      {/* Header */}
      <div className="pb-6 md:pb-8 text-center px-4 overflow-hidden">
        <motion.h1
          initial={{ opacity: 0, y: -50, rotateX: 45 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }}
          viewport={{ once: false }}
          className="pt-5 text-3xl md:text-6xl lg:text-8xl font-joker mb-2"
        >
          accommodation
        </motion.h1>
      </div>

      {/* Progress Steps */}
      {step !== "dates" && (
        <div className="flex justify-center gap-4 mb-8 px-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white bg-white/20">
              1
            </div>
            <span className="hidden sm:inline">Dates</span>
          </div>
          <div className="w-8 h-px bg-gray-600 self-center" />
          <div className={`flex items-center gap-2 ${step === "payment" || step === "success" ? "text-white" : "text-gray-600"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "payment" || step === "success" ? "border-white bg-white/20" : "border-gray-600"}`}>
              2
            </div>
            <span className="hidden sm:inline">Payment</span>
          </div>
          <div className="w-8 h-px bg-gray-600 self-center" />
          <div className={`flex items-center gap-2 ${step === "success" ? "text-white" : "text-gray-600"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === "success" ? "border-white bg-white/20" : "border-gray-600"}`}>
              3
            </div>
            <span className="hidden sm:inline">Done</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Step: Dates Selection */}
        {step === "dates" && (
          <>
            {/* Night Selection */}
            <div className="mb-8 md:mb-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                viewport={{ once: false }}
              >
                <h2 className="text-xl md:text-2xl lg:text-3xl uppercase mb-4 md:mb-6">
                  Choose your accommodation
                </h2>
                <p className="text-sm md:text-base mb-4 text-white/70">
                  Festival dates: {festivalRange}
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              >
                {[2, 3, 4].map((nights) => (
                  <motion.button
                    key={nights}
                    variants={itemVariants}
                    onClick={() => handleNightSelection(nights)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 md:p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${selectedNights === nights
                      ? "border-2 border-white bg-white text-black"
                      : "border-2 border-white/30 hover:border-white"
                      }`}
                  >
                    <div className="text-xl md:text-2xl font-bold">
                      {nights} NIGHTS
                    </div>
                    <div className="text-lg md:text-xl">
                      ₹ {pricing[nights as keyof typeof pricing]}
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            </div>

            <AnimatePresence>
              {selectedNights && availableRanges.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 md:mb-12"
                >
                  <h3 className="text-xl md:text-2xl uppercase mb-4 md:mb-6">
                    Select Dates
                  </h3>

                  <div className="space-y-3 mb-6 md:mb-8">
                    {availableRanges.map((range, index) => (
                      <motion.label
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer hover:bg-white/5 transition-all"
                      >
                        <div className="w-5 md:w-6 h-6 bg-white flex items-center justify-center shrink-0">
                          {selectedRange?.startIndex === range.startIndex && (
                            <div className="w-5 h-6 md:w-6 text-blue-700 font-black text-lg md:text-xl text-center justify-center item-center font-jqka scale-125 select-none">
                              ✔
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleRangeSelection(range)}
                          className="flex-1 text-left text-spacing uppercase text-lg md:text-xl hover:text-white/80 cursor-pointer transition-colors"
                        >
                          {range.label}
                        </button>
                      </motion.label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Description */}
            <div className="mb-8 md:mb-12 py-6 md:py-8 border-t border-b border-white/20">
              <p className="text-xs md:text-sm leading-relaxed font-poppins">
                Accommodation includes full festival access for the selected stay
                dates.
              </p>
            </div>

            {/* Price & Book Button */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 mb-12 md:mb-16">
              <div className="flex justify-center align-center text-lg gap-[20px] md:text-2xl">
                <div className="flex items-center text-xl md:text-2xl lg:text-3xl uppercase text-white/70">
                  Amount-
                </div>
                <div className="flex items-center justify-center text-2xl md:text-3xl lg:text-4xl gap-2 border-2 border-[#0088FF] text-[#0088FF] px-4 py-1">
                  <span>₹</span>
                  <span className="font-bold">{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleProceedToPayment}
                disabled={!selectedRange}
                className="w-full md:w-auto bg-white text-black hover:bg-white/90 cursor-pointer px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl font-jqka uppercase disabled:opacity-50"
              >
                {isAuthenticated ? "Proceed to Payment" : "Login to Book"}
              </Button>
            </div>

            {/* Guidelines Section */}
            <motion.div
              className="bg-white/5 p-6 font-poppins md:p-8 rounded"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: false }}
            >
              <h3 className="text-2xl text-center underline md:text-3xl mb-4 md:mb-6 ">
                Guidelines
              </h3>
              <motion.ul
                className="space-y-3 md:space-y-4 text-xs md:text-sm leading-relaxed"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              >
                {[
                  "Accommodation passes are strictly non-refundable under any circumstances.",
                  "Accommodation will be allocated based on availability. The place assigned to you must be accepted as it is. No changes or requests for alternative arrangements will be entertained.",
                  "Keep your belongings secure. Organizers will not be responsible for any loss or damage.",
                  "Respect the property and maintain cleanliness—any damage caused will result in full accountability, including covering the cost of repairs or replacement.",
                  "On 26th February, accommodation will not be provided before 4:00 PM.",
                  "On 1st March, check-out will be before 9:00 AM. All guests must vacate the accommodation by this time."
                ].map((text, i) => (
                  <motion.li key={i} variants={itemVariants} className="flex gap-2 md:gap-3">
                    <span className="text-white/60 shrink-0">{i + 1})</span>
                    <span>{text}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          </>
        )}

        {/* Step: Payment */}
        {step === "payment" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl uppercase mb-4">Complete Payment</h2>
              <p className="text-white/70">
                Scan the QR code below to make payment of ₹{totalPrice.toLocaleString()}
              </p>
            </div>

            {/* Booking Summary */}
            <div className="bg-white/5 p-4 md:p-6 rounded-lg">
              <h3 className="text-lg md:text-xl uppercase mb-4">Booking Summary</h3>
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-white/70">Package:</span>
                  <span>{selectedNights} Nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Dates:</span>
                  <span>{selectedRange?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Check-in:</span>
                  <span>{selectedRange?.startDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Check-out:</span>
                  <span>{selectedRange?.endDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2 mt-2">
                  <span className="text-white/70">Total Amount:</span>
                  <span className="text-xl font-bold text-[#0088FF]">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <Image
                    src={qrUrl}
                    alt="Payment QR Code"
                    width={250}
                    height={250}
                    className="w-[200px] md:w-[250px] h-auto"
                  />
                </div>
                <p className="text-sm text-white/70 text-center">
                  Scan this QR code using any UPI app to pay
                </p>
              </div>
            )}

            {/* Screenshot Upload */}
            <div className="space-y-4">
              <label className="block">
                <span className="text-lg md:text-xl uppercase mb-2 block">
                  Upload Payment Screenshot URL
                </span>
                <span className="text-sm text-white/70 block mb-3">
                  After making the payment, upload your payment screenshot to any image hosting service (like Imgur, Postimages, etc.) and paste the URL below.
                </span>
                <input
                  type="url"
                  value={paymentScreenshot}
                  onChange={(e) => setPaymentScreenshot(e.target.value)}
                  placeholder="https://example.com/your-screenshot.png"
                  className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white"
                />
              </label>

              {submitError && (
                <p className="text-red-500 text-sm">{submitError}</p>
              )}

              <div className="flex flex-col md:flex-row gap-4">
                <Button
                  onClick={() => setStep("dates")}
                  variant="outline"
                  className="w-full md:w-auto border-white/30 text-white hover:bg-white/10 px-8 py-4"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmitBooking}
                  disabled={submitting || !paymentScreenshot.trim()}
                  className="w-full md:w-auto bg-white text-black hover:bg-white/90 px-8 py-4 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Booking"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step: Success */}
        {step === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center space-y-6 py-12"
          >
            <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl uppercase">Booking Submitted!</h2>

            <div className="text-white/70 space-y-2">
              <p>Your accommodation booking has been submitted successfully.</p>
              {bookingId && (
                <p className="text-lg">
                  Booking ID: <span className="text-white font-bold">#{bookingId}</span>
                </p>
              )}
              <p className="text-sm">
                Your payment is pending verification. You will receive a confirmation once verified.
              </p>
            </div>

            <div className="bg-white/5 p-4 md:p-6 rounded-lg max-w-md mx-auto">
              <h3 className="text-lg uppercase mb-4">Booking Details</h3>
              <div className="space-y-2 text-sm md:text-base text-left">
                <div className="flex justify-between">
                  <span className="text-white/70">Package:</span>
                  <span>{selectedNights} Nights</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Dates:</span>
                  <span>{selectedRange?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Amount:</span>
                  <span className="text-[#0088FF]">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className="text-amber-400">Pending Verification</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/user-profile")}
              className="bg-white text-black hover:bg-white/90 px-8 py-4"
            >
              View My Bookings
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}