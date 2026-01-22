import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = (await createClient()) as SupabaseClient;
    const { data } = await supabase.from("event").select("event_name");

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
