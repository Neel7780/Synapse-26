import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabaseServer";
import { uploadImage, deleteImage } from "@/lib/imageUtil";
import { revalidateSettings } from "@/lib/adminData";

const SETTINGS_BUCKET = "settings";

/**
 * Verify admin authentication using cookie-based session
 */
async function verifyAdmin(): Promise<{ isAdmin: boolean; error?: string }> {
    try {
        const supabase = await createClient();
        const {
            data: { user },
            error,
        } = await supabase.auth.getUser();

        if (error || !user || !user.email) {
            return { isAdmin: false, error: "Unauthorized" };
        }

        const isAdmin = user.email === process.env.ADMIN_EMAIL;
        return { isAdmin, error: isAdmin ? undefined : "Forbidden: Admin access required" };
    } catch {
        return { isAdmin: false, error: "Authentication failed" };
    }
}

/**
 * GET: Fetch admin settings
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
    // Verify admin access
    const { isAdmin, error: authError } = await verifyAdmin();
    if (!isAdmin) {
        return NextResponse.json(
            { error: authError || "Unauthorized" },
            { status: authError === "Forbidden: Admin access required" ? 403 : 401 }
        );
    }

    try {
        const supabase = getSupabaseAdmin();

        // Fetch all settings in one query
        const { data, error } = await supabase
            .from("app_settings")
            .select("key, value, updated_at")
            .in("key", ["payment_qr_url"]);

        if (error) {
            console.error("Failed to fetch settings:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Build settings object
        const settings: Record<string, string | null> = {
            payment_qr_url: null,
        };

        data?.forEach((setting) => {
            settings[setting.key] = setting.value;
        });

        return NextResponse.json(settings, {
            headers: {
                "Cache-Control": "private, max-age=60",
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("GET /api/admin/settings error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * POST: Upload QR image and update setting
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
    // Verify admin access
    const { isAdmin, error: authError } = await verifyAdmin();
    if (!isAdmin) {
        return NextResponse.json(
            { error: authError || "Unauthorized" },
            { status: authError === "Forbidden: Admin access required" ? 403 : 401 }
        );
    }

    try {
        const formData = await request.formData();
        const file = formData.get("qrImage") as File | null;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF" },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size: 5MB" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseAdmin();

        // Get current QR URL to delete old file
        const { data: currentSetting } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", "payment_qr_url")
            .single();

        // Delete old image if exists
        if (currentSetting?.value) {
            try {
                const url = new URL(currentSetting.value);
                const pathParts = url.pathname.split(`/storage/v1/object/public/${SETTINGS_BUCKET}/`);
                if (pathParts.length > 1) {
                    await deleteImage({
                        bucket: SETTINGS_BUCKET,
                        filePath: pathParts[1],
                    });
                }
            } catch (deleteError) {
                console.warn("Failed to delete old QR image:", deleteError);
                // Continue with upload even if delete fails
            }
        }

        // Upload new image to Supabase Storage
        const { publicUrl } = await uploadImage({
            file,
            bucket: SETTINGS_BUCKET,
            folder: "payment-qr",
        });

        // Update app_settings
        const { error } = await supabase.from("app_settings").upsert(
            {
                key: "payment_qr_url",
                value: publicUrl,
                updated_at: new Date().toISOString(),
            },
            { onConflict: "key" }
        );

        if (error) {
            console.error("Failed to update setting:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Revalidate settings cache
        revalidateSettings();

        return NextResponse.json({
            success: true,
            payment_qr_url: publicUrl,
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("POST /api/admin/settings error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

/**
 * DELETE: Remove a setting value (e.g., payment QR)
 * Requires admin authentication
 */
export async function DELETE(request: NextRequest) {
    // Verify admin access
    const { isAdmin, error: authError } = await verifyAdmin();
    if (!isAdmin) {
        return NextResponse.json(
            { error: authError || "Unauthorized" },
            { status: authError === "Forbidden: Admin access required" ? 403 : 401 }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get("key");

        if (!key) {
            return NextResponse.json({ error: "Setting key required" }, { status: 400 });
        }

        const supabase = getSupabaseAdmin();

        // Get current value to delete associated file
        const { data: currentSetting } = await supabase
            .from("app_settings")
            .select("value")
            .eq("key", key)
            .single();

        // Delete associated file if it's a URL
        if (currentSetting?.value && key === "payment_qr_url") {
            try {
                const url = new URL(currentSetting.value);
                const pathParts = url.pathname.split(`/storage/v1/object/public/${SETTINGS_BUCKET}/`);
                if (pathParts.length > 1) {
                    await deleteImage({
                        bucket: SETTINGS_BUCKET,
                        filePath: pathParts[1],
                    });
                }
            } catch (deleteError) {
                console.warn("Failed to delete file:", deleteError);
            }
        }

        // Update setting to null
        const { error } = await supabase
            .from("app_settings")
            .update({ value: null, updated_at: new Date().toISOString() })
            .eq("key", key);

        if (error) {
            console.error("Failed to delete setting:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Revalidate settings cache
        revalidateSettings();

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Internal server error";
        console.error("DELETE /api/admin/settings error:", message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
