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
            transaction_id, // New field
            registered_by_user_id
        } = await request.json();

        // Validate required fields
        if (!event_id || !fee_id || !registered_by_user_id) {
            return NextResponse.json(
                { error: "event_id, fee_id, and registered_by_user_id are required" },
                { status: 400 }
            );
        }

        // Initialize Supabase client
        const supabase = getSupabaseServer();

        // Fetch event details to check is_dau_free
        const { data: eventData, error: eventError } = await supabase
            .from("event")
            .select("is_dau_free")
            .eq("event_id", event_id)
            .single();

        if (eventError || !eventData) {
            return NextResponse.json(
                { error: "Event not found" },
                { status: 404 }
            );
        }

        // Fetch user details to check email
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("email")
            .eq("user_id", registered_by_user_id)
            .single();

        if (userError || !userData) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const isDauFree = eventData.is_dau_free;
        const isDauStudent = userData.email?.endsWith("@dau.ac.in");

        // Check if all team members are also from DAU
        const areAllTeamMembersDau =
            !team_member_emails ||
            team_member_emails.length === 0 ||
            team_member_emails.every((email: string) => email && email.toLowerCase().trim().endsWith("@dau.ac.in"));

        // Get fee details to calculate amount and check for free event
        const { data: feeData, error: feeError } = await supabase
            .from("fee")
            .select("price, participation_type")
            .eq("fee_id", fee_id)
            .single();

        // Validate that the fee exists
        if (feeError || !feeData) {
            console.error("Fee not found:", feeError);
            return NextResponse.json(
                { error: `Invalid fee_id: ${fee_id}. The selected participation type may no longer be available.` },
                { status: 400 }
            );
        }

        // Validate that the fee is actually linked to this event
        const { data: eventFeeLink, error: eventFeeLinkError } = await supabase
            .from("event_fee")
            .select("event_id, fee_id")
            .eq("event_id", event_id)
            .eq("fee_id", fee_id)
            .maybeSingle();

        if (eventFeeLinkError) {
            console.error("Error checking fee-event link:", eventFeeLinkError);
            return NextResponse.json(
                { error: `Error validating participation type. Please try again.` },
                { status: 500 }
            );
        }

        if (!eventFeeLink) {
            console.error(`Fee ${fee_id} is not linked to event ${event_id}`);
            // Double-check: fetch all available fees for this event to provide helpful error
            const { data: availableFees } = await supabase
                .from("event_fee")
                .select("fee_id")
                .eq("event_id", event_id);
            
            const availableFeeIds = availableFees?.map(f => f.fee_id) || [];
            console.error(`Available fee_ids for event ${event_id}:`, availableFeeIds);
            
            return NextResponse.json(
                { error: `This participation type (fee_id: ${fee_id}) is not available for this event. Please refresh the page and try again.` },
                { status: 400 }
            );
        }

        const isFreeEvent = feeData.price === 0;
        const isFreeRegistration = (isDauFree && isDauStudent && areAllTeamMembersDau) || isFreeEvent;

        if (!isFreeRegistration) {
            if (!payment_screenshot_url || !payment_screenshot_url.trim()) {
                return NextResponse.json(
                    { error: "Payment screenshot URL is required" },
                    { status: 400 }
                );
            }

            if (!transaction_id || !transaction_id.trim()) {
                return NextResponse.json(
                    { error: "Transaction ID is required" },
                    { status: 400 }
                );
            }
        }

        // Create the registration
        const { data: registration, error: regError } = await supabase
            .from("event_registrations")
            .insert({
                event_id,
                fee_id,
                registered_by_user_id,
                payment_screenshot_url: isFreeRegistration ? (isDauFree && isDauStudent ? "DAU_VERIFIED" : "FREE_EVENT") : payment_screenshot_url.trim(),
                transaction_id: isFreeRegistration
                    ? (isDauFree && isDauStudent ? `DAU_FREE_${registered_by_user_id}_${Date.now()}` : `FREE_EVENT_${registered_by_user_id}_${Date.now()}`)
                    : transaction_id.trim(),
                payment_status: "done",
                gross_amount: isFreeRegistration ? 0 : (feeData?.price || 0),
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
    } catch (error: unknown) {
        console.error("Error in register:", error);
        const message = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
