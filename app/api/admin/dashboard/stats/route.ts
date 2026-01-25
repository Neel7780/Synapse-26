import { checkAdmin } from "@/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic for this API route since it uses cookies
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/dashboard/stats
 * 
 * Fetches dashboard statistics including:
 * - Total counts (events, registrations, users, sponsors)
 * - Today's revenue with comparison to yesterday
 * - Recent registrations
 * - Quick stats with change percentages
 * 
 * Requires admin authentication via cookie-based session.
 */
export async function GET(_req: NextRequest) {
  try {
    // Verify admin authentication using cookie-based session
    const userSupabase = await createClient();
    const isAdmin = await checkAdmin(userSupabase as Parameters<typeof checkAdmin>[0]);

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Use admin client for data fetching (bypasses RLS for performance)
    const supabase = getSupabaseAdmin();

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayEnd = tomorrow.toISOString();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStart = yesterday.toISOString();

    // Fetch all stats in parallel for optimal performance
    const [
      eventsResult,
      registrationsResult,
      usersResult,
      sponsorsResult,
      activeEventsResult,
      todayRegistrationsResult,
      yesterdayRegistrationsResult,
      recentRegistrationsResult,
    ] = await Promise.all([
      // Total counts (using head: true for efficiency)
      supabase.from("event").select("event_id", { count: "exact", head: true }),
      supabase.from("event_registrations").select("registration_id", { count: "exact", head: true }),
      supabase.from("users").select("user_id", { count: "exact", head: true }),
      supabase.from("sponsors").select("sponsor_id", { count: "exact", head: true }),
      supabase.from("event").select("event_id", { count: "exact", head: true }).eq("is_registration_open", true),

      // Today's registrations (only fetch needed fields)
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount, payment_method(gateway_charge)")
        .not("created_at", "is", null)
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),

      // Yesterday's registrations for comparison
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount, payment_method(gateway_charge)")
        .not("created_at", "is", null)
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart),

      // Recent paid registrations (limit 5)
      supabase
        .from("event_registrations")
        .select(`
          registration_id,
          payment_status,
          gross_amount,
          created_at,
          users(user_name),
          event(event_name)
        `)
        .eq("payment_status", "done")
        .not("created_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Log any errors but don't fail the request
    const queryErrors = [
      eventsResult.error,
      registrationsResult.error,
      usersResult.error,
      sponsorsResult.error,
      activeEventsResult.error,
      todayRegistrationsResult.error,
      yesterdayRegistrationsResult.error,
      recentRegistrationsResult.error,
    ].filter(Boolean);

    if (queryErrors.length > 0) {
      console.warn("Some dashboard queries had errors:", queryErrors);
    }

    // Calculate base stats
    const totalEvents = eventsResult.count ?? 0;
    const totalRegistrations = registrationsResult.count ?? 0;
    const totalUsers = usersResult.count ?? 0;
    const totalSponsors = sponsorsResult.count ?? 0;
    const activeEvents = activeEventsResult.count ?? 0;

    // Calculate today's revenue
    let todayGross = 0;
    let todayGateway = 0;
    let todayPaidCount = 0;

    (todayRegistrationsResult.data ?? []).forEach((reg: any) => {
      if (reg.payment_status === "done") {
        todayPaidCount++;
        todayGross += reg.gross_amount ?? 0;
        todayGateway += reg.payment_method?.gateway_charge ?? 0;
      }
    });

    const todayNet = todayGross - todayGateway;

    // Calculate yesterday's revenue for comparison
    let yesterdayGross = 0;
    let yesterdayGateway = 0;
    let yesterdayPaidCount = 0;

    (yesterdayRegistrationsResult.data ?? []).forEach((reg: any) => {
      if (reg.payment_status === "done") {
        yesterdayPaidCount++;
        yesterdayGross += reg.gross_amount ?? 0;
        yesterdayGateway += reg.payment_method?.gateway_charge ?? 0;
      }
    });

    const yesterdayNet = yesterdayGross - yesterdayGateway;

    // Calculate change percentages
    const revenueChange = yesterdayNet > 0
      ? ((todayNet - yesterdayNet) / yesterdayNet) * 100
      : todayNet > 0 ? 100 : 0;

    const registrationChange = yesterdayPaidCount > 0
      ? ((todayPaidCount - yesterdayPaidCount) / yesterdayPaidCount) * 100
      : todayPaidCount > 0 ? 100 : 0;

    // Format recent registrations
    const recentRegistrations = (recentRegistrationsResult.data ?? []).map((reg: any) => ({
      id: reg.registration_id,
      userName: reg.users?.user_name || "Unknown",
      event: reg.event?.event_name || "Unknown Event",
      date: reg.created_at ? new Date(reg.created_at).toISOString().split("T")[0] : "",
      status: reg.payment_status,
      amount: reg.gross_amount ?? 0,
    }));

    // Build response
    const response = {
      stats: {
        totalEvents,
        totalRegistrations,
        totalUsers,
        totalSponsors,
        activeEvents,
      },
      revenue: {
        today: {
          gross: todayGross,
          gatewayCharges: todayGateway,
          net: todayNet,
          change: Math.round(revenueChange * 10) / 10,
        },
      },
      recentRegistrations,
      quickStats: [
        {
          label: "Registrations",
          value: todayPaidCount.toString(),
          change: `${registrationChange >= 0 ? "+" : ""}${Math.round(registrationChange)}%`,
          positive: registrationChange >= 0,
        },
        {
          label: "Revenue",
          value: todayNet >= 1000 ? `₹${Math.round(todayNet / 1000)}K` : `₹${todayNet}`,
          change: `${revenueChange >= 0 ? "+" : ""}${Math.round(revenueChange)}%`,
          positive: revenueChange >= 0,
        },
      ],
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error: unknown) {
    console.error("Dashboard stats API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
