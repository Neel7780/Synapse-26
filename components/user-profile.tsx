"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

/**
 * NOTE FOR BACKEND / INTEGRATION:
 * ---------------------------------------------------------
 * The data objects below (`userDetails`, `registeredEvents`,
 * `hasAccommodation`) are TEMPORARY placeholders used only
 * for UI development and layout testing.
 *
 * When integrating with the backend:
 * 1. Replace these constants with data fetched from the API
 *    (e.g. via server actions, API routes, or client-side fetch).
 * 2. Map API response fields directly to the props/fields
 *    used in this component (keep the same shape if possible).
 * 3. This component assumes:
 *    - `userDetails` represents the logged-in user profile
 *    - `registeredEvents` is an array of events the user has
 *      registered for
 *    - `hasAccommodation` is a boolean derived from user data
 *
 * IMPORTANT:
 * - Do NOT change layout or animation logic when wiring data.
 * - Component is already backend-ready; only data source
 *   replacement is required.
 * ---------------------------------------------------------
 */

/* data */
const userDetails = {
  firstName: "Alex",
  lastName: "Johnson",
  phone: "+01 123-456-7890",
  dateOfBirth: "March 15, 1998",
  gender: "Male",
  university: "DAIICT",
  email: "202601111@dau.ac.in",
};

const registeredEvents = [
  {
    id: 1,
    name: "Tech Summit 2024",
    category: "Business",
    status: "Registered",
  },
  {
    id: 2,
    name: "AI & Machine Learning Conference",
    category: "Technology",
    status: "Form Incomplete",
  },
  {
    id: 3,
    name: "User-experience Workshop",
    category: "Design",
    status: "Registered",
  },
  {
    id: 4,
    name: "Advanced Frontend Systems",
    category: "Technology",
    status: "Form Incomplete",
  },
];

const hasAccommodation = true;

/* data */
export default function UserProfile() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!ref.current) return;
    const tween = gsap.fromTo(
      ref.current.querySelectorAll(".animate"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, stagger: 0.05 }
    );

    return () => {
      tween.kill?.();
    };
  }, []);
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/"); // fallback route
    }
  };

  return (
    <div ref={ref} className="min-h-[100dvh] bg-background px-4 py-6 md:px-8 md:py-12">
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 md:mb-10">
        <button
          onClick={handleBack}
          className="group relative inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          aria-label="Go Back"
        >
          <ArrowLeft className="cursor-pointer w-6 h-6 md:w-8 md:h-8" />
        </button>
      </div>

      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Profile */}
        <div className="animate flex flex-col gap-6">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Profile
          </h2>

          <div className="space-y-3 md:space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                ["First Name", userDetails.firstName],
                ["Last Name", userDetails.lastName],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center"
                >
                  <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-base font-semibold font-roboto truncate">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact Info Stack */}
            {[
              ["Phone", userDetails.phone],
              ["College", userDetails.university],
              ["Email Address", userDetails.email],
            ].map(([label, value]) => (
              <div
                key={label}
                className="animate border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center"
              >
                <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-base font-semibold break-words font-roboto">
                  {value}
                </p>
              </div>
            ))}

            {/* Demographics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {[
                ["Date of Birth", userDetails.dateOfBirth],
                ["Gender", userDetails.gender],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="animate border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center"
                >
                  <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-base font-semibold font-roboto capitalize">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Events & Accom */}
        <div className="flex flex-col">
          {/* EVENTS */}
          <div className="mb-8 md:mb-10">
            <h2 className="animate text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6">
              Registered Events
            </h2>

            <div className="animate space-y-3 md:space-y-4 max-h-[265px] overflow-y-auto pr-2 thin-scrollbar overscroll-contain">
              {registeredEvents.length > 0 ? (
                registeredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border border-white p-3 md:p-4 transition-colors hover:bg-white/5"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <h3 className="font-semibold text-base md:text-lg leading-tight">
                        {event.name}
                      </h3>
                      <span
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm whitespace-nowrap font-medium ${
                          event.status === "Registered"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-orange-500/20 text-orange-400"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs md:text-sm text-muted-foreground font-roboto">
                      {event.category}
                    </p>
                  </div>
                ))
              ) : (
                <div className="border border-white/20 border-dashed p-6 text-center text-muted-foreground">
                  No events registered yet.
                </div>
              )}
            </div>
          </div>

          {/* ACCOMMODATION */}
          <div className="mt-auto">
            <h2 className="animate text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Accommodation
            </h2>

            <div className="animate border border-white p-3 md:p-4 min-h-[72px] flex items-center">
              <div className="flex justify-between items-center w-full gap-4">
                <p className="text-sm md:text-base font-semibold font-roboto">
                  2 Days Accommodation
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                    hasAccommodation
                      ? "bg-green-500/20 text-green-400"
                      : "bg-orange-500/20 text-orange-400"
                  }`}
                >
                  {hasAccommodation ? "Registered" : "Unregistered"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
