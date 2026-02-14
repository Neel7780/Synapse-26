import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { checkAdmin } from "@/lib/checkAdmin";
import { NextRequest, NextResponse } from "next/server";
import { handleCorsResponse, addCorsHeaders } from '@/lib/cors'

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return handleCorsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const supabase = (await createClient()) as any;

    if (!(await checkAdmin(supabase as Parameters<typeof checkAdmin>[0]))) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return addCorsHeaders(response, origin);
    }

    // Use admin client for data fetching to bypass RLS
    const adminSupabase = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const search = searchParams.get("searchParams") ?? ""; // name,email,college,transactionId
    const eventFilter = searchParams.get("filter");
    const paymentStatus = searchParams.get("paymentStatus");

    let eventIds: number[] | null = null;
    if (eventFilter) {
      const { data: eventRows, error: eventError } = await adminSupabase
        .from("event")
        .select("event_id")
        .eq("event_name", eventFilter);

      if (eventError) {
        console.error("Event lookup error:", eventError);
        return NextResponse.json(
          { error: "Failed to resolve event filter" },
          { status: 500 }
        );
      }

      eventIds = (eventRows ?? []).map((row: any) => row.event_id).filter(Boolean);
      if (eventIds.length === 0) {
        return NextResponse.json({
          page,
          limit,
          total: 0,
          summary: {
            total_registrations: 0,
            paid: 0,
            gross_revenue: 0,
            gateway_charges: 0,
            net_revenue: 0,
          },
          data: [],
        });
      }
    }

    let searchEventIds: number[] | null = null;
    if (search.trim() !== "") {
      const { data: searchEventRows, error: searchEventError } = await adminSupabase
        .from("event")
        .select("event_id")
        .ilike("event_name", `%${search}%`);

      if (searchEventError) {
        console.error("Event search error:", searchEventError);
        return NextResponse.json(
          { error: "Failed to resolve search events" },
          { status: 500 }
        );
      }

      const resolved = (searchEventRows ?? []).map((row: any) => row.event_id).filter(Boolean);
      searchEventIds = resolved.length > 0 ? resolved : null;
    }

    const buildQueryUsers = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registered_by_user_id,
      transaction_id,
      registration_id,
      payment_status,
        coordinator_status,
      payment_screenshot_url,
      gross_amount,
      team (
        team_members ( user_id )
      ), 
      users(user_name,email,college),
      event(event_name,event_category(category_name)),
      fee(participation_type)
      `,
          { count: "exact" }
        );

      if (search.trim() !== "") {
        q = q.or(
          `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`,
          { foreignTable: "users" }
        );
      }

      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    const buildQueryTxn = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registered_by_user_id,
      transaction_id,
      registration_id,
      payment_status,
        coordinator_status,
      payment_screenshot_url,
      gross_amount,
      team (
        team_members ( user_id )
      ), 
      users(user_name,email,college),
      event(event_name,event_category(category_name)),
      fee(participation_type)
      `,
          { count: "exact" }
        );

      if (search.trim() !== "") {
        q = q.ilike("transaction_id", `%${search}%`);
      }

      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    const buildQueryEvent = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registered_by_user_id,
      transaction_id,
      registration_id,
      payment_status,
        coordinator_status,
      payment_screenshot_url,
      gross_amount,
      team (
        team_members ( user_id )
      ), 
      users(user_name,email,college),
      event(event_name,event_category(category_name)),
      fee(participation_type)
      `,
          { count: "exact" }
        );

      if (searchEventIds) q = q.in("event_id", searchEventIds);
      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    // 1. Fetch Paginated Data for Table Display
    const { data: d1 } = await buildQueryUsers().range(from, to);
    const { data: d2 } = await buildQueryTxn().range(from, to);
    const { data: d3 } = searchEventIds ? await buildQueryEvent().range(from, to) : { data: [] };

    const merged = [...(d1 ?? []), ...(d2 ?? []), ...(d3 ?? [])];

    const filtered = merged.filter((row: any) => {
      if (eventFilter && row.event?.event_name !== eventFilter) return false;
      return true;
    });

    const uniqueMap = new Map();
    filtered.forEach((row: any) => {
      uniqueMap.set(row.registration_id, row);
    });

    const uniqueData = Array.from(uniqueMap.values());

    // Gateway charges treated as 0 (payment_method_id column not in event_registrations)
    const getGateway = (_row: any) => 0;

    // 2. Fetch ALL Data for Summary Statistics (Revenue, Counts)
    // When no filters: use a single direct query (no joins) for reliable counts
    const hasFilters = search.trim() !== "" || eventFilter || paymentStatus;
    let uniqueSummaryData: any[];

    if (!hasFilters) {
      const { data: directData, error: directError } = await adminSupabase
        .from("event_registrations")
        .select("registration_id, payment_status, coordinator_status, gross_amount");
      if (directError) {
        console.error("Direct summary query error:", directError);
      }
      uniqueSummaryData = directData ?? [];
    } else {
      // With filters: use the original dual-query approach
    const buildSummaryQueryUsers = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registration_id,
          payment_status,
          coordinator_status,
          gross_amount,
          users(user_name,email,college),
          event(event_name)
          `
        );

      if (search.trim() !== "") {
        q = q.or(
          `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`,
          { foreignTable: "users" }
        );
      }

      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    const buildSummaryQueryTxn = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registration_id,
          payment_status,
          coordinator_status,
          gross_amount,
          event(event_name)
          `
        );

      if (search.trim() !== "") {
        q = q.ilike("transaction_id", `%${search}%`);
      }

      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    const buildSummaryQueryEvent = () => {
      let q = adminSupabase
        .from("event_registrations")
        .select(
          `
          registration_id,
          payment_status,
          coordinator_status,
          gross_amount,
          event(event_name)
          `
        );

      if (searchEventIds) q = q.in("event_id", searchEventIds);
      if (eventIds) q = q.in("event_id", eventIds);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus as any);

      return q;
    };

    const { data: s1, error: e1 } = await buildSummaryQueryUsers();
    const { data: s2, error: e2 } = await buildSummaryQueryTxn();
    const { data: s3, error: e3 } = searchEventIds ? await buildSummaryQueryEvent() : { data: [], error: null };

    if (e1 || e2 || e3) {
      console.error("Summary query error:", e1, e2, e3);
    }

    const mergedSummary = [...(s1 ?? []), ...(s2 ?? []), ...(s3 ?? [])];

    // Filter summary data (same logic as above for event name match if needed)
    const filteredSummary = mergedSummary.filter((row: any) => {
      if (eventFilter && row.event?.event_name !== eventFilter) return false;
      return true;
    });

    // Deduplicate summary data
    const uniqueSummaryMap = new Map();
    filteredSummary.forEach((row: any) => {
      uniqueSummaryMap.set(row.registration_id, row);
    });
    uniqueSummaryData = Array.from(uniqueSummaryMap.values());
    }

    const totalRegistrations = uniqueSummaryData.length;
    let paid = 0;
    let grossRevenue = 0;
    let gatewayCharges = 0;
    let netRevenue = 0;

    uniqueSummaryData.forEach((row: any) => {
      const price = row.gross_amount ?? 0;
      const gateway = getGateway(row);
      const pStatus = row.payment_status?.toLowerCase();
      const cStatus = row.coordinator_status?.toLowerCase();

      // Relaxed status check: 'done', 'paid', 'success' are all valid payment states
      const isPaid = pStatus === "done" || pStatus === "paid" || pStatus === "success";

      // Only count revenue if paid AND coordinator has accepted
      if (isPaid && cStatus === "accepted") {
        paid += 1;
        grossRevenue += price;
        gatewayCharges += gateway;
        netRevenue += price - gateway;
      }
    });

    const missingUserIds = Array.from(
      new Set(
        (uniqueData ?? [])
          .filter((row: any) => {
            const user = Array.isArray(row.users) ? row.users[0] : row.users;
            return !user?.user_name && row.registered_by_user_id;
          })
          .map((row: any) => row.registered_by_user_id)
      )
    );

    const fallbackUsers = new Map<string, { user_name?: string; college?: string }>();
    if (missingUserIds.length > 0) {
      const { data: userRows, error: userError } = await adminSupabase
        .from("users")
        .select("user_id, user_name, college")
        .in("user_id", missingUserIds);

      if (userError) {
        console.error("Fallback user lookup error:", userError);
      }

      (userRows ?? []).forEach((u: any) => {
        fallbackUsers.set(u.user_id, { user_name: u.user_name, college: u.college });
      });
    }

    const rows =
      uniqueData?.map((row: any) => {
        const price = row.gross_amount ?? 0;
        const gateway = getGateway(row);
        const groupSize = row.team?.team_members?.length ?? 1;
        const user = Array.isArray(row.users) ? row.users[0] : row.users;
        const fallback = row.registered_by_user_id
          ? fallbackUsers.get(row.registered_by_user_id)
          : null;
        return {
          registration_id: row?.registration_id,
          transaction_id: row?.transaction_id,
          user_name: user?.user_name ?? fallback?.user_name,
          college: user?.college ?? fallback?.college,
          event_name: row.event?.event_name,
          category: row.event?.event_category?.category_name,
          participation_type: row.fee?.participation_type,
          payment_method: null,
          group_size: groupSize,
          payment_status: row.payment_status,
          coordinator_status: row.coordinator_status ?? null,
          payment_screenshot_url: row.payment_screenshot_url,
          gross_amount: price,
          gateway_charge: gateway,
          net_amount: price - gateway,
        };
      }) ?? [];

    return NextResponse.json({
      page,
      limit,
      total: totalRegistrations,
      summary: {
        total_registrations: totalRegistrations,
        paid,
        gross_revenue: grossRevenue,
        gateway_charges: gatewayCharges,
        net_revenue: netRevenue,
      },
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}