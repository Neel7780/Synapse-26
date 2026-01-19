"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";

gsap.registerPlugin(ScrollTrigger);

export default function UserProfile() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [userDetails, setUserDetails] = useState<{
    firstName: string;
    lastName: string;
    phone: string;
    dateOfBirth: string;
    gender: string;
    university: string;
    email: string;
  } | null>(null);

  const [registeredEvents, setRegisteredEvents] = useState<any[]>([]);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchData = async () => {
      setDataLoading(true);
      const supabase = createClient();

      try {
        // 1. Fetch User Details
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (userData) {
          const fullName = userData.user_name || "";
          const nameParts = fullName.split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          setUserDetails({
            firstName,
            lastName,
            phone: userData.phone || "N/A",
            dateOfBirth: userData.dob || "N/A",
            gender: userData.gender || "N/A",
            university: userData.college || "N/A",
            email: userData.email || user.email || "N/A"
          });
        }

        // 2. Fetch Registered Events
        // The relation path is event_registrations -> event_fee -> event -> event_category
        // We need to use the correct syntax for nested joins. 
        // Based on types, event_registrations has FK to event_fee (composite).
        // Let's try to join via event_fee.
        const { data: regData, error: regError } = await supabase
          .from("event_registrations")
          .select(`
            *,
            event_fee (
              event (
                event_name,
                event_category (
                  category_name
                )
              )
            )
          `)
          .eq("registered_by_user_id", user.id);

        if (regData) {
          const mappedEvents = regData.map((reg: any) => {
            // reg.event_fee is likely an object because event_registrations -> event_fee is N:1
            const eventObj = reg.event_fee?.event;
            const categoryObj = eventObj?.event_category;

            return {
              id: reg.registration_id,
              name: eventObj?.event_name || "Unknown Event",
              category: categoryObj?.category_name || "General",
              status: reg.payment_status === "done" ? "Registered" : "Payment Pending",
            };
          });
          setRegisteredEvents(mappedEvents);
        }

        // 3. Accommodation
        const { data: accData } = await supabase
          .from("accommodation_bookings")
          .select("booking_id")
          .eq("user_id", user.id);

        setHasAccommodation(accData && accData.length > 0 ? true : false);

      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (dataLoading || !ref.current) return;
    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        ".animate",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.05 }
      );
    }, ref);

    return () => {
      ctx.revert();
    };
  }, [dataLoading]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-[100svh] bg-black flex items-center justify-center text-white">
        Loading Profile...
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-[100svh] bg-background px-4 py-6 md:px-8 md:py-12 flex flex-col items-center justify-center">
        <div className="text-white mb-4">Failed to load profile.</div>
        <button onClick={handleBack} className="text-white underline">Go Back</button>
      </div>
    );
  }

  return (
    <div ref={ref} className="min-h-[100svh] bg-background px-4 py-6 md:px-8 md:py-12">
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
                        className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm whitespace-nowrap font-medium ${event.status === "Registered"
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
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${hasAccommodation
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
