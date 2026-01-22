import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = (await createClient()) as SupabaseClient;

    const { data } = await supabase.from("payment_method").select(`*`);

    return NextResponse.json({ data: data });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = (await createClient()) as SupabaseClient;
    const body = await request.json();

    const { data } = await supabase
      .from("payment_method")
      .upsert(body)
      .select(`*`);

    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
