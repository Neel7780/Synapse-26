"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/ui/Resizable-navbar";
import NavigationPanel from "@/components/ui/NavigationPanel";
import { useNavigationState } from "@/lib/useNavigationState";

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
  coordinatorStatus?: string | null;
};

type AccommodationBooking = {
  booking_id: number;
  nights: number;
  check_in: string | null;
  check_out: string | null;
  amount: number;
  verification_status: "pending" | "verified" | "rejected" | null;
  payment_status: string | null;
  created_at: string | null;
};

// Memoized profile field component
const ProfileField = memo(function ProfileField({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center ${className}`}
    >
      <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider">
        {label}
      </p>
      <p className="text-base font-semibold font-roboto truncate">{value}</p>
    </div>
  );
});

// Editable profile field component
const EditableProfileField = memo(function EditableProfileField({
  label,
  value,
  onChange,
  type = "text",
  className = "",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <div
      className={`border border-white p-3 md:p-4 min-h-[72px] flex flex-col justify-center ${className}`}
    >
      <p className="text-xs text-muted-foreground font-roboto uppercase tracking-wider mb-1">
        {label}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`text-base font-semibold font-roboto bg-transparent border-none outline-none text-white disabled:opacity-50 disabled:cursor-not-allowed ${type === "date" ? "max-w-[150px] md:max-w-full" : "w-full"}`}
      />
    </div>
  );
});

// Memoized event card component (shows coordinator status only)
const EventCard = memo(function EventCard({ event }: { event: RegisteredEvent }) {
  const coord = event.coordinatorStatus;
  const badge = coord
    ? coord === "accepted"
      ? { text: "Accepted", className: "bg-green-500/20 text-green-400" }
      : coord === "rejected"
      ? { text: "Rejected", className: "bg-red-500/20 text-red-400" }
      : { text: String(coord).charAt(0).toUpperCase() + String(coord).slice(1), className: "bg-muted-500/20 text-muted-foreground" }
    : { text: "Pending", className: "bg-orange-500/20 text-orange-400" };

  return (
    <div className="border border-white p-3 md:p-4 transition-colors hover:bg-white/5">
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-semibold text-base md:text-lg leading-tight">
          {event.name}
        </h3>
        <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm whitespace-nowrap font-medium ${badge.className}`}>
          {badge.text}
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
  const { user, loading: authLoading, logout } = useAuth();
  const { startTransition } = useNavigationState();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [accommodationBookings, setAccommodationBookings] = useState<AccommodationBooking[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<UserDetails | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
            coordinator_status,
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
        supabase
          .from("accommodation_bookings")
          .select("booking_id, nights, check_in, check_out, amount, verification_status, payment_status, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
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
            coordinatorStatus: reg.coordinator_status ?? null,
          };
        });
        setRegisteredEvents(mappedEvents);
      }

      // Process accommodation data
      if (accResult.data && accResult.data.length > 0) {
        setAccommodationBookings(accResult.data as AccommodationBooking[]);
      }

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

  const handleEdit = useCallback(() => {
    if (userDetails) {
      setEditFormData({ ...userDetails });
      setIsEditing(true);
      setSaveError(null);
    }
  }, [userDetails]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditFormData(null);
    setSaveError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editFormData || !user) {
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: editFormData.firstName,
          lastName: editFormData.lastName,
          phone: editFormData.phone === "N/A" ? "" : editFormData.phone,
          college: editFormData.university === "N/A" ? "" : editFormData.university,
          dob: editFormData.dateOfBirth === "N/A" ? "" : editFormData.dateOfBirth,
          gender: editFormData.gender === "N/A" ? "" : editFormData.gender,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      // Refresh data after successful update
      await fetchData(user.id, user.email);
      setIsEditing(false);
      setEditFormData(null);
    } catch (err) {
      console.error("Error saving profile:", err);
      setSaveError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }, [editFormData, user, fetchData]);

  const handleFieldChange = useCallback((field: keyof UserDetails, value: string) => {
    if (editFormData) {
      setEditFormData({
        ...editFormData,
        [field]: value,
      });
    }
  }, [editFormData]);

  // Helper function to format date for input (YYYY-MM-DD)
  const formatDateForInput = useCallback((dateStr: string): string => {
    if (!dateStr || dateStr === "N/A") return "";
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Try to parse and format
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    } catch {
      // If parsing fails, return empty string
    }
    return "";
  }, []);

  if (authLoading || dataLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !userDetails) {
    return (
      <div className="min-h-svh bg-background px-4 py-6 md:px-8 md:py-12 flex flex-col items-center justify-center">
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
    <div ref={ref} className="min-h-dvh bg-background px-4 py-6 md:px-8 md:py-12 pt-28 md:pt-36">
      <Navbar visible={true}>
        <NavigationPanel />
      </Navbar>
      {/* HEADER */}


      {/* MAIN GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Profile */}
        <div className="animate flex flex-col gap-6">
          <div className="flex flex-row flex-wrap justify-between items-center gap-4">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">Profile</h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEdit}
                  className="px-4 md:px-3 lg:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-jqka uppercase transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-blue-900/20 hover:shadow-blue-900/40 text-sm md:text-base md:tracking-[0.15em] flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 md:px-3 lg:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 text-white rounded font-jqka uppercase transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-green-900/20 hover:shadow-green-900/40 text-sm md:text-base md:tracking-[0.15em] flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? "Saving..." : "Save"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 md:px-3 lg:px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600/50 text-white rounded font-jqka uppercase transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-gray-900/20 hover:shadow-gray-900/40 text-sm md:text-base md:tracking-[0.15em] flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </motion.button>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  startTransition();
                  await logout();
                  router.push("/");
                }}
                className="px-6 md:px-3 lg:px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-jqka uppercase transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-red-900/20 hover:shadow-red-900/40 text-lg md:text-xl md:tracking-[0.15em]"
              >
                Logout
              </motion.button>
            </div>
          </div>

          {saveError && (
            <div className="border border-red-500/50 bg-red-500/10 p-3 rounded text-red-400 text-sm">
              {saveError}
            </div>
          )}

          <div className="space-y-3 md:space-y-4">
            {isEditing && editFormData ? (
              <>
                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <EditableProfileField
                    label="First Name"
                    value={editFormData.firstName}
                    onChange={(value) => handleFieldChange("firstName", value)}
                  />
                  <EditableProfileField
                    label="Last Name"
                    value={editFormData.lastName}
                    onChange={(value) => handleFieldChange("lastName", value)}
                  />
                </div>

                {/* Contact Info Stack */}
                <EditableProfileField
                  label="Phone"
                  value={editFormData.phone === "N/A" ? "" : editFormData.phone}
                  onChange={(value) => handleFieldChange("phone", value)}
                  type="tel"
                />
                <EditableProfileField
                  label="College"
                  value={editFormData.university === "N/A" ? "" : editFormData.university}
                  onChange={(value) => handleFieldChange("university", value)}
                />
                <ProfileField
                  label="Email Address"
                  value={userDetails.email}
                  className="animate opacity-60"
                />

                {/* Demographics Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  <EditableProfileField
                    label="Date of Birth"
                    value={formatDateForInput(editFormData.dateOfBirth)}
                    onChange={(value) => handleFieldChange("dateOfBirth", value)}
                    type="date"
                  />
                  <EditableProfileField
                    label="Gender"
                    value={editFormData.gender === "N/A" ? "" : editFormData.gender}
                    onChange={(value) => handleFieldChange("gender", value)}
                  />
                </div>
              </>
            ) : (
              <>
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
              </>
            )}

            <Link
              href="/auth?view=forgot"
              onClick={() => startTransition()}
              className="block w-full px-6 py-3 border border-white/20 hover:bg-white/5 rounded font-jqka uppercase tracking-[0.15em] transition-all whitespace-nowrap hover:border-white/40 text-center text-lg md:text-xl mt-6"
            >
              Change Password
            </Link>
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

            <div className="animate space-y-3">
              {accommodationBookings.length > 0 ? (
                accommodationBookings.map((booking) => {
                  const getStatusBadge = () => {
                    switch (booking.verification_status) {
                      case "verified":
                        return {
                          text: "Verified",
                          className: "bg-green-500/20 text-green-400"
                        };
                      case "rejected":
                        return {
                          text: "Rejected",
                          className: "bg-red-500/20 text-red-400"
                        };
                      default:
                        return {
                          text: "Pending Verification",
                          className: "bg-orange-500/20 text-orange-400"
                        };
                    }
                  };
                  const status = getStatusBadge();

                  const formatDate = (dateStr: string | null) => {
                    if (!dateStr) return "N/A";
                    return new Date(dateStr).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    });
                  };

                  return (
                    <div key={booking.booking_id} className="border border-white p-3 md:p-4">
                      <div className="flex justify-between items-start w-full gap-4">
                        <div className="flex-1">
                          <p className="text-sm md:text-base font-semibold font-roboto">
                            {booking.nights} Night{booking.nights > 1 ? "s" : ""} Accommodation
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </p>
                          <p className="text-sm text-white/80 mt-1">
                            ₹{booking.amount.toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium whitespace-nowrap ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-white/20 border-dashed p-6 text-center">
                  <p className="text-muted-foreground mb-3">No accommodation booked yet.</p>
                  <Link
                    href="/accomodation"
                    onClick={() => startTransition()}
                    className="inline-block px-4 py-2 border border-white/30 hover:bg-white/10 rounded text-sm font-jqka uppercase tracking-wider transition-all"
                  >
                    Book Accommodation
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div >
    </div >
  );
}
