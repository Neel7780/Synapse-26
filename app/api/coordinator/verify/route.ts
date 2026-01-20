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

    // Fetch email from users table (FK target), no role flag required
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email")
      .eq("user_id", user.id)
      .single();

    if (userError || !userData?.email) {
      return NextResponse.json({ isCoordinator: false }, { status: 401 });
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
