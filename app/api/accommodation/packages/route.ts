import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * GET /api/accommodation/packages
 * Public endpoint to fetch available accommodation packages
 */
export async function GET() {
    try {
        const supabase = getSupabaseServer();

        const { data: packages, error } = await supabase
            .from("accommodation_type")
            .select("*")
            .eq("is_available", true)
            .order("id", { ascending: true });

        if (error) {
            console.error("Error fetching accommodation packages:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({
            packages: packages || [],
            count: packages?.length || 0
        });
    } catch (error: unknown) {
        console.error("Error in accommodation packages:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
