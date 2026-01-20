"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";

const Pricing = {
  2: 2300,
  3: 2500,
  4: 2800,
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
    });
  }

  return ranges;
};

export function AccommodationComponent() {
  type Range = {
    startIndex: number;
    endIndex: number;
    startDay: number;
    endDay: number;
    label: string;
    days: number[];
  };

  const [selectedNights, setSelectedNights] = useState<number | null>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  const availableRanges = useMemo(
    () => (selectedNights ? getAvailableDateRanges(selectedNights) : []),
    [selectedNights]
  );

  const totalPrice = useMemo(
    () =>
      selectedNights ? Pricing[selectedNights as keyof typeof Pricing] : 0,
    [selectedNights]
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
  const handleBookNow = async () => {
    if (!selectedRange || !selectedNights) {
      alert("Please select your accommodation dates");
      return;
    }

    try {
      const dates = selectedRange.days; // [27, 28] etc
      // Helper to convert day number to YYYY-MM-DD
      const getFullDate = (day: number) => {
        // Simple logic for Feb/March 2026 based on the day
        if (day >= 26) return `2026-02-${day}`;
        return `2026-03-0${day}`;
      };

      const checkIn = getFullDate(selectedRange.startDay);
      const checkOut = getFullDate(selectedRange.endDay);

      // 1. Create Order
      const response = await fetch("/api/accommodation/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nights: selectedNights,
          checkIn,
          checkOut,
          // user_id provided by session context if available, else backend handles it
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate booking");
      }

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: "Synapse Accommodation",
        description: `${selectedNights} Nights Stay`,
        order_id: data.orderId,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch("/api/accommodation/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              booking_details: {
                nights: selectedNights,
                checkIn,
                checkOut,
              },
              amount: data.amount,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            alert("Booking Successful! See you at Synapse.");
            setSelectedNights(null);
            setSelectedRange(null);
          } else {
            alert("Payment verification failed: " + verifyData.error);
          }
        },
        theme: {
          color: "#0088FF",
        },
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();

    } catch (error: any) {
      console.error("Booking Error:", error);
      alert(error.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white font-jqka">
      {/* Header */}
      <div className="pb-6 md:pb-8 text-center px-4">
        <h1 className="pt-5 text-3xl md:text-6xl lg:text-8xl font-joker mb-2">accommodation</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Night Selection */}
        <div className="mb-8 md:mb-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl uppercase mb-4 md:mb-6">
            Choose your accommodation
          </h2>
          <p className="text-sm md:text-base mb-4 text-white/70">
            Festival dates: {festivalRange}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            {[2, 3, 4].map((nights) => (
              <button
                key={nights}
                onClick={() => handleNightSelection(nights)}
                className={`p-4 md:p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${selectedNights === nights
                  ? "border-2 border-white bg-white text-black"
                  : "border-2 border-white/30 hover:border-white"
                  }`}
              >
                <div className="text-xl md:text-2xl font-bold">
                  {nights} NIGHTS
                </div>
                <div className="text-lg md:text-xl">
                  ₹ {Pricing[nights as keyof typeof Pricing]}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div></div>

        {selectedNights && availableRanges.length > 0 && (
          <div className="mb-8 md:mb-12">
            <h3 className="text-xl md:text-2xl uppercase mb-4 md:mb-6">
              Select Dates
            </h3>

            <div className="space-y-3 mb-6 md:mb-8">
              {availableRanges.map((range, index) => (
                <label
                  key={index}
                  className="flex items-center gap-3 md:gap-4 p-3 md:p-4 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="w-5 md:w-6 h-6 bg-white flex items-center justify-center flex-shrink-0">
                    {selectedRange?.startIndex === range.startIndex && (
                      <div className="w-5 h-6 md:w-6  text-blue-700 font-black text-lg md:text-xl text-center justify-center item-center font-jqka scale-125 select-none">
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
                </label>
              ))}
            </div>
          </div>
        )}

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
            onClick={handleBookNow}
            disabled={!selectedRange}
            className="w-full md:w-auto bg-white text-black hover:bg-white/90 cursor-pointer px-8 md:px-12 py-4 md:py-6 text-lg md:text-2xl font-jqka uppercase disabled:opacity-50"
          >
            Book Now
          </Button>
        </div>

        {/* Guidelines Section */}
        <div className="bg-white/5 p-6 font-poppins md:p-8 rounded">
          <h3 className="text-2xl text-center underline md:text-3xl mb-4 md:mb-6 ">
            Guidelines
          </h3>
          <ul className="space-y-3 md:space-y-4 text-xs md:text-sm leading-relaxed">
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">1)</span>
              <span>
                Accommodation passes are strictly non-refundable under any
                circumstances.
              </span>
            </li>
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">2)</span>
              <span>
                Accommodation will be allocated based on availability. The place
                assigned to you must be accepted as it is. No changes or
                requests for alternative arrangements will be entertained.
              </span>
            </li>
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">3)</span>
              <span>
                Keep your belongings secure. Organizers will not be responsible
                for any loss or damage.
              </span>
            </li>
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">4)</span>
              <span>
                Respect the property and maintain cleanliness—any damage caused
                will result in full accountability, including covering the cost
                of repairs or replacement.
              </span>
            </li>
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">5)</span>
              <span>
                On 26th February, accommodation will not be provided before 4:00
                PM.
              </span>
            </li>
            <li className="flex gap-2 md:gap-3">
              <span className="text-white/60 flex-shrink-0">6)</span>
              <span>
                On 1st March, check-out will be before 9:00 AM. All guests
                must vacate the accommodation by this time.
              </span>
            </li>
          </ul>
        </div>
      </div>
      <script src="https://checkout.razorpay.com/v1/checkout.js" async={true}></script>
    </div>
  );
}
