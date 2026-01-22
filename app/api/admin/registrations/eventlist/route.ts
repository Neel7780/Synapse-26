import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = (await createClient()) as SupabaseClient;
    const { data } = await supabase.from("event").select("event_name");

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const events = (data ?? []).map((e: { event_name: string }) => e.event_name);
    return NextResponse.json({ events });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
