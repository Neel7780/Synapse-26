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

    const search = searchParams.get("searchParams") ?? "";
    const eventFilter = searchParams.get("filter");
    const paymentStatus = searchParams.get("paymentStatus");

    let query = supabase.from("event_registrations").select(
      `
      registration_id,
      transaction_id,
      payment_status,
      team (
        team_members ( user_id )
      ),
      users(user_name,email,college),
      event(event_name,event_category(category_name)),
      fee(participation_type,price,qr_code)
      `
    );

    if (search.trim()) {
      query = query.or(
        `
        transaction_id.ilike.%${search}%,
        users.user_name.ilike.%${search}%,
        users.email.ilike.%${search}%,
        users.college.ilike.%${search}%
        `
      );
    }

    if (eventFilter) {
      query = query.eq("event.event_name", eventFilter);
    }

    if (paymentStatus) {
      query = query.eq("payment_status", paymentStatus);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    const headers = [
      "Registration ID",
      "Transaction ID",
      "User Name",
      "Email",
      "College",
      "Event Name",
      "Category",
      "Participation Type",
      "Group Size",
      "Payment Status",
      "Gross Amount",
      "QR Code",
    ];

    const csvRows = [
      headers.join(","),
      ...(data ?? []).map((row: any) => {
        const price = row.fee?.price ?? 0;
        const groupSize = row.team?.team_members?.length ?? 1;

        return [
          row.registration_id,
          row.transaction_id,
          `"${row.users?.user_name}"`,
          row.users?.email,
          `"${row.users?.college}"`,
          `"${row.event?.event_name}"`,
          `"${row.event?.event_category?.category_name}"`,
          row.fee?.participation_type,
          groupSize,
          row.payment_status,
          price,
          row.fee?.qr_code,
        ].join(",");
      }),
    ];

    const csv = csvRows.join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="registrations.csv"`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
