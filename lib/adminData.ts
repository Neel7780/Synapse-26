/**
 * Server-side data fetching utilities for Admin Panel
 * 
 * These functions are designed for use in:
 * - Server Components (RSC)
 * - Server Actions
 * - API Routes
 * 
 * They leverage Next.js caching and revalidation for optimal performance.
 * All functions run on the server only and use the admin (service role) client.
 */

import { getSupabaseAdmin } from "./supabaseServer";
import { unstable_cache } from "next/cache";

// =============================================================================
// Types
// =============================================================================

export type DashboardStats = {
  totalEvents: number;
  totalRegistrations: number;
  totalUsers: number;
  totalSponsors: number;
  activeEvents: number;
};

export type RevenueData = {
  today: {
    gross: number;
    gatewayCharges: number;
    net: number;
    change: number;
  };
};

export type RecentRegistration = {
  id: string;
  userName: string;
  event: string;
  date: string;
  status: string;
  amount: number;
};

export type QuickStat = {
  label: string;
  value: string;
  change: string;
  positive: boolean;
};

export type DashboardData = {
  stats: DashboardStats;
  revenue: RevenueData;
  recentRegistrations: RecentRegistration[];
  quickStats: QuickStat[];
};

export type AdminSettings = {
  payment_qr_url: string | null;
};

// =============================================================================
// Dashboard Data Fetching
// =============================================================================

/**
 * Fetch dashboard statistics (cached for 60 seconds)
 */
export const getDashboardStats = unstable_cache(
  async (): Promise<DashboardStats> => {
    const supabase = getSupabaseAdmin();

    const [eventsResult, registrationsResult, usersResult, sponsorsResult, activeEventsResult] =
      await Promise.all([
        supabase.from("event").select("event_id", { count: "exact", head: true }),
        supabase.from("event_registrations").select("registration_id", { count: "exact", head: true }),
        supabase.from("users").select("user_id", { count: "exact", head: true }),
        supabase.from("sponsors").select("sponsor_id", { count: "exact", head: true }),
        supabase.from("event").select("event_id", { count: "exact", head: true }).eq("is_registration_open", true),
      ]);

    return {
      totalEvents: eventsResult.count ?? 0,
      totalRegistrations: registrationsResult.count ?? 0,
      totalUsers: usersResult.count ?? 0,
      totalSponsors: sponsorsResult.count ?? 0,
      activeEvents: activeEventsResult.count ?? 0,
    };
  },
  ["dashboard-stats"],
  { revalidate: 60, tags: ["dashboard", "stats"] }
);

/**
 * Fetch today's revenue data (cached for 30 seconds)
 */
export const getTodayRevenue = unstable_cache(
  async (): Promise<RevenueData> => {
    const supabase = getSupabaseAdmin();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();

    // Get yesterday's date range for comparison
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.toISOString();

    // Gateway charges treated as 0 (payment_method_id column not in event_registrations)
    const getGateway = (_reg: unknown) => 0;

    const [todayResult, yesterdayResult] = await Promise.all([
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart),
    ]);

    // Calculate today's revenue
    let todayGross = 0;
    let todayGateway = 0;
    type RegistrationWithPayment = {
      registration_id: number;
      payment_status: "pending" | "done" | "failed" | null;
      gross_amount: number | null;
    };

    (todayResult.data ?? []).forEach((reg: RegistrationWithPayment) => {
      if (reg.payment_status === "done") {
        todayGross += reg.gross_amount ?? 0;
        todayGateway += getGateway(reg);
      }
    });

    // Calculate yesterday's revenue for comparison
    let yesterdayGross = 0;
    let yesterdayGateway = 0;
    (yesterdayResult.data ?? []).forEach((reg: RegistrationWithPayment) => {
      if (reg.payment_status === "done") {
        yesterdayGross += reg.gross_amount ?? 0;
        yesterdayGateway += getGateway(reg);
      }
    });

    const todayNet = todayGross - todayGateway;
    const yesterdayNet = yesterdayGross - yesterdayGateway;

    const change =
      yesterdayNet > 0
        ? ((todayNet - yesterdayNet) / yesterdayNet) * 100
        : todayNet > 0
          ? 100
          : 0;

    return {
      today: {
        gross: todayGross,
        gatewayCharges: todayGateway,
        net: todayNet,
        change: Math.round(change * 10) / 10,
      },
    };
  },
  ["today-revenue"],
  { revalidate: 30, tags: ["dashboard", "revenue"] }
);

/**
 * Fetch recent registrations (cached for 30 seconds)
 */
export const getRecentRegistrations = unstable_cache(
  async (limit: number = 5): Promise<RecentRegistration[]> => {
    const supabase = getSupabaseAdmin();

    const { data } = await supabase
      .from("event_registrations")
      .select(
        `
        registration_id,
        payment_status,
        gross_amount,
        created_at,
        users(user_name),
        event(event_name)
      `
      )
      .eq("payment_status", "done")
      .not("created_at", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit);

    type RecentRegistrationRow = {
      registration_id: number;
      payment_status: "pending" | "done" | "failed" | null;
      gross_amount: number | null;
      created_at: string | null;
      users: { user_name: string | null } | null;
      event: { event_name: string | null } | null;
    };

    return (data as any ?? []).map((reg: RecentRegistrationRow) => ({
      id: String(reg.registration_id),
      userName: reg.users?.user_name || "Unknown",
      event: reg.event?.event_name || "Unknown Event",
      date: reg.created_at ? new Date(reg.created_at).toISOString().split("T")[0] : "",
      status: reg.payment_status ?? "pending",
      amount: reg.gross_amount ?? 0,
    }));
  },
  ["recent-registrations"],
  { revalidate: 30, tags: ["dashboard", "registrations"] }
);

/**
 * Fetch quick stats (registrations and revenue change today)
 */
export const getQuickStats = unstable_cache(
  async (): Promise<QuickStat[]> => {
    const supabase = getSupabaseAdmin();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();

    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.toISOString();

    // Gateway charges treated as 0 (payment_method_id column not in event_registrations)
    const getGateway = (_reg: unknown) => 0;

    const [todayResult, yesterdayResult] = await Promise.all([
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart),
    ]);

    type QuickStatsRegistration = {
      registration_id: number;
      payment_status: "pending" | "done" | "failed" | null;
      gross_amount: number | null;
    };

    // Calculate today's stats
    let todayRegistrations = 0;
    let todayRevenue = 0;
    (todayResult.data ?? []).forEach((reg: QuickStatsRegistration) => {
      if (reg.payment_status === "done") {
        todayRegistrations++;
        todayRevenue += (reg.gross_amount ?? 0) - getGateway(reg);
      }
    });

    // Calculate yesterday's stats
    let yesterdayRegistrations = 0;
    let yesterdayRevenue = 0;
    (yesterdayResult.data ?? []).forEach((reg: QuickStatsRegistration) => {
      if (reg.payment_status === "done") {
        yesterdayRegistrations++;
        yesterdayRevenue += (reg.gross_amount ?? 0) - getGateway(reg);
      }
    });

    const registrationChange =
      yesterdayRegistrations > 0
        ? ((todayRegistrations - yesterdayRegistrations) / yesterdayRegistrations) * 100
        : todayRegistrations > 0
          ? 100
          : 0;

    const revenueChange =
      yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : todayRevenue > 0
          ? 100
          : 0;

    return [
      {
        label: "Registrations",
        value: todayRegistrations.toString(),
        change: `${registrationChange >= 0 ? "+" : ""}${Math.round(registrationChange)}%`,
        positive: registrationChange >= 0,
      },
      {
        label: "Revenue",
        value: `₹${todayRevenue >= 1000 ? Math.round(todayRevenue / 1000) + "K" : todayRevenue}`,
        change: `${revenueChange >= 0 ? "+" : ""}${Math.round(revenueChange)}%`,
        positive: revenueChange >= 0,
      },
    ];
  },
  ["quick-stats"],
  { revalidate: 30, tags: ["dashboard", "stats"] }
);

/**
 * Fetch all dashboard data in parallel (optimized single call)
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [stats, revenue, recentRegistrations, quickStats] = await Promise.all([
    getDashboardStats(),
    getTodayRevenue(),
    getRecentRegistrations(5),
    getQuickStats(),
  ]);

  return {
    stats,
    revenue,
    recentRegistrations,
    quickStats,
  };
}

// =============================================================================
// Settings Data Fetching
// =============================================================================

/**
 * Fetch admin settings (cached for 5 minutes)
 */
export const getAdminSettings = unstable_cache(
  async (): Promise<AdminSettings> => {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("app_settings")
      .select("key, value")
      .in("key", ["payment_qr_url"]);

    if (error) {
      console.error("Failed to fetch admin settings:", error);
      return { payment_qr_url: null };
    }

    const settings: AdminSettings = {
      payment_qr_url: null,
    };

    data?.forEach((setting) => {
      if (setting.key === "payment_qr_url") {
        settings.payment_qr_url = setting.value ?? null;
      }
    });

    return settings;
  },
  ["admin-settings"],
  { revalidate: 300, tags: ["settings"] }
);

// =============================================================================
// Events Data Fetching
// =============================================================================

/**
 * Fetch all events with categories and fees (cached for 60 seconds)
 */
export const getAllEvents = unstable_cache(
  async () => {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("event")
      .select(
        `
        *,
        event_category(category_name),
        event_fee(
          fee(fee_id, participation_type, price, min_members, max_members, qr_code)
        )
      `
      )
      .order("event_date", { ascending: true });

    if (error) {
      console.error("Failed to fetch events:", error);
      return [];
    }

    return data ?? [];
  },
  ["all-events"],
  { revalidate: 60, tags: ["events"] }
);

/**
 * Fetch a single event by ID
 */
export async function getEventById(eventId: number) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("event")
    .select(
      `
      *,
      event_category(category_name),
      event_fee(
        fee(fee_id, participation_type, price, min_members, max_members, qr_code)
      )
    `
    )
    .eq("event_id", eventId)
    .single();

  if (error) {
    console.error("Failed to fetch event:", error);
    return null;
  }

  return data;
}

// =============================================================================
// Categories Data Fetching
// =============================================================================

/**
 * Fetch all categories (cached for 5 minutes)
 */
export const getAllCategories = unstable_cache(
  async () => {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("event_category")
      .select("*")
      .order("category_name", { ascending: true });

    if (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }

    return data ?? [];
  },
  ["all-categories"],
  { revalidate: 300, tags: ["categories"] }
);

// =============================================================================
// Sponsors Data Fetching
// =============================================================================

/**
 * Fetch all sponsors (cached for 5 minutes)
 */
export const getAllSponsors = unstable_cache(
  async () => {
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("sponsors")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Failed to fetch sponsors:", error);
      return [];
    }

    return data ?? [];
  },
  ["all-sponsors"],
  { revalidate: 300, tags: ["sponsors"] }
);

// =============================================================================
// Cache Revalidation Helpers
// =============================================================================

import { revalidateTag } from "next/cache";

/**
 * Revalidate dashboard-related caches
 */
export function revalidateDashboard() {
  revalidateTag("dashboard", "max");
}

/**
 * Revalidate events-related caches
 */
export function revalidateEvents() {
  revalidateTag("events", "max");
  revalidateTag("dashboard", "max");
}

/**
 * Revalidate settings-related caches
 */
export function revalidateSettings() {
  revalidateTag("settings", "max");
}

/**
 * Revalidate all admin caches
 */
export function revalidateAllAdmin() {
  revalidateTag("dashboard", "max");
  revalidateTag("events", "max");
  revalidateTag("settings", "max");
  revalidateTag("categories", "max");
  revalidateTag("sponsors", "max");
}
