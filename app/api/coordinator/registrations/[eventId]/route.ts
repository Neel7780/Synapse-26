import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
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

    const params = await context.params;
    const { eventId: eventIdParam } = params;

    const eventId = parseInt(eventIdParam, 10);

    if (Number.isNaN(eventId)) {
      return NextResponse.json({ error: "Invalid event id" }, { status: 400 });
    }

    // Verify that the coordinator owns this event and fetch event details
    const { data: eventData, error: eventError } = await supabase
      .from("event")
      .select("event_id, event_name, event_date, description, coordinator_email")
      .eq("event_id", eventId)
      .single();

    if (!eventData || eventError) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (eventData.coordinator_email !== userData.email) {
      return NextResponse.json({ error: "Access denied to this event" }, { status: 403 });
    }

    // Fetch registrations for this event with user details and fee info
    const { data: registrations, error: regError } = await supabase
      .from("event_registrations")
      .select(`
        registration_id,
        event_id,
        event_fee_id,
        registered_by_user_id,
        registration_date,
        payment_status,
        coordinator_status,
        gross_amount,
        transaction_id,
        payment_screenshot_url,
        created_at,
        users (
          user_id,
          user_name,
          email,
          phone,
          college
        ),
        fee:event_fee_id (
          participation_type,
          min_members,
          max_members,
          price
        )
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (regError) {
      return NextResponse.json({ error: regError.message }, { status: 500 });
    }

    return NextResponse.json({
      event: {
        event_id: eventData.event_id,
        event_name: eventData.event_name,
        event_date: eventData.event_date,
        description: eventData.description,
      },
      registrations: registrations || [],
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
