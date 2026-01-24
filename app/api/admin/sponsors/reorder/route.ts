import { checkAdmin } from "@/lib/checkAdmin";
import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = (await createClient()) as any;

    // Check admin authentication
    const isAdmin = await checkAdmin(supabase);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orders } = body;

    if (!orders || !Array.isArray(orders)) {
      return NextResponse.json(
        { error: "Orders array is required" },
        { status: 400 }
      );
    }

    // Update display_order for each sponsor
    const updatePromises = orders.map((item: { id: number; order: number }) =>
      supabase
        .from("sponsors")
        .update({ display_order: item.order })
        .eq("sponsor_id", item.id)
    );

    await Promise.all(updatePromises);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Reorder sponsors API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
