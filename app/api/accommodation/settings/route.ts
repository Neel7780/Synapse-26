import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * GET /api/accommodation/settings
 * Public endpoint to fetch accommodation-related settings (QR URL, etc.)
 */
export async function GET() {
    try {
        const supabase = getSupabaseServer();

        // Fetch accommodation QR URL from app_settings
        const { data, error } = await supabase
            .from("app_settings")
            .select("key, value")
            .in("key", ["accommodation_qr_url", "payment_qr_url"]);

        if (error) {
            console.error("Error fetching accommodation settings:", error);
            return NextResponse.json(
                { error: error.message },
                { status: 500 }
            );
        }

        // Build settings object from key-value pairs
        const settings: Record<string, string | null> = {};
        data?.forEach((row) => {
            settings[row.key] = row.value;
        });

        // Prefer accommodation_qr_url, fall back to payment_qr_url
        const qrUrl = settings["accommodation_qr_url"] || settings["payment_qr_url"] || null;

        return NextResponse.json({
            qr_url: qrUrl,
            settings
        });
    } catch (error: unknown) {
        console.error("Error in accommodation settings:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
