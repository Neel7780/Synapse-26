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
      return NextResponse.json({ isCoordinator: false }, { status: 401 });
    }

    // Fetch email from users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.email) {
      return NextResponse.json({ isCoordinator: false }, { status: 401 });
    }

    // SECURITY: Verify that user's email matches coordinator_email on at least one event
    const { data: coordinatorEvents, error: eventError } = await supabase
      .from("event")
      .select("event_id")
      .eq("coordinator_email", userData.email)
      .limit(1);

    if (eventError || !coordinatorEvents || coordinatorEvents.length === 0) {
      return NextResponse.json({ isCoordinator: false }, { status: 403 });
    }

    return NextResponse.json({
      isCoordinator: true,
      email: userData.email,
    });
  } catch (error) {
    console.error("Coordinator verification error:", error);
    return NextResponse.json({ isCoordinator: false }, { status: 500 });
  }
}
