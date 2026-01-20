import { checkAdmin } from "@/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = (await createClient()) as any;

    // Check admin authentication using cookie-based session
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check for query errors early
    const { data: testData, error: testError } = await supabase
      .from("event_registrations")
      .select("registration_id")
      .limit(1);

    if (testError) {
      console.error("Database connection error:", testError);
      return NextResponse.json(
        { error: `Database error: ${testError.message}` },
        { status: 500 }
      );
    }

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
    const yesterdayEnd = today.toISOString();

    // Fetch all stats in parallel
    const [
      eventsResult,
      registrationsResult,
      usersResult,
      sponsorsResult,
      todayRegistrationsResult,
      yesterdayRegistrationsResult,
      allRegistrationsResult,
    ] = await Promise.all([
      // Total events count
      supabase
        .from("event")
        .select("event_id", { count: "exact", head: true }),

      // Total registrations count
      supabase
        .from("event_registrations")
        .select("registration_id", { count: "exact", head: true }),

      // Total users count
      supabase
        .from("users")
        .select("user_id", { count: "exact", head: true }),

      // Total sponsors count
      supabase
        .from("sponsors")
        .select("sponsor_id", { count: "exact", head: true }),

      // Today's registrations with payment details
      supabase
        .from("event_registrations")
        .select(
          `
          registration_id,
          transaction_id,
          payment_status,
          gross_amount,
          created_at,
          registered_by_user_id,
          users(user_name, email, college),
          event_fee(
            event(event_name),
            fee(participation_type)
          ),
          payment_method(method_name, gateway_charge)
        `
        )
        .not("created_at", "is", null)
        .gte("created_at", todayStart)
        .lt("created_at", todayEnd)
        .order("created_at", { ascending: false }),

      // Yesterday's registrations for comparison
      supabase
        .from("event_registrations")
        .select("registration_id, payment_status, gross_amount, created_at, payment_method(gateway_charge)")
        .not("created_at", "is", null)
        .gte("created_at", yesterdayStart)
        .lt("created_at", yesterdayEnd),

      // All registrations for recent list (last 5 paid)
      supabase
        .from("event_registrations")
        .select(
          `
          registration_id,
          transaction_id,
          payment_status,
          gross_amount,
          created_at,
          registered_by_user_id,
          users(user_name, email, college),
          event_fee(
            event(event_name),
            fee(participation_type)
          ),
          payment_method(method_name, gateway_charge)
        `
        )
        .eq("payment_status", "done")
        .not("created_at", "is", null)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    // Check for errors in any of the queries
    const errors = [
      eventsResult.error,
      registrationsResult.error,
      usersResult.error,
      sponsorsResult.error,
      todayRegistrationsResult.error,
      yesterdayRegistrationsResult.error,
      allRegistrationsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      console.error("Database query errors:", errors);
      // Continue with empty data rather than failing completely
      // Some queries might fail but others might succeed
    }

    // Calculate totals
    const totalEvents = eventsResult.count ?? 0;
    const totalRegistrations = registrationsResult.count ?? 0;
    const totalUsers = usersResult.count ?? 0;
    const totalSponsors = sponsorsResult.count ?? 0;

    // Calculate today's revenue
    let todayGrossRevenue = 0;
    let todayGatewayCharges = 0;
    let todayRegistrations = 0;
    const todayRegistrationsData = todayRegistrationsResult.data ?? [];
    
    todayRegistrationsData.forEach((reg: any) => {
      if (reg.payment_status === "done") {
        todayRegistrations += 1;
        todayGrossRevenue += reg.gross_amount ?? 0;
        todayGatewayCharges += reg.payment_method?.gateway_charge ?? 0;
      }
    });

    const todayNetRevenue = todayGrossRevenue - todayGatewayCharges;

    // Calculate yesterday's revenue for comparison
    let yesterdayGrossRevenue = 0;
    let yesterdayGatewayCharges = 0;
    const yesterdayRegistrationsData = yesterdayRegistrationsResult.data ?? [];
    
    yesterdayRegistrationsData.forEach((reg: any) => {
      if (reg.payment_status === "done") {
        yesterdayGrossRevenue += reg.gross_amount ?? 0;
        yesterdayGatewayCharges += reg.payment_method?.gateway_charge ?? 0;
      }
    });

    const yesterdayNetRevenue = yesterdayGrossRevenue - yesterdayGatewayCharges;

    // Calculate revenue change percentage
    const revenueChange = yesterdayNetRevenue > 0
      ? ((todayNetRevenue - yesterdayNetRevenue) / yesterdayNetRevenue) * 100
      : todayNetRevenue > 0 ? 100 : 0;

    // Calculate registration change (count)
    const yesterdayRegistrations = yesterdayRegistrationsData.filter(
      (reg: any) => reg.payment_status === "done"
    ).length;
    const registrationChange = yesterdayRegistrations > 0
      ? ((todayRegistrations - yesterdayRegistrations) / yesterdayRegistrations) * 100
      : todayRegistrations > 0 ? 100 : 0;

    // Format recent registrations
    const recentRegistrations = (allRegistrationsResult.data ?? []).map((reg: any) => {
      const date = reg.created_at ? new Date(reg.created_at).toISOString().split("T")[0] : "";
      return {
        id: reg.registration_id,
        userName: reg.users?.user_name || "Unknown",
        event: reg.event_fee?.event?.event_name || "Unknown Event",
        date,
        status: reg.payment_status,
        amount: reg.gross_amount ?? 0,
      };
    });

    // Get count of active events (registration open)
    const { count: activeEventsCount } = await supabase
      .from("event")
      .select("event_id", { count: "exact", head: true })
      .eq("is_registration_open", true);

    // Get count of new events added today
    // Note: event table might not have created_at, so we'll skip this for now
    // or use registration_date from event_registrations as a proxy
    const newEventsToday = 0;

    // Response data
    const stats = {
      totalEvents,
      totalRegistrations,
      totalUsers,
      totalSponsors,
      activeEvents: activeEventsCount ?? 0,
      newEventsToday: newEventsToday ?? 0,
    };

    const revenue = {
      today: {
        gross: todayGrossRevenue,
        gatewayCharges: todayGatewayCharges,
        net: todayNetRevenue,
        change: Math.round(revenueChange * 10) / 10, // Round to 1 decimal
      },
    };

    const recentRegistrationsList = recentRegistrations;

    const quickStats = [
      {
        label: "Registrations",
        value: todayRegistrations.toString(),
        change: `${registrationChange >= 0 ? "+" : ""}${Math.round(registrationChange)}%`,
        positive: registrationChange >= 0,
      },
      {
        label: "Revenue",
        value: `₹${Math.round(todayNetRevenue / 1000)}K`,
        change: `${revenueChange >= 0 ? "+" : ""}${Math.round(revenueChange)}%`,
        positive: revenueChange >= 0,
      },
      // Note: Page views would need analytics integration
      // For now, we can leave it as a placeholder or fetch from analytics API
    ];

    return NextResponse.json({
      stats,
      revenue,
      recentRegistrations: recentRegistrationsList,
      quickStats,
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
