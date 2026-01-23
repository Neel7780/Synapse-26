import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// GET - Fetch all available merchandise products (public)
export async function GET() {
    try {
        const supabase = await createClient();

        const { data: products, error } = await supabase
            .from("merchandise_management")
            .select("*")
            .order("product_id", { ascending: true });

        if (error) {
            return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
        }

        return NextResponse.json({ products: products || [] }, { status: 200 });
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
