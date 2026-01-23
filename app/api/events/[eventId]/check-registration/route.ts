import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

/**
 * GET /api/events/[eventId]/check-registration
 * Checks if the authenticated user is registered for the specified event
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const supabase = await createClient();
    const params = await context.params;
    const { eventId } = params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate eventId
    const eventIdNum = parseInt(eventId, 10);
    if (isNaN(eventIdNum)) {
      return NextResponse.json(
        { error: "Invalid event ID" },
        { status: 400 }
      );
    }

    // Check if user is registered for this event
    const { data: registration, error: regError } = await supabase
      .from("event_registrations")
      .select(`
        registration_id,
        event_id,
        payment_status,
        coordinator_status,
        registration_date,
        event_fee (
          event (
            event_name,
            event_category (
              category_name
            )
          )
        )
      `)
      .eq("registered_by_user_id", user.id)
      .eq("event_id", eventIdNum)
      .maybeSingle();

    if (regError) {
      console.error("Error checking registration:", regError);
      return NextResponse.json(
        { error: "Failed to check registration" },
        { status: 500 }
      );
    }

    if (!registration) {
      return NextResponse.json({
        isRegistered: false,
        registration: null,
      });
    }

    // Extract event details
    const eventFee = registration.event_fee as {
      event?: {
        event_name?: string;
        event_category?: { category_name?: string };
      };
    } | null;

    return NextResponse.json({
      isRegistered: true,
      registration: {
        registration_id: registration.registration_id,
        event_id: registration.event_id,
        payment_status: registration.payment_status,
        coordinator_status: registration.coordinator_status,
        registration_date: registration.registration_date,
        event_name: eventFee?.event?.event_name || null,
        category_name: eventFee?.event?.event_category?.category_name || null,
      },
    });
  } catch (error: unknown) {
    console.error("Error in check-registration:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
