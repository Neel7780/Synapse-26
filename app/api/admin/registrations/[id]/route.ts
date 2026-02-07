import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { checkAdmin } from "@/lib/checkAdmin";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = (await createClient()) as any;
    
    // Check admin permissions
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id: registrationId } = await params;

    if (!registrationId) {
      return NextResponse.json(
        { error: "Registration ID is required" },
        { status: 400 }
      );
    }

    // Use admin client for data fetching to bypass RLS
    const adminSupabase = getSupabaseAdmin();

    const { data, error } = await adminSupabase
      .from("event_registrations")
      .select(
        `
        transaction_id,
        registration_id,
        payment_status,
        gross_amount,
        created_at,
        users (
          user_name,
          email,
          phone,
          college
        ),
        coordinator_status,
        team (
          team_members ( user_id )
        ),
        event_fee (
          event (
            event_name,
            event_category ( category_name )
          ),
          fee (
            participation_type
          )
        )
        `
      )
      .eq("registration_id", parseInt(registrationId))
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    // payment_method_id column not in event_registrations - gateway treated as 0
    const price = data.gross_amount ?? 0;
    const gateway = 0;
    const teamSize = data.team?.team_members?.length ?? 1;

    return NextResponse.json({
      user: {
        name: data.users?.user_name,
        email: data.users?.email,
        phone: data.users?.phone,
        college: data.users?.college,
      },
      event: {
        event_name: data.event_fee?.event?.event_name,
        category: data.event_fee?.event?.event_category?.category_name,
        participation_type: data.event_fee?.fee?.participation_type,
        team_size: teamSize,
        registration_date: data.created_at,
      },
      coordinator_status: data.coordinator_status ?? null,
      payment: {
        method: null,
        status: data.payment_status,
      },
      financials: {
        transaction_id: data.transaction_id,
        gross_amount: price,
        gateway_charge: gateway,
        net_amount: price - gateway,
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
