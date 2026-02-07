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

    // Get date ranges in IST (Asia/Kolkata) so "today" aligns with Indian users
    const tz = "Asia/Kolkata";
    const now = new Date();
    const todayIST = now.toLocaleDateString("en-CA", { timeZone: tz });
    const yesterdayDate = new Date(now.getTime() - 86400000);
    const yesterdayIST = yesterdayDate.toLocaleDateString("en-CA", { timeZone: tz });
    const todayStart = new Date(`${todayIST}T00:00:00+05:30`).toISOString();
    const todayEnd = new Date(new Date(`${todayIST}T00:00:00+05:30`).getTime() + 86400000).toISOString();
    const yesterdayStart = new Date(`${yesterdayIST}T00:00:00+05:30`).toISOString();

    // Gateway charges treated as 0 (payment_method_id column not in event_registrations)
    const getGatewayCharge = (_reg: any) => 0;

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
      allRegistrationsResult,
      accommodationResult,
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
        .select("registration_id, payment_status, coordinator_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd),

      // Yesterday's registrations for comparison
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, coordinator_status, gross_amount")
        .not("created_at", "is", null)
        .gte("created_at", yesterdayStart)
        .lt("created_at", todayStart),

      // Recent registrations (all statuses, limit 5)
      supabase
        .from("event_registrations")
        .select("registration_id, registered_by_user_id, payment_status, coordinator_status, gross_amount, created_at, event_id")
        .order("created_at", { ascending: false })
        .limit(5),

      // All registrations for overall revenue (paid + accepted only)
      supabase
        .from("event_registrations")
        .select("payment_status, coordinator_status, gross_amount"),

      // Accommodation summary (verified revenue)
      supabase
        .from("accommodation_bookings")
        .select("verification_status, amount"),
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
      allRegistrationsResult.error,
      accommodationResult.error,
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
      const pStatus = (reg.payment_status || "").toLowerCase();
      const cStatus = (reg.coordinator_status || "").toLowerCase();
      const isPaid = pStatus === "done" || pStatus === "paid" || pStatus === "success";
      if (isPaid && cStatus === "accepted") {
        todayPaidCount++;
        todayGross += reg.gross_amount ?? 0;
        todayGateway += getGatewayCharge(reg);
      }
    });

    const todayNet = todayGross - todayGateway;

    // Calculate yesterday's revenue for comparison
    let yesterdayGross = 0;
    let yesterdayGateway = 0;
    let yesterdayPaidCount = 0;

    (yesterdayRegistrationsResult.data ?? []).forEach((reg: any) => {
      const pStatus = (reg.payment_status || "").toLowerCase();
      const cStatus = (reg.coordinator_status || "").toLowerCase();
      const isPaid = pStatus === "done" || pStatus === "paid" || pStatus === "success";
      if (isPaid && cStatus === "accepted") {
        yesterdayPaidCount++;
        yesterdayGross += reg.gross_amount ?? 0;
        yesterdayGateway += getGatewayCharge(reg);
      }
    });

    const yesterdayNet = yesterdayGross - yesterdayGateway;

    // Calculate overall revenue (all paid + accepted registrations)
    let overallGross = 0;
    let overallGateway = 0;
    let paidCount = 0;
    (allRegistrationsResult.data ?? []).forEach((reg: any) => {
      const pStatus = (reg.payment_status || "").toLowerCase();
      const cStatus = (reg.coordinator_status || "").toLowerCase();
      const isPaid = pStatus === "done" || pStatus === "paid" || pStatus === "success";
      if (isPaid && cStatus === "accepted") {
        paidCount++;
        overallGross += reg.gross_amount ?? 0;
        overallGateway += getGatewayCharge(reg);
      }
    });
    const overallNet = overallGross - overallGateway;

    // Accommodation revenue
    const accommodationData = accommodationResult.data ?? [];
    const accommodationRevenue = accommodationData
      .filter((o: any) => o.verification_status === "verified")
      .reduce((sum: number, o: any) => sum + (o.amount || 0), 0);
    const accommodationVerified = accommodationData.filter((o: any) => o.verification_status === "verified").length;

    const totalGrossRevenue = overallGross + accommodationRevenue;
    const totalNetRevenue = overallNet + accommodationRevenue;
    const totalPaidCount = paidCount + accommodationVerified;

    // Enrich recent registrations with user and event names (fetch separately to avoid join issues)
    const recentRaw = recentRegistrationsResult.data ?? [];
    const userIds = [...new Set(recentRaw.map((r: any) => r.registered_by_user_id).filter(Boolean))];
    const eventIds = [...new Set(recentRaw.map((r: any) => r.event_id).filter(Boolean))];

    let usersMap: Record<string, { user_name: string | null }> = {};
    let eventsMap: Record<number, { event_name: string }> = {};
    if (userIds.length > 0) {
      const { data: usersData } = await supabase.from("users").select("user_id, user_name").in("user_id", userIds);
      usersMap = (usersData ?? []).reduce((acc: any, u: any) => { acc[u.user_id] = { user_name: u.user_name }; return acc; }, {});
    }
    if (eventIds.length > 0) {
      const { data: eventsData } = await supabase.from("event").select("event_id, event_name").in("event_id", eventIds);
      eventsMap = (eventsData ?? []).reduce((acc: any, e: any) => { acc[e.event_id] = { event_name: e.event_name }; return acc; }, {});
    }

    // Calculate change percentages
    const revenueChange = yesterdayNet > 0
      ? ((todayNet - yesterdayNet) / yesterdayNet) * 100
      : todayNet > 0 ? 100 : 0;

    const registrationChange = yesterdayPaidCount > 0
      ? ((todayPaidCount - yesterdayPaidCount) / yesterdayPaidCount) * 100
      : todayPaidCount > 0 ? 100 : 0;

    // Format recent registrations
    const recentRegistrations = recentRaw.map((reg: any) => ({
      id: reg.registration_id,
      userName: usersMap[reg.registered_by_user_id]?.user_name ?? "Unknown",
      event: eventsMap[reg.event_id]?.event_name ?? "Unknown Event",
      date: reg.created_at ? new Date(reg.created_at).toISOString().split("T")[0] : "",
      status: reg.payment_status ?? "pending",
      coordinatorStatus: reg.coordinator_status ?? null,
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
        gross: totalGrossRevenue,
        net: totalNetRevenue,
        paidCount: totalPaidCount,
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
