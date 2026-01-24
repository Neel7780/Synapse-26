import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/checkAdmin";

// GET - Fetch all accommodation bookings for manual verification (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get pagination and filter parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");

    const offset = (page - 1) * limit;

    // Build query - simple select without join
    let query = supabase
      .from("accommodation_bookings")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("verification_status", status);
    }

    // Apply pagination
    const { data: bookings, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get user details separately if needed
    const userIds = [...new Set(bookings?.map((b: any) => b.user_id).filter(Boolean))];
    let usersMap: Record<string, any> = {};

    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("user_id, user_name, email, phone")
        .in("user_id", userIds);

      if (users) {
        usersMap = users.reduce((acc: any, user: any) => {
          acc[user.user_id] = user;
          return acc;
        }, {});
      }
    }

    // Transform data to match expected format
    const orders = bookings?.map((booking: any) => {
      const user = usersMap[booking.user_id] || {};
      return {
        order_id: booking.booking_id,
        booking_id: booking.booking_id,
        user_id: booking.user_id,
        user_name: user.user_name || null,
        user_email: user.email || null,
        user_phone: user.phone || null,
        order_date: booking.created_at,
        check_in: booking.check_in,
        check_out: booking.check_out,
        nights: booking.nights,
        amount: booking.amount,
        verification_status: booking.verification_status || "pending",
        payment_screenshot_url: booking.payment_screenshot_url,
        transaction_reference: booking.transaction_reference,
        admin_notes: booking.admin_notes,
        rejection_reason: booking.rejection_reason,
        verified_at: booking.verified_at,
        created_at: booking.created_at,
      };
    }) || [];

    // Get summary stats
    const { data: allBookings } = await supabase
      .from("accommodation_bookings")
      .select("verification_status, amount");

    const summary = {
      total_orders: count || 0,
      pending_verification: allBookings?.filter((o: any) => (o.verification_status || "pending") === "pending").length || 0,
      verified: allBookings?.filter((o: any) => o.verification_status === "verified").length || 0,
      rejected: allBookings?.filter((o: any) => o.verification_status === "rejected").length || 0,
      total_revenue: allBookings?.filter((o: any) => o.verification_status === "verified").reduce((sum: number, o: any) => sum + (o.amount || 0), 0) || 0,
    };

    return NextResponse.json(
      {
        orders,
        count,
        summary,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching accommodation bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
