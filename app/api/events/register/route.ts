import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";

/**
 * POST /api/events/register
 * Creates an event registration with team members and payment screenshot
 */
export async function POST(request: NextRequest) {
    try {
        const {
            event_id,
            fee_id,
            team_member_emails,
            payment_screenshot_url,
            registered_by_user_id
        } = await request.json();

        // Validate required fields
        if (!event_id || !fee_id || !registered_by_user_id) {
            return NextResponse.json(
                { error: "event_id, fee_id, and registered_by_user_id are required" },
                { status: 400 }
            );
        }

        if (!payment_screenshot_url || !payment_screenshot_url.trim()) {
            return NextResponse.json(
                { error: "Payment screenshot URL is required" },
                { status: 400 }
            );
        }

        const supabase = getSupabaseServer();

        // Get fee details to calculate amount
        const { data: feeData, error: feeError } = await supabase
            .from("fee")
            .select("price, participation_type")
            .eq("fee_id", fee_id)
            .single();

        if (feeError || !feeData) {
            // Fee not found in DB - use price from request if available
            console.log("Fee not found, using default");
        }

        // Create the registration
        // Note: Using 'pending' status. Run SQL to add 'payment_pending' enum value if needed.
        const { data: registration, error: regError } = await supabase
            .from("event_registrations")
            .insert({
                event_id,
                fee_id,
                registered_by_user_id,
                payment_screenshot_url: payment_screenshot_url.trim(),
                payment_status: "pending" as const,
                gross_amount: feeData?.price || 0,
                registration_date: new Date().toISOString(),
            })
            .select("registration_id")
            .single();

        if (regError) {
            console.error("Error creating registration:", regError);
            return NextResponse.json(
                { error: "Failed to create registration: " + regError.message },
                { status: 500 }
            );
        }

        // Log team member emails for now - team association to be implemented
        if (team_member_emails && team_member_emails.length > 0) {
            console.log("Team members for registration", registration.registration_id, ":", team_member_emails);
            // TODO: Implement team member association when schema is finalized
        }

        return NextResponse.json({
            success: true,
            registration_id: registration.registration_id,
            message: "Registration submitted successfully! Your payment is pending verification."
        });
    } catch (error: any) {
        console.error("Error in register:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
