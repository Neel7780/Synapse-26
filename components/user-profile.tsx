"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type UserDetails = {
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  university: string;
  email: string;
};

type RegisteredEvent = {
  id: string | number;
  name: string;
  category: string;
  status: string;
};

// Memoized profile field component
const ProfileField = memo(function ProfileField({ 
  label, 
  value, 
  className = "" 
}: { 
  label: string; 
  value: string; 
  className?: string;
}) {
  return (
    <div className={`border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center ${className}`}>
      <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider">
        {label}
      </p>
      <p className="text-base font-semibold font-roboto truncate">
        {value}
      </p>
    </div>
  );
});

// Memoized event card component
const EventCard = memo(function EventCard({ event }: { event: RegisteredEvent }) {
  return (
    <div className="border border-white p-3 md:p-4 transition-colors hover:bg-white/5">
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
  );
});

// Loading skeleton
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4">
    <Loader2 className="w-8 h-8 text-white animate-spin" />
    <p className="text-white/70 font-poppins">Loading Profile...</p>
  </div>
);

export default function UserProfile() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [hasAccommodation, setHasAccommodation] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (userId: string, userEmail: string | undefined) => {
    setDataLoading(true);
    setError(null);
    const supabase = createClient();

    try {
      // Fetch all data in parallel for better performance
      const [userResult, regResult, accResult] = await Promise.all([
        supabase.from("users").select("*").eq("user_id", userId).single(),
        supabase
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
          .eq("registered_by_user_id", userId),
        supabase.from("accommodation_bookings").select("booking_id").eq("user_id", userId),
      ]);

      // Process user data
      if (userResult.data) {
        const fullName = userResult.data.user_name || "";
        const nameParts = fullName.split(" ");
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        setUserDetails({
          firstName,
          lastName,
          phone: userResult.data.phone || "N/A",
          dateOfBirth: userResult.data.dob || "N/A",
          gender: userResult.data.gender || "N/A",
          university: userResult.data.college || "N/A",
          email: userResult.data.email || userEmail || "N/A",
        });
      }

      // Process registration data
      if (regResult.data) {
        const mappedEvents = regResult.data.map((reg) => {
          const eventFee = reg.event_fee as { event?: { event_name?: string; event_category?: { category_name?: string } } } | null;
          const eventObj = eventFee?.event;
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

      // Process accommodation data
      setHasAccommodation(!!(accResult.data && accResult.data.length > 0));

    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Failed to load profile data. Please try again.");
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push("/auth");
      return;
    }

    fetchData(user.id, user.email);
  }, [user, authLoading, router, fetchData]);

  useEffect(() => {
    if (dataLoading || !ref.current) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".animate",
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" }
      );
    }, ref);

    return () => {
      ctx.revert();
    };
  }, [dataLoading]);

  const handleBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }, [router]);

  if (authLoading || dataLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userDetails) {
    return (
      <div className="min-h-[100svh] bg-background px-4 py-6 md:px-8 md:py-12 flex flex-col items-center justify-center">
        <div className="text-white mb-4">{error || "Failed to load profile."}</div>
        <button 
          onClick={handleBack} 
          className="text-white underline hover:text-white/80 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

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
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Profile</h2>

          <div className="space-y-3 md:space-y-4">
            {/* Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <ProfileField label="First Name" value={userDetails.firstName} />
              <ProfileField label="Last Name" value={userDetails.lastName} />
            </div>

            {/* Contact Info Stack */}
            <ProfileField label="Phone" value={userDetails.phone} className="animate" />
            <ProfileField label="College" value={userDetails.university} className="animate" />
            <ProfileField label="Email Address" value={userDetails.email} className="animate" />

            {/* Demographics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <ProfileField label="Date of Birth" value={userDetails.dateOfBirth} className="animate" />
              <ProfileField label="Gender" value={userDetails.gender} className="animate" />
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
                  <EventCard key={event.id} event={event} />
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
