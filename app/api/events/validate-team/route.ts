import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * POST /api/events/validate-team
 * Validates that all team member emails exist in the users table
 */
export async function POST(request: NextRequest) {
    try {
        const { emails } = await request.json();

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return NextResponse.json(
                { error: "emails array is required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Query users table for all provided emails
        const { data: existingUsers, error } = await supabase
            .from("users")
            .select("email")
            .in("email", emails.map((e: string) => e.toLowerCase().trim()));

        if (error) {
            console.error("Error validating emails:", error);
            return NextResponse.json(
                { error: "Failed to validate emails" },
                { status: 500 }
            );
        }

        // Find which emails are valid (exist in database)
        const existingEmails = new Set(
            existingUsers?.map((u) => u.email.toLowerCase()) || []
        );

        // Find invalid emails (not in database)
        const invalidEmails = emails.filter(
            (email: string) => !existingEmails.has(email.toLowerCase().trim())
        );

        if (invalidEmails.length > 0) {
            return NextResponse.json({
                valid: false,
                invalidEmails,
                message: `The following emails are not registered: ${invalidEmails.join(", ")}. All team members must have an account.`
            });
        }

        return NextResponse.json({
            valid: true,
            invalidEmails: [],
            message: "All team members are registered"
        });
    } catch (error: unknown) {
        console.error("Error in validate-team:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
