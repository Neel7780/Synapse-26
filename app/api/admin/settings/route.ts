import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { uploadImage } from "@/lib/imageUtil";

const SETTINGS_BUCKET = "settings";

// GET: Fetch payment QR URL
export async function GET() {
    try {
        const supabase = getSupabaseServer();

        const { data, error } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", "payment_qr_url")
            .single();

        if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows found, which is fine
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            payment_qr_url: data?.value || null
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Upload QR image and update setting
export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("qrImage") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Upload to Supabase Storage
        const { publicUrl } = await uploadImage({
            file,
            bucket: SETTINGS_BUCKET,
            folder: "payment-qr",
        });

        // Update app_settings
        const supabase = getSupabaseServer();

        const { error } = await supabase
            .from("app_settings")
            .upsert({
                key: "payment_qr_url",
                value: publicUrl,
                updated_at: new Date().toISOString(),
            }, { onConflict: "key" });

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            payment_qr_url: publicUrl
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
