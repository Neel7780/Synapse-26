import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/imageUtil";

/**
 * POST /api/events/upload-screenshot
 * Uploads a payment screenshot for event registration and returns the public URL
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file provided" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: "File too large. Maximum size is 5MB." },
                { status: 400 }
            );
        }

        // Upload to Supabase Storage
        const uploadResult = await uploadImage({
            file,
            bucket: "payment-screenshots",
            folder: "events",
        });

        return NextResponse.json({
            success: true,
            url: uploadResult.publicUrl,
            path: uploadResult.path,
        });
    } catch (error: unknown) {
        console.error("Error uploading screenshot:", error);
        const message = error instanceof Error ? error.message : "Failed to upload screenshot";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
