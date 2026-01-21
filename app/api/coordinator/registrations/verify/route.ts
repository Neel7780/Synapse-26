import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { registration_id, event_id, status } = body;

    if (!registration_id || !event_id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate status value
    if (status !== "verified" && status !== "pending") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Verify that the coordinator owns this event
    const { data: eventData } = await supabase
      .from("event")
      .select("coordinator_email")
      .eq("event_id", event_id)
      .single();

    if (!eventData || eventData.coordinator_email !== userData.email) {
      return NextResponse.json({ error: "Access denied to this event" }, { status: 403 });
    }

    // Update the coordinator_status
    const { data, error } = await supabase
      .from("event_registrations")
      .update({ coordinator_status: status })
      .eq("registration_id", registration_id)
      .eq("event_id", event_id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error verifying registration:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
