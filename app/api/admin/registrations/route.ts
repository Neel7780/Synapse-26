import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleCorsResponse, addCorsHeaders } from '@/lib/cors'

async function checkAdmin(supabase: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  return user.email === process.env.ADMIN_EMAIL;
}

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return handleCorsResponse(origin);
}

export async function GET(req: NextRequest) {
  try {
    const origin = req.headers.get("origin");
    const supabase = (await createClient()) as any;

    if (!(await checkAdmin(supabase))) {
      const response = NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      return addCorsHeaders(response, origin);
    }

    const { searchParams } = new URL(req.url);

    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 10);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const search = searchParams.get("searchParams") ?? ""; //name,email,college,transactionId
    const eventFilter = searchParams.get("filter");
    const paymentStatus = searchParams.get("paymentStatus");

    const buildQueryUsers = () => {
      let q = supabase
        .from("event_registrations")
        .select(
          `
      transaction_id,
      registration_id,
      payment_status,
      payment_screenshot_url,
      gross_amount,
      team (
        team_members ( user_id )
      ), 
      users!inner(user_name,email,college),
      event_fee(
        event(event_name,event_category(category_name)),
        fee(participation_type)
      )
      `,
          { count: "exact" }
        );

      if (search.trim() !== "") {
        q = q.or(
          `user_name.ilike.%${search}%,email.ilike.%${search}%,college.ilike.%${search}%`,
          { foreignTable: "users" }
        );
      }

      if (eventFilter) q = q.eq("event_fee.event.event_name", eventFilter);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus);

      return q;
    };

    const buildQueryTxn = () => {
      let q = supabase
        .from("event_registrations")
        .select(
          `
      transaction_id,
      registration_id,
      payment_status,
      payment_screenshot_url,
      gross_amount,
      team (
        team_members ( user_id )
      ), 
      users(user_name,email,college),
      event_fee(
        event(event_name,event_category(category_name)),
        fee(participation_type)
      )
      `,
          { count: "exact" }
        );

      if (search.trim() !== "") {
        q = q.ilike("transaction_id", `%${search}%`);
      }

      if (eventFilter) q = q.eq("event_fee.event.event_name", eventFilter);
      if (paymentStatus) q = q.eq("payment_status", paymentStatus);

      return q;
    };

    const { data: d1 } = await buildQueryUsers().range(from, to);
    const { data: d2 } = await buildQueryTxn().range(from, to);

    const merged = [...(d1 ?? []), ...(d2 ?? [])];

    const filtered = merged.filter((row: any) => {
      if (eventFilter && row.event_fee?.event?.event_name !== eventFilter) return false;
      return true;
    });

    const uniqueMap = new Map();
    filtered.forEach((row: any) => {
      uniqueMap.set(row.registration_id, row);
    });

    const uniqueData = Array.from(uniqueMap.values());

    const totalRegistrations = uniqueData?.length ?? 0;
    let paid = 0;
    let grossRevenue = 0;
    let gatewayCharges = 0;
    let netRevenue = 0;

    uniqueData?.forEach((row: any) => {
      const price = row.gross_amount ?? 0;
      const gateway = row.payment_method?.gateway_charge ?? 0;

      if (row.payment_status === "done") {
        paid += 1;
        grossRevenue += price;
        gatewayCharges += gateway;
        netRevenue += price - gateway;
      }
    });

    const rows =
      uniqueData?.map((row: any) => {
        const price = row.gross_amount ?? 0;
        const gateway = row.payment_method?.gateway_charge ?? 0;
        const groupSize = row.team?.team_members?.length ?? 1;

        return {
          registration_id: row?.registration_id,
          transaction_id: row?.transaction_id,
          user_name: row.users?.user_name,
          college: row.users?.college,
          event_name: row.event_fee?.event?.event_name,
          category: row.event_fee?.event?.event_category?.category_name,
          participation_type: row.event_fee?.fee?.participation_type,
          payment_method: row.payment_method?.method_name,
          group_size: groupSize,
          payment_status: row.payment_status,
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