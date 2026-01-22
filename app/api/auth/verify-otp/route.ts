import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { email, token, type = "email" } = body;

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and OTP token are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: type as "email" | "signup" | "recovery",
    });

    if (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!",
      user: data.user,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
