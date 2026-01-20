import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coordinator email
    const { data: userData } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (!userData?.email) {
      return NextResponse.json({ error: "User email not found" }, { status: 400 });
    }

    // Fetch events where coordinator_email matches user's email
    const { data: events, error: eventsError } = await supabase
      .from("event")
      .select(`
        event_id,
        event_name,
        event_date,
        description,
        event_picture,
        is_registration_open,
        category_id,
        event_category (
          category_name
        )
      `)
      .eq("coordinator_email", userData.email);

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (error) {
    console.error("Error fetching coordinator events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
