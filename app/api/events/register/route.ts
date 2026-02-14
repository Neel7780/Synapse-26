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

        // --------------------------------------------------------------------------------
        // TEAM & MEMBER RESOLUTION LOGIC
        // --------------------------------------------------------------------------------

        let memberUserIds: string[] = [registered_by_user_id]; // Start with the registrar

        // If there are additional team members, resolve their emails to user_ids
        if (team_member_emails && team_member_emails.length > 0) {
            const cleanEmails = team_member_emails
                .map((e: string) => e.toLowerCase().trim())
                .filter((e: string) => e !== userData.email?.toLowerCase().trim()); // Exclude registrar if listed

            if (cleanEmails.length > 0) {
                const { data: memberUsers, error: memberUsersError } = await supabase
                    .from("users")
                    .select("user_id, email")
                    .in("email", cleanEmails);

                if (memberUsersError) {
                    console.error("Error fetching team members:", memberUsersError);
                    return NextResponse.json(
                        { error: "Failed to validate team members" },
                        { status: 500 }
                    );
                }

                // Check if all emails were found
                const foundEmails = new Set(memberUsers?.map(u => u.email.toLowerCase()) || []);
                const missingEmails = cleanEmails.filter((e: string) => !foundEmails.has(e));

                if (missingEmails.length > 0) {
                    return NextResponse.json(
                        { error: `The following users are not registered: ${missingEmails.join(", ")}` },
                        { status: 400 }
                    );
                }

                // Add found user_ids to the list
                if (memberUsers) {
                    memberUserIds = [...memberUserIds, ...memberUsers.map(u => u.user_id)];
                }
            }
        }

        // --------------------------------------------------------------------------------
        // TRANSACTIONAL REGISTRATION VIA RPC
        // --------------------------------------------------------------------------------

        // Call the PostgreSQL function to handle all inserts in a transaction
        // @ts-expect-error - RPC function not yet in generated types
        const { data: rpcResult, error: rpcError } = await supabase.rpc('register_team', {
            p_event_id: event_id,
            p_fee_id: fee_id,
            p_registered_by_user_id: registered_by_user_id,
            p_payment_screenshot_url: isFreeRegistration ? (isDauFree && isDauStudent ? "DAU_VERIFIED" : "FREE_EVENT") : payment_screenshot_url.trim(),
            p_transaction_id: isFreeRegistration
                ? (isDauFree && isDauStudent ? `DAU_FREE_${registered_by_user_id}_${Date.now()}` : `FREE_EVENT_${registered_by_user_id}_${Date.now()}`)
                : transaction_id.trim(),
            p_payment_status: "done",
            p_gross_amount: isFreeRegistration ? 0 : (feeData?.price || 0),
            p_team_member_user_ids: memberUserIds
        });

        if (rpcError) {
            console.error("Error in register_team RPC:", rpcError);
            return NextResponse.json(
                { error: "Failed to process registration: " + rpcError.message },
                { status: 500 }
            );
        }

        // Check the result from the function (it returns JSON)
        // The function returns { success: boolean, registration_id: ..., team_id: ..., error: ... }
        // Note: supabase.rpc returns `data` as the return value of the function.
        // If function returns json, `data` is that json.

        // However, Supabase RPC typing can be tricky.
        // Let's assume successful execution if rpcError is null, but check specific success flag if mapped.
        // Casting to any to avoid strict type issues with custom RPC return types if not generated yet.
        const result = rpcResult as any;

        if (result && result.success === false) {
            console.error("RPC Logic Error:", result.error);
            if (result.error && typeof result.error === 'string' && result.error.includes("event_registrations_transaction_id_key")) {
                return NextResponse.json(
                    { error: "This Transaction ID has already been used." },
                    { status: 409 }
                );
            }
            return NextResponse.json(
                { error: "Registration failed: " + result.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            registration_id: result?.registration_id,
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
