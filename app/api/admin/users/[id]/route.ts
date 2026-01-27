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

    const { id: userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const adminSupabase = getSupabaseAdmin();

    const { data, error } = await adminSupabase
      .from("users")
      .select(
        `
            user_id,
            user_name,
            email,
            phone,
            college,
            registration_date,
            team_members (
            team (
            event_registrations (
            event (
            event_name
            ))))
            `
      )
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
    }

    const events: string[] = [];

    data.team_members?.forEach((tm: any) => {
      const eventName =
        tm.team?.event_registrations?.event?.event_name;

      if (eventName) {
        events.push(eventName);
      }
    });

    return NextResponse.json({
      user_name: data.user_name,
      email: data.email,
      phone: data.phone,
      college: data.college,
      registration_date: data.registration_date,
      event_count: events.length,
      events,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
